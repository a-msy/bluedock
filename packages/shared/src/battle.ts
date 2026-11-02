// バトルエンジン。アプリとサーバーで同じコードを動かす。
// 冒険の開始時にサーバーがシードを決め、アプリは行動の列を送り返す。
// サーバーは同じシードで行動を再生して勝敗を確かめる（結果の改ざんを防ぐ）。

import { type Area, type EnemyTemplate, enemyStats, getArea } from './areas';
import { JOB_INFO, type Job, JOBS, SKILL_BALANCE, helperPower, playerStats } from './jobs';
import { Rng } from './rng';
import { MAX_BATTLE_ACTIONS, PARTY_HELPER_MAX } from './constants';

export interface HelperSnapshot {
  /** 助っ人カードのID（すれちがい記録のID） */
  id: string;
  name: string;
  job: Job;
  level: number;
  avatar: number;
  /** 旅人（NPC）か */
  npc: boolean;
}

export interface BattleSetup {
  areaId: number;
  player: { name: string; job: Job; level: number; avatar: number };
  helpers: HelperSnapshot[];
}

export type PlayerAction =
  | { type: 'attack'; target?: number }
  | { type: 'skill'; target?: number }
  | { type: 'defend' }
  | { type: 'flee' };

export interface EnemyState {
  key: string;
  name: string;
  emoji: string;
  boss: boolean;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
}

export interface PlayerState {
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  atk: number;
  mag: number;
  def: number;
}

export type BattleStatus = 'ongoing' | 'won' | 'lost' | 'fled';

export interface BattleState {
  setup: BattleSetup;
  rng: number;
  turn: number;
  /** 何戦目か（0始まり） */
  wave: number;
  waveCount: number;
  enemies: EnemyState[];
  player: PlayerState;
  /** 魅惑の舞の残りターン（味方の攻撃力アップ） */
  partyAtkUpTurns: number;
  /** 魅惑の舞の残りターン（敵の攻撃力ダウン） */
  enemyAtkDownTurns: number;
  /** 4つのジョブがそろっているか（パーティボーナス） */
  partyBonus: boolean;
  status: BattleStatus;
}

export type BattleEvent =
  | { kind: 'start'; area: string; partyBonus: boolean; dancerBonus: number }
  | { kind: 'wave'; wave: number; total: number; enemies: string[] }
  | {
      kind: 'damage';
      by: 'player' | 'helper' | 'enemy';
      actor: string;
      move: string;
      target: string;
      amount: number;
      ko: boolean;
    }
  | { kind: 'heal'; by: 'player' | 'helper' | 'rest'; actor: string; move: string; amount: number }
  | { kind: 'buff'; actor: string; move: string }
  | { kind: 'defend'; actor: string }
  | { kind: 'no_mp'; actor: string; move: string }
  | { kind: 'flee'; actor: string }
  | { kind: 'end'; status: Exclude<BattleStatus, 'ongoing'> };

export const PARTY_BONUS = 0.15;
const DANCE_BUFF = 0.25;
const DANCE_DEBUFF = 0.2;
const DANCE_TURNS = 3;
const REST_HEAL_RATIO = 0.15;
const REST_MP = 3;

export class BattleSetupError extends Error {}

export function validateSetup(setup: BattleSetup): Area {
  const area = getArea(setup.areaId);
  if (!area) throw new BattleSetupError('unknown area');
  if (setup.helpers.length > PARTY_HELPER_MAX) throw new BattleSetupError('too many helpers');
  return area;
}

function cloneState(s: BattleState): BattleState {
  return {
    ...s,
    enemies: s.enemies.map((e) => ({ ...e })),
    player: { ...s.player },
  };
}

function spawnWave(area: Area, templates: EnemyTemplate[]): EnemyState[] {
  // 同じ名前の敵には A, B, C と付ける
  const counts = new Map<string, number>();
  for (const t of templates) counts.set(t.key, (counts.get(t.key) ?? 0) + 1);
  const seen = new Map<string, number>();
  return templates.map((t) => {
    const s = enemyStats(area, t);
    let name = t.name;
    if ((counts.get(t.key) ?? 0) > 1) {
      const i = seen.get(t.key) ?? 0;
      seen.set(t.key, i + 1);
      name = `${t.name}${'ABCDEFG'[i] ?? ''}`;
    }
    return { key: t.key, name, emoji: t.emoji, boss: !!t.boss, maxHp: s.maxHp, hp: s.maxHp, atk: s.atk, def: s.def };
  });
}

