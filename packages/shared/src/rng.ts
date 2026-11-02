// 再現できる乱数（mulberry32）。状態は32bit整数1つなので、バトルの状態に含めて保存できる。

export function nextRandom(state: number): { value: number; state: number } {
  let t = (state + 0x6d2b79f5) | 0;
  const nextState = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, state: nextState };
}

/** 文字列から32bitのシードを作る */
export function seedFromString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

/** 状態を持ち回す小さな乱数器 */
export class Rng {
  constructor(public state: number) {}
  next(): number {
    const r = nextRandom(this.state);
    this.state = r.state;
    return r.value;
  }
  /** min以上max以下の実数 */
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
  /** 0以上n未満の整数 */
  int(n: number): number {
    return Math.floor(this.next() * n);
  }
}
