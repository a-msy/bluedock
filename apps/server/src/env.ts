import {
  ENCOUNTER_DELAY_MAX_MS,
  ENCOUNTER_DELAY_MIN_MS,
  PING_INTERVAL_MS,
} from '@pieris/shared';

export interface Env {
  DB: D1Database;
  /** "1" の時だけ x-debug-now ヘッダーで現在時刻を差し替えられる（ローカル開発・テスト用） */
  DEBUG_TIME?: string;
  /** すれちがいが届くまでの遅延（ミリ秒）。ローカル開発で短くしたい時だけ指定する */
  ENCOUNTER_DELAY_MIN_MS?: string;
  ENCOUNTER_DELAY_MAX_MS?: string;
  /** 位置送信の最短間隔（ミリ秒） */
  PING_INTERVAL_MS?: string;
}

function num(v: string | undefined, fallback: number): number {
  const n = v === undefined ? NaN : Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function config(env: Env) {
  const delayMin = num(env.ENCOUNTER_DELAY_MIN_MS, ENCOUNTER_DELAY_MIN_MS);
  return {
    delayMin,
    delayMax: Math.max(delayMin, num(env.ENCOUNTER_DELAY_MAX_MS, ENCOUNTER_DELAY_MAX_MS)),
    pingInterval: num(env.PING_INTERVAL_MS, PING_INTERVAL_MS),
    debugTime: env.DEBUG_TIME === '1',
  };
}

export interface UserRow {
  id: string;
  token_hash: string;
  name: string | null;
  avatar: number;
  job: string | null;
  cleared_area: number;
  last_ping_at: number | null;
  last_ping_cell: string | null;
  created_at: number;
}

export interface EncounterRow {
  id: string;
  user_id: string;
  other_id: string | null;
  npc: number;
  name: string;
  avatar: number;
  job: string;
  level: number;
  met_date: string;
  created_at: number;
  visible_at: number;
  opened_at: number | null;
  used_at: number | null;
  adventure_id: string | null;
}

export interface AppVariables {
  user: UserRow;
  now: number;
}

export type AppEnv = { Bindings: Env; Variables: AppVariables };
