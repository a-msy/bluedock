import {
  AVATAR_COUNT,
  type BattleSetup,
  DAILY_ENCOUNTER_CAP,
  DAILY_TRAVELER_CAP,
  type FinishAdventureResponse,
  GEOHASH_PRECISION,
  type HelperCard,
  type HelpersResponse,
  type HelperSnapshot,
  type Job,
  type MeResponse,
  PARTY_HELPER_MAX,
  PING_RETENTION_MS,
  type PingRequest,
  type ProfileRequest,
  ReplayError,
  type StartAdventureRequest,
  type StartAdventureResponse,
  type StepsRequest,
  getArea,
  isJob,
  isValidGeohash,
  jstDate,
  levelProgress,
  previousDate,
  replayBattle,
  validateDisplayName,
} from '@pieris/shared';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { type AppEnv, type EncounterRow, type Env, type UserRow, config } from './env';
import { currentLevel, recordPing, recordSteps, totalCount } from './game';
import { ApiError, bad, randomId, randomSeed, randomToken, readJson, sha256Hex } from './util';

const app = new Hono<AppEnv>();

app.use('*', cors({ origin: '*', allowHeaders: ['Authorization', 'Content-Type'], allowMethods: ['GET', 'POST', 'PUT', 'DELETE'] }));

// 現在時刻（テスト時だけ x-debug-now で差し替えられる）
app.use('*', async (c, next) => {
  let now = Date.now();
  const debug = c.req.header('x-debug-now');
  if (debug && config(c.env).debugTime) {
    const n = Number(debug);
    if (Number.isFinite(n)) now = n;
  }
  c.set('now', now);
  await next();
});

app.onError((err, c) => {
  if (err instanceof ApiError) return c.json({ error: err.code, message: err.message }, err.status);
  if (err instanceof HTTPException) return c.json({ error: 'http_error', message: err.message }, err.status);
  console.error(err);
  return c.json({ error: 'internal', message: 'サーバーでエラーが起きました。時間をおいて試してください' }, 500);
});

app.get('/health', (c) => c.json({ ok: true }));

// 端末ごとの匿名アカウントを作る
app.post('/v1/register', async (c) => {
  const token = randomToken();
  await c.env.DB.prepare('INSERT INTO users (id, token_hash, avatar, created_at) VALUES (?, ?, 0, ?)')
    .bind(randomId(), await sha256Hex(token), c.get('now'))
    .run();
  return c.json({ token }, 201);
});

// ここから先は認証が要る
app.use('/v1/*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? '';
  const m = /^Bearer\s+(\S+)$/.exec(auth);
  if (!m) throw new ApiError(401, 'unauthorized', 'もう一度アプリを開き直してください');
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE token_hash = ?')
    .bind(await sha256Hex(m[1]!))
    .first<UserRow>();
  if (!user) throw new ApiError(401, 'unauthorized', 'もう一度アプリを開き直してください');
  c.set('user', user);
  await next();
});

function requireProfile(user: UserRow): asserts user is UserRow & { name: string; job: Job } {
  if (!user.name || !isJob(user.job)) {
    throw new ApiError(409, 'profile_required', '先に名前とジョブを決めてください');
  }
}

app.get('/v1/me', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const now = c.get('now');
  const date = jstDate(now);
  const [count, today, bonus, available] = await Promise.all([
    totalCount(db, user.id, now),
    db
      .prepare('SELECT COUNT(*) AS n FROM encounters WHERE user_id = ? AND met_date = ? AND npc = 0 AND visible_at <= ?')
      .bind(user.id, date, now)
      .first<{ n: number }>(),
    db
      .prepare('SELECT steps, distance_m, travelers FROM bonuses WHERE user_id = ? AND date = ?')
      .bind(user.id, date)
      .first<{ steps: number; distance_m: number; travelers: number }>(),
    db
      .prepare('SELECT COUNT(*) AS n FROM encounters WHERE user_id = ? AND visible_at <= ? AND used_at IS NULL')
      .bind(user.id, now)
      .first<{ n: number }>(),
  ]);
  const body: MeResponse = {
    name: user.name,
    avatar: user.avatar,
    job: isJob(user.job) ? user.job : null,
    progress: levelProgress(count),
    clearedArea: user.cleared_area,
    today: {
      date,
      encounters: today?.n ?? 0,
      encounterCap: DAILY_ENCOUNTER_CAP,
      travelers: bonus?.travelers ?? 0,
      travelerCap: DAILY_TRAVELER_CAP,
      steps: bonus?.steps ?? 0,
      distanceMeters: bonus?.distance_m ?? 0,
    },
    available: available?.n ?? 0,
  };
  return c.json(body);
});