function hasPartyBonus(setup: BattleSetup): boolean {
  const jobs = new Set<Job>([setup.player.job, ...setup.helpers.map((h) => h.job)]);
  return JOBS.every((j) => jobs.has(j));
}

function dancerBonus(setup: BattleSetup): number {
  return setup.helpers
    .filter((h) => h.job === 'dancer')
    .reduce((sum, h) => sum + helperPower.dancerBonus(h.level), 0);
}

/** 味方の与えるダメージの倍率 */
function partyMultiplier(s: BattleState): number {
  return (
    1 +
    (s.partyAtkUpTurns > 0 ? DANCE_BUFF : 0) +
    dancerBonus(s.setup) +
    (s.partyBonus ? PARTY_BONUS : 0)
  );
}

function physical(rng: Rng, power: number, def: number): number {
  return Math.max(1, Math.round(power * rng.range(0.9, 1.1) - def * 0.5));
}

function magical(rng: Rng, power: number, def: number): number {
  return Math.max(1, Math.round(power * rng.range(0.9, 1.1) - def * 0.25));
}

function healAmount(rng: Rng, power: number): number {
  return Math.max(1, Math.round(power * rng.range(0.95, 1.05)));
}

function aliveIndexes(s: BattleState): number[] {
  return s.enemies.flatMap((e, i) => (e.hp > 0 ? [i] : []));
}

function resolveTarget(s: BattleState, target: number | undefined): number {
  const alive = aliveIndexes(s);
  if (target !== undefined && alive.includes(target)) return target;
  return alive[0] ?? 0;
}

function hit(
  s: BattleState,
  events: BattleEvent[],
  index: number,
  amount: number,
  by: 'player' | 'helper',
  actor: string,
  move: string,
) {
  const e = s.enemies[index];
  if (!e || e.hp <= 0) return;
  e.hp = Math.max(0, e.hp - amount);
  events.push({ kind: 'damage', by, actor, move, target: e.name, amount, ko: e.hp === 0 });
}

function healPlayer(
  s: BattleState,
  events: BattleEvent[],
  amount: number,
  by: 'player' | 'helper' | 'rest',
  actor: string,
  move: string,
) {
  const before = s.player.hp;
  s.player.hp = Math.min(s.player.maxHp, s.player.hp + amount);
  events.push({ kind: 'heal', by, actor, move, amount: s.player.hp - before });
}

/**
 * 今の群れを倒しきっていたら、次の群れを出す（最後ならクリア）。
 * 次に進んだら true を返す。
 */
function advanceIfCleared(s: BattleState, events: BattleEvent[]): boolean {
  if (aliveIndexes(s).length > 0) return false;
  const area = getArea(s.setup.areaId)!;
  if (s.wave + 1 >= s.waveCount) {
    s.status = 'won';
    events.push({ kind: 'end', status: 'won' });
    return true;
  }
  s.wave += 1;
  s.enemies = spawnWave(area, area.waves[s.wave]!);
  // 群れの合間に少しだけ回復する
  const rest = Math.round(s.player.maxHp * REST_HEAL_RATIO);
  if (s.player.hp < s.player.maxHp) healPlayer(s, events, rest, 'rest', '', 'ひと休み');
  s.player.mp = Math.min(s.player.maxMp, s.player.mp + REST_MP);
  events.push({ kind: 'wave', wave: s.wave + 1, total: s.waveCount, enemies: s.enemies.map((e) => e.name) });
  return true;
}

export function startBattle(setup: BattleSetup, seed: number): { state: BattleState; events: BattleEvent[] } {
  const area = validateSetup(setup);
  const stats = playerStats(setup.player.job, setup.player.level);
  const state: BattleState = {
    setup,
    rng: seed | 0,
    turn: 0,
    wave: 0,
    waveCount: area.waves.length,
    enemies: spawnWave(area, area.waves[0]!),
    player: {
      maxHp: stats.maxHp,
      hp: stats.maxHp,
      maxMp: stats.maxMp,
      mp: stats.maxMp,
      atk: stats.atk,
      mag: stats.mag,
      def: stats.def,
    },
    partyAtkUpTurns: 0,
    enemyAtkDownTurns: 0,
    partyBonus: hasPartyBonus(setup),
    status: 'ongoing',
  };
  const events: BattleEvent[] = [
    { kind: 'start', area: area.name, partyBonus: state.partyBonus, dancerBonus: dancerBonus(setup) },
    { kind: 'wave', wave: 1, total: state.waveCount, enemies: state.enemies.map((e) => e.name) },
  ];
  return { state, events };
}

