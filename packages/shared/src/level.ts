import { LEVEL_MAX } from './constants';

/**
 * そのレベルに必要な累計人数（すれちがい＋旅人）。
 * 必要人数 = (レベル - 1)^2 / 2 を切り上げ。序盤は早く、後半はゆっくり上がる。
 */
export function requiredCount(level: number): number {
  if (level <= 1) return 0;
  return Math.ceil(((level - 1) * (level - 1)) / 2);
}

/** 累計人数からレベルを求める */
export function levelFromCount(count: number): number {
  const c = Math.max(0, Math.floor(count));
  // (L-1)^2/2 <= c  →  L <= 1 + sqrt(2c)。丸め誤差に備えて前後を確かめる
  let level = Math.min(LEVEL_MAX, 1 + Math.floor(Math.sqrt(2 * c)));
  while (level > 1 && requiredCount(level) > c) level--;
  while (level < LEVEL_MAX && requiredCount(level + 1) <= c) level++;
  return level;
}

export interface LevelProgress {
  level: number;
  count: number;
  /** 今のレベルに到達した時点の累計人数 */
  currentFloor: number;
  /** 次のレベルに必要な累計人数（上限レベルなら null） */
  nextAt: number | null;
  /** 次のレベルまであと何人か（上限レベルなら 0） */
  remaining: number;
}

export function levelProgress(count: number): LevelProgress {
  const level = levelFromCount(count);
  const nextAt = level >= LEVEL_MAX ? null : requiredCount(level + 1);
  return {
    level,
    count,
    currentFloor: requiredCount(level),
    nextAt,
    remaining: nextAt === null ? 0 : Math.max(0, nextAt - count),
  };
}
