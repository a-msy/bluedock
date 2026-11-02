import { GEOHASH_PRECISION, encodeGeohash, jstDate, jstDayStartMs } from '@pieris/shared';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import { getJson, setJson } from './storage';

export type CellResult = { ok: true; cell: string } | { ok: false; reason: 'denied' | 'unavailable' };

/**
 * 今いる場所を7桁のジオハッシュ（約150m四方のマス）に丸めて返す。
 * 生の緯度経度はこの関数の外に出さない。
 */
export async function currentCell(): Promise<CellResult> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return { ok: false, reason: 'denied' };
    let pos: Location.LocationObject | null = null;
    try {
      // 直近2分以内の位置があればそれを使う（速くて電池にやさしい）
      pos = await Location.getLastKnownPositionAsync({ maxAge: 2 * 60 * 1000, requiredAccuracy: 300 });
    } catch {
      pos = null;
    }
    pos ??= await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { ok: true, cell: encodeGeohash(pos.coords.latitude, pos.coords.longitude, GEOHASH_PRECISION) };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

// --- 歩数 ---
// iOS: OSに残っている今日の歩数をまとめて読む（アプリを閉じていた間の分も入る）
// Android: OSの歩数履歴は Health Connect が必要なので、MVPではアプリを開いている間の歩数だけを数える

const ANDROID_KEY = 'pieris.androidSteps';
type AndroidSteps = { date: string; steps: number };
let androidSubscription: { remove(): void } | null = null;
let androidLastValue = 0;

async function ensurePedometer(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    if (!(await Pedometer.isAvailableAsync())) return false;
    const perm = await Pedometer.requestPermissionsAsync();
    return perm.granted;
  } catch {
    return false;
  }
}

/** Android: アプリを開いている間の歩数を数え始める */
export async function startStepWatch() {
  if (Platform.OS !== 'android' || androidSubscription) return;
  if (!(await ensurePedometer())) return;
  androidLastValue = 0;
  androidSubscription = Pedometer.watchStepCount((r) => {
    const delta = Math.max(0, r.steps - androidLastValue);
    androidLastValue = r.steps;
    if (delta === 0) return;
    void (async () => {
      const today = jstDate(Date.now());
      const saved = (await getJson<AndroidSteps>(ANDROID_KEY)) ?? { date: today, steps: 0 };
      const next = saved.date === today ? { date: today, steps: saved.steps + delta } : { date: today, steps: delta };
      await setJson(ANDROID_KEY, next);
    })();
  });
}

export function stopStepWatch() {
  androidSubscription?.remove();
  androidSubscription = null;
}

/** 今日（日本時間）の歩数。読めない時は null */
export async function todaySteps(): Promise<{ date: string; steps: number } | null> {
  const date = jstDate(Date.now());
  if (Platform.OS === 'ios') {
    if (!(await ensurePedometer())) return null;
    try {
      const r = await Pedometer.getStepCountAsync(new Date(jstDayStartMs(date)), new Date());
      return { date, steps: r.steps };
    } catch {
      return null;
    }
  }
  if (Platform.OS === 'android') {
    const saved = await getJson<AndroidSteps>(ANDROID_KEY);
    return saved && saved.date === date ? saved : { date, steps: 0 };
  }
  return null;
}
