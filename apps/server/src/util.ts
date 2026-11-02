import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export function randomId(): string {
  return crypto.randomUUID();
}

/** 32bitのランダムな整数（バトルのシード用） */
export function randomSeed(): number {
  return crypto.getRandomValues(new Int32Array(1))[0]!;
}

/** 0以上1未満のランダムな実数 */
export function random(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]! / 4294967296;
}

export function randomInt(n: number): number {
  return Math.floor(random() * n);
}

export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** アプリにそのまま見せられる日本語メッセージ付きのエラー */
export class ApiError extends HTTPException {
  constructor(
    status: ContentfulStatusCode,
    public code: string,
    message: string,
  ) {
    super(status, { message });
  }
}

export function bad(code: string, message: string): ApiError {
  return new ApiError(400, code, message);
}

export async function readJson<T>(req: Request): Promise<Partial<T>> {
  try {
    const body = (await req.json()) as unknown;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw bad('invalid_body', 'リクエストの形式が正しくありません');
    }
    return body as Partial<T>;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw bad('invalid_json', 'リクエストの形式が正しくありません');
  }
}
