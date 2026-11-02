import type {
  FinishAdventureResponse,
  HelpersResponse,
  MeResponse,
  PingResponse,
  PlayerAction,
  ProfileRequest,
  RegisterResponse,
  StartAdventureResponse,
  StepsResponse,
} from '@pieris/shared';
import { getItem, removeItem, setItem } from './storage';

// サーバーのURLは EXPO_PUBLIC_API_URL で指定する（実機で試す時はPCのLAN内IPなど）
const BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787').replace(/\/$/, '');
const TOKEN_KEY = 'pieris.token';

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

let cachedToken: string | null = null;

async function ensureToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const stored = await getItem(TOKEN_KEY);
  if (stored) {
    cachedToken = stored;
    return stored;
  }
  const res = await raw<RegisterResponse>('POST', '/v1/register');
  await setItem(TOKEN_KEY, res.token);
  cachedToken = res.token;
  return res.token;
}

export async function forgetToken() {
  cachedToken = null;
  await removeItem(TOKEN_KEY);
}

async function raw<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError(0, 'network', 'サーバーにつながりません。通信環境を確かめてください');
  }
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    const e = (json ?? {}) as { error?: string; message?: string };
    throw new ApiClientError(res.status, e.error ?? 'error', e.message ?? 'エラーが起きました');
  }
  return json as T;
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await ensureToken();
  try {
    return await raw<T>(method, path, body, token);
  } catch (e) {
    // サーバー側でアカウントが消えていたら、作り直して最初から
    if (e instanceof ApiClientError && e.status === 401) await forgetToken();
    throw e;
  }
}

export const api = {
  me: () => call<MeResponse>('GET', '/v1/me'),
  updateProfile: (p: ProfileRequest) => call<{ ok: true }>('PUT', '/v1/me', p),
  deleteAccount: () => call<{ ok: true }>('DELETE', '/v1/me'),
  ping: (cell: string) => call<PingResponse>('POST', '/v1/ping', { cell }),
  steps: (date: string, steps: number) => call<StepsResponse>('POST', '/v1/steps', { date, steps }),
  helpers: () => call<HelpersResponse>('GET', '/v1/helpers'),
  startAdventure: (areaId: number, helperIds: string[]) =>
    call<StartAdventureResponse>('POST', '/v1/adventures', { areaId, helperIds }),
  finishAdventure: (id: string, actions: PlayerAction[]) =>
    call<FinishAdventureResponse>('POST', `/v1/adventures/${id}/finish`, { actions }),
  block: (helperId: string) => call<{ ok: true }>('POST', '/v1/block', { helperId }),
  report: (helperId: string, reason: string) => call<{ ok: true }>('POST', '/v1/report', { helperId, reason }),
};

export function errorMessage(e: unknown): string {
  if (e instanceof ApiClientError) return e.message;
  if (e instanceof Error) return e.message;
  return 'エラーが起きました';
}
