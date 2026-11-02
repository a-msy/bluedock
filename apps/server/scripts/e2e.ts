// サーバーの通しテスト: ローカルの D1 で wrangler dev を起動し、複数の架空プレイヤーで API を叩く。
// 時刻は x-debug-now ヘッダーで動かす（DEBUG_TIME=1 の時だけ有効）。
//   npm run e2e -w @pieris/server

import { type ChildProcess, execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  type BattleSetup,
  type BattleState,
  type HelpersResponse,
  JOB_INFO,
  type MeResponse,
  type PlayerAction,
  type StartAdventureResponse,
  applyAction,
  encodeGeohash,
  startBattle,
} from '@pieris/shared';

const PORT = 8790 + Math.floor(Math.random() * 100);
const BASE = `http://127.0.0.1:${PORT}`;
const HOUR = 3600_000;
const MIN = 60_000;
// 2026-11-02 10:00 JST
const T0 = Date.UTC(2026, 10, 2, 1, 0);

const OKAYAMA = encodeGeohash(34.6665, 133.9179, 7);
const OKAYAMA_NEXT = encodeGeohash(34.6665, 133.9195, 7); // 約150m東
const KURASHIKI = encodeGeohash(34.6013, 133.7666, 7);
const TOKYO = encodeGeohash(35.6812, 139.7671, 7);
const HIROSHIMA = encodeGeohash(34.3963, 132.4596, 7);
const SAPPORO = encodeGeohash(43.0687, 141.3508, 7);

let failures = 0;
let passes = 0;
function check(cond: unknown, msg: string) {
  if (cond) {
    passes++;
    console.log(`  ok   ${msg}`);
  } else {
    failures++;
    console.log(`  FAIL ${msg}`);
  }
}

