// バランスの目標:
// - エリア1はレベル1・助っ人なしでも、どのジョブでもほぼ勝てる
// - 各エリアは推奨レベル・助っ人3人で、どのジョブでも勝率75%以上
// - エリア2以降は推奨レベルでも助っ人なしだと勝率40%以下（助っ人を連れていく意味がある）
// - エリア5以降は、推奨レベルの6割では助っ人3人でも勝ちにくい
import { describe, expect, it } from 'vitest';
import { AREAS, JOBS } from '../src';
import { winRate } from './sim';

describe('balance', () => {
  it('prints the win-rate table', () => {
    const rows: string[] = [];
    for (const area of AREAS) {
      const R = area.recommendedLevel;
      for (const job of JOBS) {
        rows.push(
          [
            `area${area.id} R${R}`.padEnd(10),
            job.padEnd(10),
            `solo ${winRate(area.id, job, R, 0, R, 100).toFixed(2)}`,
            `+1 ${winRate(area.id, job, R, 1, R, 100).toFixed(2)}`,
            `+3 ${winRate(area.id, job, R, 3, R, 100).toFixed(2)}`,
            `under(+3) ${winRate(area.id, job, Math.max(1, Math.round(R * 0.6)), 3, Math.max(1, Math.round(R * 0.6)), 100).toFixed(2)}`,
          ].join('  '),
        );
      }
    }
    console.log(rows.join('\n'));
  });

  it('lets anyone clear area 1 alone at level 1', () => {
    for (const job of JOBS) expect(winRate(1, job, 1, 0), job).toBeGreaterThanOrEqual(0.9);
  });

  it('lets every job clear each area at the recommended level with 3 helpers', () => {
    for (const area of AREAS) {
      for (const job of JOBS) {
        const r = winRate(area.id, job, area.recommendedLevel, 3);
        expect(r, `area ${area.id} ${job}`).toBeGreaterThanOrEqual(0.75);
      }
    }
  });

  it('makes helpers matter from area 2 on', () => {
    for (const area of AREAS.slice(1)) {
      for (const job of JOBS) {
        const r = winRate(area.id, job, area.recommendedLevel, 0);
        expect(r, `area ${area.id} ${job}`).toBeLessThanOrEqual(0.4);
      }
    }
  });

  // 序盤のエリアはレベル差の絶対値が小さい（推奨5に対してLv3など）ので、エリア5以降で確かめる
  it('keeps under-levelled parties from breezing through', () => {
    for (const area of AREAS.slice(4)) {
      const L = Math.max(1, Math.round(area.recommendedLevel * 0.6));
      for (const job of JOBS) {
        const r = winRate(area.id, job, L, 3, L);
        expect(r, `area ${area.id} ${job} at Lv${L}`).toBeLessThanOrEqual(0.5);
      }
    }
  });
});