// 名前・アバターの変更。ジョブは最初の1回だけ決められる
app.put('/v1/me', async (c) => {
  const user = c.get('user');
  const body = await readJson<ProfileRequest>(c.req.raw);
  const sets: string[] = [];
  const values: (string | number)[] = [];
  if (body.name !== undefined) {
    const check = validateDisplayName(body.name);
    if (!check.ok) throw bad('invalid_name', check.reason);
    sets.push('name = ?');
    values.push(check.name);
  }
  if (body.avatar !== undefined) {
    if (!Number.isInteger(body.avatar) || body.avatar < 0 || body.avatar >= AVATAR_COUNT) {
      throw bad('invalid_avatar', 'アバターの指定が正しくありません');
    }
    sets.push('avatar = ?');
    values.push(body.avatar);
  }
  if (body.job !== undefined) {
    if (!isJob(body.job)) throw bad('invalid_job', 'ジョブの指定が正しくありません');
    if (user.job && user.job !== body.job) throw new ApiError(409, 'job_locked', 'ジョブはあとから変えられません');
    sets.push('job = ?');
    values.push(body.job);
  }
  if (sets.length > 0) {
    await c.env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...values, user.id).run();
  }
  return c.json({ ok: true });
});

// アカウントと記録をすべて消す
app.delete('/v1/me', async (c) => {
  const db = c.env.DB;
  const id = c.get('user').id;
  await db.batch([
    db.prepare('DELETE FROM pings WHERE user_id = ?').bind(id),
    db.prepare('DELETE FROM encounters WHERE user_id = ?').bind(id),
    // 相手の手元にある自分のカード: 未使用のものは消し、使用済みのものは自分との紐付けだけ外す
    db.prepare('DELETE FROM encounters WHERE other_id = ? AND used_at IS NULL').bind(id),
    db.prepare('UPDATE encounters SET other_id = NULL WHERE other_id = ?').bind(id),
    db.prepare('DELETE FROM bonuses WHERE user_id = ?').bind(id),
    db.prepare('DELETE FROM adventures WHERE user_id = ?').bind(id),
    db.prepare('DELETE FROM blocks WHERE user_id = ? OR blocked_id = ?').bind(id, id),
    db.prepare('DELETE FROM users WHERE id = ?').bind(id),
  ]);
  return c.json({ ok: true });
});

// 位置の送信: 7桁のジオハッシュだけを受け取る
app.post('/v1/ping', async (c) => {
  const user = c.get('user');
  requireProfile(user);
  const body = await readJson<PingRequest>(c.req.raw);
  const cell = typeof body.cell === 'string' ? body.cell : '';
  if (!isValidGeohash(cell, GEOHASH_PRECISION)) throw bad('invalid_cell', '位置の形式が正しくありません');
  const result = await recordPing(c.env.DB, config(c.env), user, cell, c.get('now'));
  return c.json(result);
});

// 歩数の送信（今日か昨日の分）
app.post('/v1/steps', async (c) => {
  const user = c.get('user');
  requireProfile(user);
  const body = await readJson<StepsRequest>(c.req.raw);
  const now = c.get('now');
  const today = jstDate(now);
  if (body.date !== today && body.date !== previousDate(today)) {
    throw bad('invalid_date', '今日か昨日の歩数だけ送れます');
  }
  if (typeof body.steps !== 'number' || !Number.isFinite(body.steps) || body.steps < 0) {
    throw bad('invalid_steps', '歩数の形式が正しくありません');
  }
  return c.json(await recordSteps(c.env.DB, user.id, body.date, body.steps, now));
});

function toSnapshot(e: EncounterRow): HelperSnapshot {
  return { id: e.id, name: e.name, job: e.job as Job, level: e.level, avatar: e.avatar, npc: e.npc === 1 };
}