async function api<T = any>(
  method: string,
  path: string,
  opts: { token?: string; body?: unknown; now?: number } = {},
): Promise<{ status: number; json: T }> {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.now !== undefined ? { 'x-debug-now': String(opts.now) } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

async function newPlayer(name: string, job: string, now = T0): Promise<string> {
  const r = await api<{ token: string }>('POST', '/v1/register', { now });
  const token = r.json.token;
  const p = await api('PUT', '/v1/me', { token, body: { name, job, avatar: 1 }, now });
  if (p.status !== 200) throw new Error(`profile failed: ${JSON.stringify(p.json)}`);
  return token;
}

function policy(s: BattleState): PlayerAction {
  const info = JOB_INFO[s.setup.player.job];
  const alive = s.enemies.flatMap((e, i) => (e.hp > 0 ? [i] : []));
  const weakest = alive.reduce((a, b) => (s.enemies[b]!.hp < s.enemies[a]!.hp ? b : a), alive[0]!);
  if (s.setup.player.job === 'priest') {
    if (s.player.hp < s.player.maxHp * 0.45 && s.player.mp >= info.skillCost) return { type: 'skill' };
    return { type: 'attack', target: weakest };
  }
  if (s.player.mp >= info.skillCost) return { type: 'skill', target: weakest };
  return { type: 'attack', target: weakest };
}

function play(setup: BattleSetup, seed: number): { actions: PlayerAction[]; status: string } {
  let { state } = startBattle(setup, seed);
  const actions: PlayerAction[] = [];
  while (state.status === 'ongoing' && actions.length < 500) {
    const a = policy(state);
    actions.push(a);
    state = applyAction(state, a).state;
  }
  return { actions, status: state.status };
}

async function waitForServer(proc: ChildProcess) {
  const started = Date.now();
  while (Date.now() - started < 90_000) {
    if (proc.exitCode !== null) throw new Error('wrangler dev exited early');
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) return;
    } catch {
      // まだ起動中
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('wrangler dev did not start in time');
}

async function scenarios(persistDir: string) {
  console.log('\n[アカウントとプロフィール]');
  const a = await newPlayer('あゆむ', 'swordsman');
  const b = await newPlayer('べに', 'mage');
  const c = await newPlayer('ちひろ', 'priest');
  check((await api('PUT', '/v1/me', { token: a, body: { name: 'LINE id:abc' } })).status === 400, '連絡先を含む名前は弾く');
  check((await api('PUT', '/v1/me', { token: a, body: { job: 'mage' } })).status === 409, 'ジョブはあとから変えられない');
  check((await api('PUT', '/v1/me', { token: a, body: { job: 'swordsman' } })).status === 200, '同じジョブの再設定は通る');
  check((await api('GET', '/v1/me')).status === 401, 'トークンなしは 401');
  const raw = (await api<{ token: string }>('POST', '/v1/register', { now: T0 })).json.token;
  check((await api('POST', '/v1/ping', { token: raw, body: { cell: OKAYAMA }, now: T0 })).status === 409, '名前とジョブを決める前は位置を送れない');
  check((await api('POST', '/v1/ping', { token: a, body: { cell: 'zzz' }, now: T0 })).status === 400, '形式の違う位置は弾く');

  console.log('\n[すれちがい]');
  const pa = await api('POST', '/v1/ping', { token: a, body: { cell: OKAYAMA }, now: T0 });
  check(pa.status === 200 && pa.json.accepted === true, 'Aの位置送信を受け付ける');
  const pb = await api('POST', '/v1/ping', { token: b, body: { cell: OKAYAMA_NEXT }, now: T0 + 10 * MIN });
  check(pb.json.accepted === true, 'Bが10分後に隣のマスで位置を送る');
  check(!('newEncounters' in pb.json), '位置送信の返事には、すれちがったかどうかを含めない');
  await api('POST', '/v1/ping', { token: c, body: { cell: TOKYO }, now: T0 + 15 * MIN });
  const rate = await api('POST', '/v1/ping', { token: a, body: { cell: OKAYAMA }, now: T0 + 1 * MIN });
  check(rate.json.accepted === false && rate.json.retryAfterMs > 0, '5分以内の再送信は受け付けない');

  const early = await api<HelpersResponse>('GET', '/v1/helpers', { token: a, now: T0 + 30 * MIN });
  check(early.json.helpers.length === 0, 'すれちがいは直後には届かない（遅延）');
  const meEarly = await api<MeResponse>('GET', '/v1/me', { token: a, now: T0 + 30 * MIN });
  check(meEarly.json.progress.count === 0 && meEarly.json.today.encounters === 0, '配信前はレベルにも今日の人数にも出ない');

  const later = T0 + 4 * HOUR;
  const ha = await api<HelpersResponse>('GET', '/v1/helpers', { token: a, now: later });
  const hb = await api<HelpersResponse>('GET', '/v1/helpers', { token: b, now: later });
  const hc = await api<HelpersResponse>('GET', '/v1/helpers', { token: c, now: later });
  check(ha.json.helpers.length === 1 && ha.json.helpers[0]!.name === 'べに', 'AにBが助っ人として届く');
  check(ha.json.helpers[0]!.job === 'mage' && ha.json.helpers[0]!.isNew === true, '相手のジョブが分かり、NEWが付く');
  check(hb.json.helpers.length === 1 && hb.json.helpers[0]!.name === 'あゆむ', 'BにもAが届く');
  check(hc.json.helpers.length === 0, '東京のCとはすれちがわない');
  check(!JSON.stringify(ha.json).includes('other_id') && !JSON.stringify(ha.json).includes(OKAYAMA_NEXT), '相手のIDや位置は返さない');
  const ha2 = await api<HelpersResponse>('GET', '/v1/helpers', { token: a, now: later });
  check(ha2.json.helpers[0]!.isNew === false, '一度見たらNEWが消える');

  const pa2 = await api('POST', '/v1/ping', { token: a, body: { cell: OKAYAMA }, now: T0 + 40 * MIN });
  check(pa2.json.accepted === true, 'Aが同じ場所で再送信');
  const ha3 = await api<HelpersResponse>('GET', '/v1/helpers', { token: a, now: later });
  check(ha3.json.helpers.length === 1, '同じ相手とは1日1回まで');
  const meA = await api<MeResponse>('GET', '/v1/me', { token: a, now: later });
  check(meA.json.progress.count === 1 && meA.json.progress.level === 2, '累計1人でレベル2');

  console.log('\n[1日の上限]');
  const crowd: string[] = [];
  for (let i = 0; i < 12; i++) crowd.push(await newPlayer(`まち${i}`, ['swordsman', 'mage', 'priest', 'dancer'][i % 4]!));
  const T1 = T0 + 1 * HOUR;
  for (let i = 0; i < crowd.length; i++) {
    await api('POST', '/v1/ping', { token: crowd[i], body: { cell: HIROSHIMA }, now: T1 + i * MIN });
  }
  const counts = await Promise.all(
    crowd.map(async (t) => (await api<HelpersResponse>('GET', '/v1/helpers', { token: t, now: T1 + 5 * HOUR })).json.helpers.filter((h) => !h.npc).length),
  );
  check(Math.max(...counts) <= 10, `1人あたり最大10人まで（最大 ${Math.max(...counts)} 人）`);
  check(counts[0] === 10, `最初の人はちょうど10人とすれちがう（${counts[0]} 人）`);

  console.log('\n[移動距離ボーナス]');
  // Aは 10:40 に岡山、11:40 に倉敷（約16km）→ 旅人1人
  const move = await api('POST', '/v1/ping', { token: a, body: { cell: KURASHIKI }, now: T0 + 100 * MIN });
  check(move.json.addedDistanceMeters > 14_000 && move.json.addedDistanceMeters < 18_000, `移動距離 ${move.json.addedDistanceMeters}m を加算`);
  check(move.json.newTravelers === 1, '10kmごとに旅人が1人加わる');
  const warp = await api('POST', '/v1/ping', { token: a, body: { cell: SAPPORO }, now: T0 + 110 * MIN });
  check(warp.json.accepted === true && warp.json.addedDistanceMeters === 0, '10分で札幌（時速400km超）は数えない');
  const steps1 = await api('POST', '/v1/steps', { token: a, body: { date: '2026-11-02', steps: 4500 }, now: T0 + 2 * HOUR });
  check(steps1.json.newTravelers === 2 && steps1.json.steps === 4500, '4,500歩で旅人が2人');
  const steps2 = await api('POST', '/v1/steps', { token: a, body: { date: '2026-11-02', steps: 1000 }, now: T0 + 2 * HOUR });
  check(steps2.json.steps === 4500 && steps2.json.newTravelers === 0, '小さい歩数を送っても減らない');
  const steps3 = await api('POST', '/v1/steps', { token: a, body: { date: '2026-11-02', steps: 99_999 }, now: T0 + 3 * HOUR });
  check(steps3.json.newTravelers === 2, '旅人は1日5人まで（残り2人だけ加わる）');
  check((await api('POST', '/v1/steps', { token: a, body: { date: '2026-10-01', steps: 100 }, now: T0 })).status === 400, '古い日付の歩数は弾く');
  const meA2 = await api<MeResponse>('GET', '/v1/me', { token: a, now: later });
  check(meA2.json.today.travelers === 5 && meA2.json.progress.count === 6, `旅人も累計に入る（累計 ${meA2.json.progress.count}）`);

  console.log('\n[冒険]');
  const helpers = (await api<HelpersResponse>('GET', '/v1/helpers', { token: a, now: later })).json.helpers;
  check(helpers.filter((h) => h.npc).length === 5, '旅人が助っ人一覧に出る');
  const locked = await api('POST', '/v1/adventures', { token: a, body: { areaId: 3, helperIds: [] }, now: later });
  check(locked.status === 403, 'まだ行けないエリアは弾く');
  const tooMany = await api('POST', '/v1/adventures', { token: a, body: { areaId: 1, helperIds: helpers.slice(0, 4).map((h) => h.id) }, now: later });
  check(tooMany.status === 400, '助っ人は3人まで');
  const pick = helpers.slice(0, 3).map((h) => h.id);
  const start = await api<StartAdventureResponse>('POST', '/v1/adventures', { token: a, body: { areaId: 1, helperIds: pick }, now: later });
  check(start.status === 201 && start.json.setup.helpers.length === 3, '助っ人3人と冒険に出る');
  check(start.json.setup.player.level === meA2.json.progress.level, '冒険には今のレベルで出る');
  const reuse = await api('POST', '/v1/adventures', { token: a, body: { areaId: 1, helperIds: [pick[0]] }, now: later });
  check(reuse.status === 409, '使った助っ人はもう連れて行けない');
  const left = (await api<HelpersResponse>('GET', '/v1/helpers', { token: a, now: later })).json.helpers;
  check(left.length === helpers.length - 3, '使った助っ人は一覧から消える');

  // reuse の失敗で新しい冒険は作られていないので、start の冒険を終える
  const run = play(start.json.setup, start.json.seed);
  check(run.status === 'won', 'アプリ側のバトルで勝つ');
  const notDone = await api('POST', `/v1/adventures/${start.json.adventureId}/finish`, { token: a, body: { actions: run.actions.slice(0, 1) }, now: later });
  check(notDone.status === 400, '途中までの記録は受け付けない');
  const bogus = await api('POST', `/v1/adventures/${start.json.adventureId}/finish`, { token: a, body: { actions: [{ type: 'nuke' }] }, now: later });
  check(bogus.status === 400, 'でたらめな行動は弾く');
  const fin = await api('POST', `/v1/adventures/${start.json.adventureId}/finish`, { token: a, body: { actions: run.actions }, now: later });
  check(fin.status === 200 && fin.json.status === 'won' && fin.json.clearedArea === 1 && fin.json.newlyCleared, 'サーバーの再生でも勝ち、エリア1クリア');
  const again = await api('POST', `/v1/adventures/${start.json.adventureId}/finish`, { token: a, body: { actions: run.actions }, now: later });
  check(again.status === 409, '同じ冒険は二度終えられない');

  // 負け（逃げる）
  const s2 = await api<StartAdventureResponse>('POST', '/v1/adventures', { token: a, body: { areaId: 2, helperIds: [] }, now: later });
  check(s2.status === 201, 'エリア2に進める');
  const flee = await api('POST', `/v1/adventures/${s2.json.adventureId}/finish`, { token: a, body: { actions: [{ type: 'flee' }] }, now: later });
  check(flee.json.status === 'fled' && flee.json.clearedArea === 1, '逃げたらクリアにならない');

  console.log('\n[ブロックと通報]');
  const bCards = (await api<HelpersResponse>('GET', '/v1/helpers', { token: b, now: later })).json.helpers;
  const aCard = bCards.find((h) => h.name === 'あゆむ')!;
  check((await api('POST', '/v1/report', { token: b, body: { helperId: aCard.id, reason: '名前が不適切' }, now: later })).status === 200, 'Bが相手を通報できる');
  check((await api('POST', '/v1/block', { token: b, body: { helperId: aCard.id }, now: later })).status === 200, 'BがAをブロック');
  const bAfter = (await api<HelpersResponse>('GET', '/v1/helpers', { token: b, now: later })).json.helpers;
  check(!bAfter.some((h) => h.name === 'あゆむ'), 'ブロックした相手のカードは消える');
  const day2 = T0 + 24 * HOUR;
  await api('POST', '/v1/ping', { token: a, body: { cell: OKAYAMA }, now: day2 });
  await api('POST', '/v1/ping', { token: b, body: { cell: OKAYAMA }, now: day2 + 5 * MIN });
  const aDay2 = (await api<HelpersResponse>('GET', '/v1/helpers', { token: a, now: day2 + 5 * HOUR })).json.helpers;
  check(!aDay2.some((h) => h.name === 'べに' && h.metDate === '2026-11-03'), 'ブロック後は翌日もすれちがわない');
  const npcCard = helpers.find((h) => h.npc && !pick.includes(h.id))!;
  check((await api('POST', '/v1/block', { token: a, body: { helperId: npcCard.id }, now: later })).status === 400, '旅人はブロックの対象外');

  console.log('\n[位置記録の削除]');
  await api('POST', '/debug/cleanup', { now: T0 + 72 * HOUR });
  const left48 = Number(
    execFileSync('npx', ['wrangler', 'd1', 'execute', 'pieris', '--local', '--persist-to', persistDir, '--json', '--command', `SELECT COUNT(*) AS n FROM pings WHERE ts < ${T0 + 24 * HOUR}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).match(/"n":\s*(\d+)/)?.[1] ?? '-1',
  );
  check(left48 === 0, '48時間を過ぎた位置記録は消える');

  console.log('\n[アカウント削除]');
  check((await api('DELETE', '/v1/me', { token: c, now: later })).status === 200, 'Cがアカウントを削除');
  check((await api('GET', '/v1/me', { token: c, now: later })).status === 401, '削除後のトークンは使えない');
}

async function main() {
  const persistDir = mkdtempSync(join(tmpdir(), 'pieris-e2e-'));
  const env = { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1' };
  let proc: ChildProcess | undefined;
  try {
    console.log('ローカルDBを準備しています…');
    execFileSync('npx', ['wrangler', 'd1', 'migrations', 'apply', 'pieris', '--local', '--persist-to', persistDir], {
      stdio: 'ignore',
      env,
    });
    console.log(`wrangler dev を起動しています（port ${PORT}）…`);
    proc = spawn(
      'npx',
      ['wrangler', 'dev', '--port', String(PORT), '--ip', '127.0.0.1', '--persist-to', persistDir, '--var', 'DEBUG_TIME:1', '--show-interactive-dev-session=false'],
      { env, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let log = '';
    proc.stdout?.on('data', (d) => (log += d));
    proc.stderr?.on('data', (d) => (log += d));
    try {
      await waitForServer(proc);
    } catch (e) {
      console.log(log.slice(-3000));
      throw e;
    }
    await scenarios(persistDir);
  } finally {
    proc?.kill('SIGTERM');
    rmSync(persistDir, { recursive: true, force: true });
  }
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