/** 1ターン進める。元の状態は書き換えない */
export function applyAction(
  prev: BattleState,
  action: PlayerAction,
): { state: BattleState; events: BattleEvent[] } {
  if (prev.status !== 'ongoing') return { state: prev, events: [] };
  const s = cloneState(prev);
  const rng = new Rng(s.rng);
  const events: BattleEvent[] = [];
  const me = s.setup.player.name;
  const info = JOB_INFO[s.setup.player.job];
  s.turn += 1;
  let defending = false;

  // 1. 自分の行動
  let act: PlayerAction = action;
  if (act.type === 'flee') {
    s.status = 'fled';
    events.push({ kind: 'flee', actor: me }, { kind: 'end', status: 'fled' });
    s.rng = rng.state;
    return { state: s, events };
  }
  if (act.type === 'skill' && s.player.mp < info.skillCost) {
    events.push({ kind: 'no_mp', actor: me, move: info.skillName });
    act = { type: 'attack', target: act.target };
  }
  const mult = partyMultiplier(s);
  if (act.type === 'defend') {
    defending = true;
    s.player.mp = Math.min(s.player.maxMp, s.player.mp + 2);
    events.push({ kind: 'defend', actor: me });
  } else if (act.type === 'attack') {
    const t = resolveTarget(s, act.target);
    hit(s, events, t, physical(rng, s.player.atk * mult, s.enemies[t]!.def), 'player', me, 'こうげき');
  } else {
    s.player.mp -= info.skillCost;
    switch (s.setup.player.job) {
      case 'swordsman': {
        const t = resolveTarget(s, act.target);
        hit(s, events, t, physical(rng, s.player.atk * SKILL_BALANCE.swordsman * mult, s.enemies[t]!.def), 'player', me, info.skillName);
        break;
      }
      case 'mage':
        for (const i of aliveIndexes(s)) {
          hit(s, events, i, magical(rng, s.player.mag * SKILL_BALANCE.mage * mult, s.enemies[i]!.def), 'player', me, info.skillName);
        }
        break;
      case 'priest':
        healPlayer(s, events, healAmount(rng, s.player.mag * SKILL_BALANCE.priest), 'player', me, info.skillName);
        break;
      case 'dancer':
        s.partyAtkUpTurns = DANCE_TURNS + 1; // このターンの終わりに1つ減るので +1
        s.enemyAtkDownTurns = DANCE_TURNS + 1;
        events.push({ kind: 'buff', actor: me, move: info.skillName });
        // 舞いながら敵全体を軽く切りつける
        for (const i of aliveIndexes(s)) {
          hit(s, events, i, physical(rng, s.player.atk * SKILL_BALANCE.dancer * partyMultiplier(s), s.enemies[i]!.def), 'player', me, info.skillName);
        }
        break;
    }
  }

  let advanced = advanceIfCleared(s, events);

  // 2. 助っ人の行動（自動）
  if (!advanced) {
    const m2 = partyMultiplier(s);
    for (const h of s.setup.helpers) {
      if (s.status !== 'ongoing') break;
      const move = JOB_INFO[h.job].helperMove;
      switch (h.job) {
        case 'swordsman': {
          // いちばんHPの少ない敵を狙う
          const alive = aliveIndexes(s);
          const t = alive.reduce((a, b) => (s.enemies[b]!.hp < s.enemies[a]!.hp ? b : a), alive[0]!);
          hit(s, events, t, physical(rng, helperPower.swordsman(h.level) * m2, s.enemies[t]!.def), 'helper', h.name, move);
          break;
        }
        case 'mage':
          for (const i of aliveIndexes(s)) {
            hit(s, events, i, magical(rng, helperPower.mage(h.level) * 0.7 * m2, s.enemies[i]!.def), 'helper', h.name, move);
          }
          break;
        case 'priest':
          if (s.player.hp < s.player.maxHp * 0.75) {
            healPlayer(s, events, healAmount(rng, helperPower.priestHeal(h.level)), 'helper', h.name, move);
          } else {
            const alive = aliveIndexes(s);
            const t = alive[rng.int(alive.length)]!;
            hit(s, events, t, magical(rng, helperPower.priestHoly(h.level) * m2, s.enemies[t]!.def), 'helper', h.name, '聖なる光');
          }
          break;
        case 'dancer':
          // 踊り子の助っ人は常に攻撃力を底上げする（倍率に含まれている）
          break;
      }
      advanced = advanceIfCleared(s, events);
      if (advanced) break;
    }
  }

  // 3. 敵の行動（群れを倒しきったターンは、次の群れは動かない）
  if (!advanced && s.status === 'ongoing') {
    for (const i of aliveIndexes(s)) {
      const e = s.enemies[i]!;
      let power = e.atk * (s.enemyAtkDownTurns > 0 ? 1 - DANCE_DEBUFF : 1);
      if (defending) power *= 0.5;
      const amount = physical(rng, power, s.player.def);
      s.player.hp = Math.max(0, s.player.hp - amount);
      events.push({ kind: 'damage', by: 'enemy', actor: e.name, move: 'こうげき', target: me, amount, ko: s.player.hp === 0 });
      if (s.player.hp === 0) {
        s.status = 'lost';
        events.push({ kind: 'end', status: 'lost' });
        break;
      }
    }
  }

  // 4. ターンの終わり
  if (s.partyAtkUpTurns > 0) s.partyAtkUpTurns -= 1;
  if (s.enemyAtkDownTurns > 0) s.enemyAtkDownTurns -= 1;
  if (s.status === 'ongoing') s.player.mp = Math.min(s.player.maxMp, s.player.mp + 1);
  s.rng = rng.state;
  return { state: s, events };
}