// 届いていて、まだ使っていない助っ人
app.get('/v1/helpers', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const now = c.get('now');
  const rows = await db
    .prepare(
      `SELECT * FROM encounters WHERE user_id = ? AND visible_at <= ? AND used_at IS NULL
       ORDER BY visible_at DESC LIMIT 200`,
    )
    .bind(user.id, now)
    .all<EncounterRow>();
  const helpers: HelperCard[] = rows.results.map((e) => ({
    ...toSnapshot(e),
    metDate: e.met_date,
    isNew: e.opened_at === null,
  }));
  if (helpers.some((h) => h.isNew)) {
    await db
      .prepare('UPDATE encounters SET opened_at = ? WHERE user_id = ? AND visible_at <= ? AND opened_at IS NULL')
      .bind(now, user.id, now)
      .run();
  }
  const body: HelpersResponse = { helpers };
  return c.json(body);
});

// 冒険に出る: 連れて行く助っ人はここで使い切り
app.post('/v1/adventures', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  requireProfile(user);
  const now = c.get('now');
  const body = await readJson<StartAdventureRequest>(c.req.raw);
  const areaId = body.areaId;
  if (typeof areaId !== 'number' || !Number.isInteger(areaId)) throw bad('invalid_area', 'エリアの指定が正しくありません');
  const area = getArea(areaId);
  if (!area) throw bad('invalid_area', 'エリアの指定が正しくありません');
  if (areaId > user.cleared_area + 1) throw new ApiError(403, 'area_locked', 'まだこのエリアには行けません');

  const helperIds = Array.isArray(body.helperIds) ? body.helperIds : [];
  if (!helperIds.every((id): id is string => typeof id === 'string')) throw bad('invalid_helpers', '助っ人の指定が正しくありません');
  const unique = [...new Set(helperIds)];
  if (unique.length !== helperIds.length || unique.length > PARTY_HELPER_MAX) {
    throw bad('invalid_helpers', `助っ人は${PARTY_HELPER_MAX}人まで連れて行けます`);
  }

  let helpers: EncounterRow[] = [];
  if (unique.length > 0) {
    const ph = unique.map(() => '?').join(',');
    const rows = await db
      .prepare(`SELECT * FROM encounters WHERE id IN (${ph}) AND user_id = ? AND visible_at <= ? AND used_at IS NULL`)
      .bind(...unique, user.id, now)
      .all<EncounterRow>();
    helpers = unique.map((id) => rows.results.find((r) => r.id === id)).filter((r): r is EncounterRow => !!r);
    if (helpers.length !== unique.length) throw new ApiError(409, 'helper_unavailable', 'その助っ人はもういません');
  }

  const adventureId = randomId();
  // 助っ人を使い切りにする。同時に別の冒険で使われていたら取り消す
  if (helpers.length > 0) {
    const ph = unique.map(() => '?').join(',');
    const res = await db
      .prepare(`UPDATE encounters SET used_at = ?, adventure_id = ? WHERE id IN (${ph}) AND user_id = ? AND used_at IS NULL`)
      .bind(now, adventureId, ...unique, user.id)
      .run();
    if (res.meta.changes !== unique.length) {
      await db.prepare('UPDATE encounters SET used_at = NULL, adventure_id = NULL WHERE adventure_id = ?').bind(adventureId).run();
      throw new ApiError(409, 'helper_unavailable', 'その助っ人はもういません');
    }
  }

  const setup: BattleSetup = {
    areaId,
    player: { name: user.name, job: user.job, level: await currentLevel(db, user.id, now), avatar: user.avatar },
    helpers: helpers.map(toSnapshot),
  };
  const seed = randomSeed();
  await db.batch([
    db
      .prepare("UPDATE adventures SET status = 'abandoned', finished_at = ? WHERE user_id = ? AND status = 'ongoing'")
      .bind(now, user.id),
    db
      .prepare("INSERT INTO adventures (id, user_id, area_id, seed, setup, status, created_at) VALUES (?, ?, ?, ?, ?, 'ongoing', ?)")
      .bind(adventureId, user.id, areaId, seed, JSON.stringify(setup), now),
  ]);
  const res: StartAdventureResponse = { adventureId, seed, setup };
  return c.json(res, 201);
});

