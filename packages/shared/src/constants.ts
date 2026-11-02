// ゲーム全体の定数。値はすべて初期案で、運用しながら調整する。

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** 実在の人とのすれちがい: 1日の上限（人） */
export const DAILY_ENCOUNTER_CAP = 10;
/** 旅人（NPCの助っ人）: 1日の上限（人）。すれちがいとは別枠 */
export const DAILY_TRAVELER_CAP = 5;
/** 何歩ごとに旅人が1人加わるか */
export const STEPS_PER_TRAVELER = 2000;
/** 何mの移動ごとに旅人が1人加わるか（乗り物込み） */
export const METERS_PER_TRAVELER = 10_000;
/** これより速い区間は移動距離に数えない（位置偽装・飛行機対策） */
export const MAX_SPEED_KMH = 400;
/** 1日に受け付ける歩数の上限（これを超える値は切り捨て） */
export const MAX_STEPS_PER_DAY = 100_000;

/** 冒険に連れていける助っ人の最大数（自分＋3人の4人パーティ） */
export const PARTY_HELPER_MAX = 3;
/** レベルの上限 */
export const LEVEL_MAX = 99;

/** ジオハッシュの桁数（7桁 ≒ 約150m四方） */
export const GEOHASH_PRECISION = 7;
/** すれちがい判定の時間窓（起動時のみ方式なので広め） */
export const MATCH_WINDOW_MS = 2 * HOUR;
/** 位置送信の最短間隔 */
export const PING_INTERVAL_MS = 5 * MINUTE;
/** すれちがいが相手に届くまでの遅延（この範囲でランダム） */
export const ENCOUNTER_DELAY_MIN_MS = 1 * HOUR;
export const ENCOUNTER_DELAY_MAX_MS = 3 * HOUR;
/** 位置記録の保存期間 */
export const PING_RETENTION_MS = 48 * HOUR;

/** 表示名の長さ */
export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 10;
/** アバターの色の数（0〜AVATAR_COUNT-1） */
export const AVATAR_COUNT = 8;

/** 1回の冒険で受け付ける行動の最大数（リプレイの上限） */
export const MAX_BATTLE_ACTIONS = 600;

/** 日付の区切りは日本時間 */
export const JST_OFFSET_MS = 9 * HOUR;
