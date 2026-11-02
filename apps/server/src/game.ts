// すれちがいの照合、旅人（移動距離ボーナス）、レベルの計算

import {
  AVATAR_COUNT,
  DAILY_ENCOUNTER_CAP,
  JOBS,
  MATCH_WINDOW_MS,
  MAX_STEPS_PER_DAY,
  TRAVELER_NAMES,
  geohashDistanceMeters,
  geohashNeighbors,
  isPlausibleMove,
  jstDate,
  levelFromCount,
  travelersFor,
} from '@pieris/shared';
import type { config, UserRow } from './env';
import { random, randomId, randomInt } from './util';

type Config = ReturnType<typeof config>;

/** 照合する相手の候補の最大数（D1のパラメータ上限100に収めるため） */
const CANDIDATE_LIMIT = 40;

/** 累計人数（届いたすれちがい＋旅人）。配信待ちは数えない */
export async function totalCount(db: D1Database, userId: string, now: number): Promise<number> {
  const r = await db
    .prepare('SELECT COUNT(*) AS n FROM encounters WHERE user_id = ? AND visible_at <= ?')
    .bind(userId, now)
    .first<{ n: number }>();
  return r?.n ?? 0;
}

export async function currentLevel(db: D1Database, userId: string, now: number): Promise<number> {
  return levelFromCount(await totalCount(db, userId, now));
}

/** その日に作られた（配信待ちを含む）実在の人とのすれちがいの数。上限の判定用 */
async function dailyEncounterCount(db: D1Database, userId: string, date: string): Promise<number> {
  const r = await db
    .prepare('SELECT COUNT(*) AS n FROM encounters WHERE user_id = ? AND met_date = ? AND npc = 0')
    .bind(userId, date)
    .first<{ n: number }>();
  return r?.n ?? 0;
}

function placeholders(n: number): string {
  return Array.from({ length: n }, () => '?').join(',');
}

function delay(cfg: Config): number {
  return Math.round(cfg.delayMin + (cfg.delayMax - cfg.delayMin) * random());
}

/**
 * 位置記録を元に、近くにいた人とのすれちがいを作る。
 * 自分のマス＋周囲8マスに、直近2時間以内にいた人が対象。相手が後から来た場合は、相手の送信時に照合される。
 */