// 冒険の終わり: 行動の列を同じシードで再生して勝敗を確かめる
app.post('/v1/adventures/:id/finish', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const now = c.get('now');
  const adv = await db
    .prepare('SELECT * FROM adventures WHERE id = ? AND user_id = ?')
    .bind(c.req.param('id'), user.id)
    .first<{ id: string; area_id: number; seed: number; setup: string; status: string }>();
  if (!adv) throw new ApiError(404, 'not_found', 'その冒険は見つかりません');
  if (adv.status !== 'ongoing') throw new ApiError(409, 'already_finished', 'この冒険はもう終わっています');

  const body = await readJson<{ actions: unknown[] }>(c.req.raw);
  let status: FinishAdventureResponse['status'];
  try {
    status = replayBattle(JSON.parse(adv.setup) as BattleSetup, adv.seed, body.actions as unknown[]).state.status;
  } catch (e) {
    if (e instanceof ReplayError) throw bad('invalid_actions', '冒険の記録が正しくありません');
    throw e;
  }
  if (status === 'ongoing') throw bad('not_finished', '冒険がまだ終わっていません');

  const newlyCleared = status === 'won' && adv.area_id === user.cleared_area + 1;
  const statements = [
    db.prepare('UPDATE adventures SET status = ?, finished_at = ? WHERE id = ?').bind(status, now, adv.id),
  ];
  if (newlyCleared) {
    statements.push(
      db.prepare('UPDATE users SET cleared_area = ? WHERE id = ? AND cleared_area = ?').bind(adv.area_id, user.id, user.cleared_area),
    );
  }
  await db.batch(statements);
  const res: FinishAdventureResponse = {
    status,
    clearedArea: newlyCleared ? adv.area_id : user.cleared_area,
    newlyCleared,
  };
  return c.json(res);
});

async function findOtherOf(c: { env: Env; get: (k: 'user') => UserRow }, helperId: unknown) {
  if (typeof helperId !== 'string') throw bad('invalid_helper', '相手の指定が正しくありません');
  const row = await c.env.DB.prepare('SELECT * FROM encounters WHERE id = ? AND user_id = ?')
    .bind(helperId, c.get('user').id)
    .first<EncounterRow>();
  if (!row) throw new ApiError(404, 'not_found', '相手が見つかりません');
  if (!row.other_id) throw bad('npc', '旅人はブロック・通報の対象ではありません');
  return row as EncounterRow & { other_id: string };
}

// ブロック: 以後すれちがわない。配信待ちのカードもお互いに取り消す
app.post('/v1/block', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const now = c.get('now');
  const body = await readJson<{ helperId: string }>(c.req.raw);
  const row = await findOtherOf(c, body.helperId);
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO blocks (user_id, blocked_id, created_at) VALUES (?, ?, ?)').bind(user.id, row.other_id, now),
    db.prepare('DELETE FROM encounters WHERE user_id = ? AND other_id = ? AND used_at IS NULL').bind(user.id, row.other_id),
    db.prepare('DELETE FROM encounters WHERE user_id = ? AND other_id = ? AND visible_at > ?').bind(row.other_id, user.id, now),
  ]);
  return c.json({ ok: true });
});

// 通報: 不適切な名前など
app.post('/v1/report', async (c) => {
  const user = c.get('user');
  const body = await readJson<{ helperId: string; reason: string }>(c.req.raw);
  const row = await findOtherOf(c, body.helperId);
  const reason = typeof body.reason === 'string' ? body.reason.slice(0, 200) : '';
  if (!reason) throw bad('invalid_reason', '通報の理由を選んでください');
  await c.env.DB.prepare(
    'INSERT INTO reports (id, reporter_id, target_id, encounter_id, target_name, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(randomId(), user.id, row.other_id, row.id, row.name, reason, c.get('now'))
    .run();
  return c.json({ ok: true });
});

app.notFound((c) => c.json({ error: 'not_found', message: '見つかりません' }, 404));

/** 定期処理: 48時間を過ぎた位置記録を消し、放置された冒険を閉じる */
export async function cleanup(env: Env, now: number) {
  const cutoff = now - PING_RETENTION_MS;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM pings WHERE ts < ?').bind(cutoff),
    env.DB.prepare('UPDATE users SET last_ping_cell = NULL WHERE last_ping_at < ?').bind(cutoff),
    env.DB.prepare("UPDATE adventures SET status = 'abandoned', finished_at = ? WHERE status = 'ongoing' AND created_at < ?").bind(
      now,
      now - 24 * 3600 * 1000,
    ),
  ]);
}

// テスト用: 定期処理を手で動かす（DEBUG_TIME=1 の時だけ）
app.post('/debug/cleanup', async (c) => {
  if (!config(c.env).debugTime) return c.json({ error: 'not_found', message: '見つかりません' }, 404);
  await cleanup(c.env, c.get('now'));
  return c.json({ ok: true });
});

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(cleanup(env, Date.now()));
  },
} satisfies ExportedHandler<Env>;
