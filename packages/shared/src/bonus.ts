import {
  DAILY_TRAVELER_CAP,
  JST_OFFSET_MS,
  MAX_SPEED_KMH,
  METERS_PER_TRAVELER,
  STEPS_PER_TRAVELER,
} from './constants';

/**
 * 歩数と移動距離から、その日に加わる旅人（NPCの助っ人）の人数を求める。
 * 2,000歩ごとに1人、10kmごとに1人。合計で1日5人まで。
 */
export function travelersFor(steps: number, distanceMeters: number): number {
  const fromSteps = Math.floor(Math.max(0, steps) / STEPS_PER_TRAVELER);
  const fromDistance = Math.floor(Math.max(0, distanceMeters) / METERS_PER_TRAVELER);
  return Math.min(DAILY_TRAVELER_CAP, fromSteps + fromDistance);
}

/** この区間の移動を距離に数えてよいか（時速400kmを超える区間は数えない） */
export function isPlausibleMove(distanceMeters: number, elapsedMs: number): boolean {
  if (distanceMeters <= 0) return true;
  if (elapsedMs <= 0) return false;
  const kmh = distanceMeters / 1000 / (elapsedMs / 3_600_000);
  return kmh <= MAX_SPEED_KMH;
}

/** 日本時間の日付（YYYY-MM-DD） */
export function jstDate(ms: number): string {
  return new Date(ms + JST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 日本時間の日付の前日 */
export function previousDate(date: string): string {
  const t = Date.parse(`${date}T00:00:00Z`);
  return new Date(t - 24 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 日本時間で、その日の0時のUNIXミリ秒 */
export function jstDayStartMs(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) - JST_OFFSET_MS;
}