export async function matchEncounters(
  db: D1Database,
  cfg: Config,
  me: UserRow,
  cell: string,
  now: number,
): Promise<number> {
  const date = jstDate(now);
  let myRemaining = DAILY_ENCOUNTER_CAP - (await dailyEncounterCount(db, me.id, date));
  if (myRemaining <= 0) return 0;

  const cells = geohashNeighbors(cell);
  const near = await db
    .prepare(
      `SELECT user_id, MAX(ts) AS ts FROM pings
       WHERE cell7 IN (${placeholders(cells.length)}) AND ts >= ? AND ts <= ? AND user_id != ?
       GROUP BY user_id ORDER BY ts DESC LIMIT ${CANDIDATE_LIMIT}`,
    )
    .bind(...cells, now - MATCH_WINDOW_MS, now, me.id)
    .all<{ user_id: string; ts: number }>();
  const ids = near.results.map((r) => r.user_id);
  if (ids.length === 0) return 0;
  const ph = placeholders(ids.length);

  const [blocked, metToday, counts, profiles, totals] = await db.batch([
    db
      .prepare(
        `SELECT blocked_id AS id FROM blocks WHERE user_id = ? AND blocked_id IN (${ph})
         UNION SELECT user_id AS id FROM blocks WHERE blocked_id = ? AND user_id IN (${ph})`,
      )
      .bind(me.id, ...ids, me.id, ...ids),
    db
      .prepare(`SELECT other_id AS id FROM encounters WHERE user_id = ? AND met_date = ? AND other_id IN (${ph})`)
      .bind(me.id, date, ...ids),
    db
      .prepare(
        `SELECT user_id AS id, COUNT(*) AS n FROM encounters
         WHERE met_date = ? AND npc = 0 AND user_id IN (${ph}) GROUP BY user_id`,
      )
      .bind(date, ...ids),
    db
      .prepare(`SELECT id, name, avatar, job FROM users WHERE id IN (${ph}) AND name IS NOT NULL AND job IS NOT NULL`)
      .bind(...ids),
    db
      .prepare(
        `SELECT user_id AS id, COUNT(*) AS n FROM encounters
         WHERE user_id IN (${ph}) AND visible_at <= ? GROUP BY user_id`,
      )
      .bind(...ids, now),
  ]);

  const blockedSet = new Set((blocked!.results as { id: string }[]).map((r) => r.id));
  const metSet = new Set((metToday!.results as { id: string }[]).map((r) => r.id));
  const dailyCounts = new Map((counts!.results as { id: string; n: number }[]).map((r) => [r.id, r.n]));
  const profileMap = new Map(
    (profiles!.results as { id: string; name: string; avatar: number; job: string }[]).map((r) => [r.id, r]),
  );
  const totalMap = new Map((totals!.results as { id: string; n: number }[]).map((r) => [r.id, r.n]));

  const myLevel = await currentLevel(db, me.id, now);
  const statements: D1PreparedStatement[] = [];
  const insert = db.prepare(
    `INSERT OR IGNORE INTO encounters
     (id, user_id, other_id, npc, name, avatar, job, level, met_date, created_at, visible_at)
     VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
  );
  let created = 0;
  for (const otherId of ids) {
    if (myRemaining <= 0) break;
    if (blockedSet.has(otherId) || metSet.has(otherId)) continue;
    if ((dailyCounts.get(otherId) ?? 0) >= DAILY_ENCOUNTER_CAP) continue;
    const other = profileMap.get(otherId);
    if (!other) continue;
    const otherLevel = levelFromCount(totalMap.get(otherId) ?? 0);
    // 自分に届く相手のカード
    statements.push(
      insert.bind(randomId(), me.id, otherId, other.name, other.avatar, other.job, otherLevel, date, now, now + delay(cfg)),
    );
    // 相手に届く自分のカード（届く時刻は別々にずらす）
    statements.push(
      insert.bind(randomId(), otherId, me.id, me.name, me.avatar, me.job, myLevel, date, now, now + delay(cfg)),
    );
    myRemaining--;
    created++;
  }
  if (statements.length > 0) await db.batch(statements);
  return created;
}

async function ensureBonusRow(db: D1Database, userId: string, date: string) {
  await db
    .prepare('INSERT INTO bonuses (user_id, date) VALUES (?, ?) ON CONFLICT (user_id, date) DO NOTHING')
    .bind(userId, date)
    .run();
}

/** 歩数と移動距離に応じた旅人を、まだ加えていない分だけ加える。加えた人数を返す */
export async function grantTravelers(db: D1Database, userId: string, date: string, now: number): Promise<number> {
  const row = await db
    .prepare('SELECT steps, distance_m, travelers FROM bonuses WHERE user_id = ? AND date = ?')
    .bind(userId, date)
    .first<{ steps: number; distance_m: number; travelers: number }>();
  if (!row) return 0;
  const target = travelersFor(row.steps, row.distance_m);
  const delta = target - row.travelers;
  if (delta <= 0) return 0;
  // 同時に来たリクエストで二重に加えないよう、件数を条件付きで更新できた時だけ加える
  const res = await db
    .prepare('UPDATE bonuses SET travelers = ? WHERE user_id = ? AND date = ? AND travelers = ?')
    .bind(target, userId, date, row.travelers)
    .run();
  if (res.meta.changes !== 1) return 0;

  const level = await currentLevel(db, userId, now);
  const insert = db.prepare(
    `INSERT INTO encounters
     (id, user_id, other_id, npc, name, avatar, job, level, met_date, created_at, visible_at)
     VALUES (?, ?, NULL, 1, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const statements = Array.from({ length: delta }, () =>
    insert.bind(
      randomId(),
      userId,
      `旅人${TRAVELER_NAMES[randomInt(TRAVELER_NAMES.length)]}`,
      randomInt(AVATAR_COUNT),
      JOBS[randomInt(JOBS.length)]!,
      level,
      date,
      now,
      now,
    ),
  );
  await db.batch(statements);
  return delta;
}

export interface PingResult {
  accepted: boolean;
  retryAfterMs?: number;
  addedDistanceMeters: number;
  newTravelers: number;
}

/** 位置の送信: 移動距離の加算 → 記録 → すれちがいの照合 → 旅人の付与 */
export async function recordPing(
  db: D1Database,
  cfg: Config,
  me: UserRow,
  cell: string,
  now: number,
): Promise<PingResult> {
  if (me.last_ping_at !== null && now - me.last_ping_at < cfg.pingInterval) {
    return {
      accepted: false,
      retryAfterMs: cfg.pingInterval - (now - me.last_ping_at),
      addedDistanceMeters: 0,
      newTravelers: 0,
    };
  }
  const date = jstDate(now);
  await ensureBonusRow(db, me.id, date);

  // アプリを開いた地点どうしの直線距離（乗り物込み）。時速400kmを超える区間は数えない
  let added = 0;
  if (me.last_ping_cell && me.last_ping_at !== null) {
    const d = Math.round(geohashDistanceMeters(me.last_ping_cell, cell));
    if (d > 0 && isPlausibleMove(d, now - me.last_ping_at)) added = d;
  }

  await db.batch([
    db.prepare('INSERT INTO pings (user_id, cell7, ts) VALUES (?, ?, ?)').bind(me.id, cell, now),
    db.prepare('UPDATE users SET last_ping_at = ?, last_ping_cell = ? WHERE id = ?').bind(now, cell, me.id),
    db
      .prepare('UPDATE bonuses SET distance_m = distance_m + ? WHERE user_id = ? AND date = ?')
      .bind(added, me.id, date),
  ]);

  await matchEncounters(db, cfg, me, cell, now);
  const newTravelers = await grantTravelers(db, me.id, date, now);
  return { accepted: true, addedDistanceMeters: added, newTravelers };
}

/** 歩数の送信。同じ日の値は大きい方を採る（端末から何度送っても増えすぎない） */
export async function recordSteps(
  db: D1Database,
  userId: string,
  date: string,
  steps: number,
  now: number,
): Promise<{ steps: number; newTravelers: number }> {
  const clamped = Math.max(0, Math.min(MAX_STEPS_PER_DAY, Math.floor(steps)));
  await ensureBonusRow(db, userId, date);
  await db
    .prepare('UPDATE bonuses SET steps = MAX(steps, ?) WHERE user_id = ? AND date = ?')
    .bind(clamped, userId, date)
    .run();
  const row = await db
    .prepare('SELECT steps FROM bonuses WHERE user_id = ? AND date = ?')
    .bind(userId, date)
    .first<{ steps: number }>();
  const newTravelers = await grantTravelers(db, userId, date, now);
  return { steps: row?.steps ?? clamped, newTravelers };
}