export class ReplayError extends Error {}

/** シードと行動の列からバトルを最初から再生する（サーバーでの検証用） */
export function replayBattle(
  setup: BattleSetup,
  seed: number,
  actions: unknown[],
): { state: BattleState; events: BattleEvent[] } {
  if (!Array.isArray(actions)) throw new ReplayError('actions must be an array');
  if (actions.length > MAX_BATTLE_ACTIONS) throw new ReplayError('too many actions');
  let { state, events } = startBattle(setup, seed);
  const all = [...events];
  for (const raw of actions) {
    if (state.status !== 'ongoing') break;
    const action = parseAction(raw);
    const r = applyAction(state, action);
    state = r.state;
    all.push(...r.events);
  }
  return { state, events: all };
}

export function parseAction(raw: unknown): PlayerAction {
  if (!raw || typeof raw !== 'object') throw new ReplayError('invalid action');
  const a = raw as { type?: unknown; target?: unknown };
  const target = typeof a.target === 'number' && Number.isInteger(a.target) ? a.target : undefined;
  switch (a.type) {
    case 'attack':
      return { type: 'attack', target };
    case 'skill':
      return { type: 'skill', target };
    case 'defend':
      return { type: 'defend' };
    case 'flee':
      return { type: 'flee' };
    default:
      throw new ReplayError('invalid action type');
  }
}

/** バトルの出来事を日本語の1行にする（画面のログ用） */
export function describeEvent(e: BattleEvent): string {
  switch (e.kind) {
    case 'start':
      return [
        `${e.area}に足をふみいれた！`,
        e.dancerBonus > 0 ? `踊り子の応援で攻撃力が${Math.round(e.dancerBonus * 100)}%アップ！` : '',
        e.partyBonus ? `4つのジョブがそろった！ パーティボーナス発動！` : '',
      ]
        .filter(Boolean)
        .join('\n');
    case 'wave':
      return e.wave === e.total
        ? `ボス戦！ ${e.enemies.join('、')}があらわれた！`
        : `${e.wave}/${e.total}戦目: ${e.enemies.join('、')}があらわれた！`;
    case 'damage':
      return `${e.actor}の${e.move}！ ${e.target}に${e.amount}のダメージ${e.ko ? (e.by === 'enemy' ? '…力つきた' : '！ たおした！') : ''}`;
    case 'heal':
      return e.by === 'rest'
        ? `ひと休みしてHPが${e.amount}回復した`
        : `${e.actor}の${e.move}！ HPが${e.amount}回復した`;
    case 'buff':
      return `${e.actor}の${e.move}！ 3ターンの間、味方の攻撃力が上がり敵の攻撃力が下がる`;
    case 'defend':
      return `${e.actor}は身を守っている`;
    case 'no_mp':
      return `MPが足りない！ ${e.move}のかわりにこうげき`;
    case 'flee':
      return `${e.actor}は逃げ出した`;
    case 'end':
      return e.status === 'won' ? 'エリアをクリアした！' : e.status === 'lost' ? '全滅してしまった…' : '冒険をあきらめた';
  }
}
