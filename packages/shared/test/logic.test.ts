import { describe, expect, it } from 'vitest';
import {
  decodeGeohash,
  encodeGeohash,
  geohashDistanceMeters,
  geohashNeighbors,
  isPlausibleMove,
  isValidGeohash,
  jstDate,
  levelFromCount,
  levelProgress,
  previousDate,
  requiredCount,
  travelersFor,
  validateDisplayName,
} from '../src';

describe('level', () => {
  it('matches the table in the design doc', () => {
    expect(requiredCount(1)).toBe(0);
    expect(requiredCount(2)).toBe(1);
    expect(requiredCount(5)).toBe(8);
    expect(requiredCount(10)).toBe(41);
    expect(requiredCount(20)).toBe(181);
    expect(requiredCount(30)).toBe(421);
  });

  it('is the inverse of requiredCount', () => {
    for (let level = 1; level <= 99; level++) {
      expect(levelFromCount(requiredCount(level))).toBe(level);
      if (level > 1) expect(levelFromCount(requiredCount(level) - 1)).toBe(level - 1);
    }
    expect(levelFromCount(0)).toBe(1);
    expect(levelFromCount(1_000_000)).toBe(99);
  });

  it('reports progress to the next level', () => {
    const p = levelProgress(10);
    expect(p.level).toBe(5);
    expect(p.nextAt).toBe(13);
    expect(p.remaining).toBe(3);
  });
});

describe('geohash', () => {
  it('encodes and decodes around Okayama station', () => {
    const hash = encodeGeohash(34.6665, 133.9179, 7);
    expect(hash).toHaveLength(7);
    expect(isValidGeohash(hash, 7)).toBe(true);
    const c = decodeGeohash(hash);
    expect(Math.abs(c.lat - 34.6665)).toBeLessThan(0.001);
    expect(Math.abs(c.lng - 133.9179)).toBeLessThan(0.001);
  });

  it('returns the cell and its 8 neighbours', () => {
    const hash = encodeGeohash(34.6665, 133.9179, 7);
    const n = geohashNeighbors(hash);
    expect(n).toHaveLength(9);
    expect(n).toContain(hash);
    for (const h of n) expect(geohashDistanceMeters(hash, h)).toBeLessThan(250);
  });

  it('rejects malformed cells', () => {
    expect(isValidGeohash('abc', 7)).toBe(false);
    expect(isValidGeohash('xn0maia', 7)).toBe(false); // 'a' and 'i' are not geohash characters
    expect(isValidGeohash('', 7)).toBe(false);
  });

  it('measures Okayama to Kurashiki at roughly 16 km', () => {
    const okayama = encodeGeohash(34.6665, 133.9179, 7);
    const kurashiki = encodeGeohash(34.6013, 133.7666, 7);
    const d = geohashDistanceMeters(okayama, kurashiki);
    expect(d).toBeGreaterThan(14_000);
    expect(d).toBeLessThan(18_000);
  });
});

describe('travellers bonus', () => {
  it('gives one traveller per 2,000 steps and per 10 km, capped at 5 a day', () => {
    expect(travelersFor(0, 0)).toBe(0);
    expect(travelersFor(1999, 9999)).toBe(0);
    expect(travelersFor(2000, 0)).toBe(1);
    expect(travelersFor(4000, 10_000)).toBe(3);
    expect(travelersFor(50_000, 200_000)).toBe(5);
  });

  it('ignores moves faster than 400 km/h', () => {
    expect(isPlausibleMove(16_000, 30 * 60 * 1000)).toBe(true); // 32 km/h
    expect(isPlausibleMove(500_000, 60 * 60 * 1000)).toBe(false); // 500 km/h
    expect(isPlausibleMove(100, 0)).toBe(false);
  });

  it('uses Japan time for the date', () => {
    // 2026-11-02 15:30 UTC = 2026-11-03 00:30 JST
    expect(jstDate(Date.UTC(2026, 10, 2, 15, 30))).toBe('2026-11-03');
    expect(jstDate(Date.UTC(2026, 10, 2, 14, 30))).toBe('2026-11-02');
    expect(previousDate('2026-11-01')).toBe('2026-10-31');
  });
});

describe('display names', () => {
  it('accepts ordinary names', () => {
    expect(validateDisplayName('まさや')).toEqual({ ok: true, name: 'まさや' });
    expect(validateDisplayName('Caroline')).toMatchObject({ ok: true });
    expect(validateDisplayName('  ＴＡＲＯ  ')).toEqual({ ok: true, name: 'TARO' });
  });

  it('rejects contact details and abuse', () => {
    expect(validateDisplayName('')).toMatchObject({ ok: false });
    expect(validateDisplayName('とてもながいなまえですよね')).toMatchObject({ ok: false });
    expect(validateDisplayName('LINE id: abc')).toMatchObject({ ok: false });
    expect(validateDisplayName('0901234')).toMatchObject({ ok: false });
    expect(validateDisplayName('a@b')).toMatchObject({ ok: false });
    expect(validateDisplayName('しねしね')).toMatchObject({ ok: false });
    expect(validateDisplayName(42)).toMatchObject({ ok: false });
  });
});
