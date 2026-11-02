// ジオハッシュ（地図を格子に区切った文字列）。
// アプリは端末内で緯度経度をジオハッシュに丸め、サーバーにはジオハッシュだけを送る。

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
const BASE32_INDEX: Record<string, number> = Object.fromEntries(
  [...BASE32].map((c, i) => [c, i]),
);

export function isValidGeohash(hash: string, precision?: number): boolean {
  if (typeof hash !== 'string' || hash.length === 0 || hash.length > 12) return false;
  if (precision !== undefined && hash.length !== precision) return false;
  for (const c of hash) if (!(c in BASE32_INDEX)) return false;
  return true;
}

export function encodeGeohash(lat: number, lng: number, precision: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('invalid coordinates');
  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;
  let hash = '';
  let bit = 0;
  let ch = 0;
  let evenBit = true;
  while (hash.length < precision) {
    if (evenBit) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        ch = (ch << 1) | 1;
        lngMin = mid;
      } else {
        ch = ch << 1;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        ch = (ch << 1) | 1;
        latMin = mid;
      } else {
        ch = ch << 1;
        latMax = mid;
      }
    }
    evenBit = !evenBit;
    if (++bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}

export interface GeohashBounds {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

export function geohashBounds(hash: string): GeohashBounds {
  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;
  let evenBit = true;
  for (const c of hash) {
    const idx = BASE32_INDEX[c];
    if (idx === undefined) throw new Error(`invalid geohash: ${hash}`);
    for (let n = 4; n >= 0; n--) {
      const bitN = (idx >> n) & 1;
      if (evenBit) {
        const mid = (lngMin + lngMax) / 2;
        if (bitN === 1) lngMin = mid;
        else lngMax = mid;
      } else {
        const mid = (latMin + latMax) / 2;
        if (bitN === 1) latMin = mid;
        else latMax = mid;
      }
      evenBit = !evenBit;
    }
  }
  return { latMin, latMax, lngMin, lngMax };
}

/** マスの中心の緯度経度 */
export function decodeGeohash(hash: string): { lat: number; lng: number } {
  const b = geohashBounds(hash);
  return { lat: (b.latMin + b.latMax) / 2, lng: (b.lngMin + b.lngMax) / 2 };
}

/** 自分のマス＋周囲8マス（マスの境目での取りこぼしを防ぐ） */
export function geohashNeighbors(hash: string): string[] {
  const b = geohashBounds(hash);
  const center = decodeGeohash(hash);
  const dLat = b.latMax - b.latMin;
  const dLng = b.lngMax - b.lngMin;
  const out = new Set<string>();
  for (const dy of [-1, 0, 1]) {
    for (const dx of [-1, 0, 1]) {
      let lat = center.lat + dy * dLat;
      let lng = center.lng + dx * dLng;
      if (lat > 90 || lat < -90) continue;
      if (lng > 180) lng -= 360;
      if (lng < -180) lng += 360;
      lat = Math.max(-89.999999, Math.min(89.999999, lat));
      out.add(encodeGeohash(lat, lng, hash.length));
    }
  }
  return [...out];
}

/** 2点間の距離（m） */
export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** 2つのジオハッシュの中心どうしの距離（m） */
export function geohashDistanceMeters(a: string, b: string): number {
  return haversineMeters(decodeGeohash(a), decodeGeohash(b));
}
