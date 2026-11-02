import type { BattleSetup, PlayerAction } from '@pieris/shared';
import { getJson, removeItem, setJson } from './storage';

// 冒険の途中でアプリが閉じても、同じシードと行動の列から再開できるように保存しておく

const KEY = 'pieris.adventure';

export interface SavedAdventure {
  adventureId: string;
  seed: number;
  setup: BattleSetup;
  /** 行動を短い文字列にしたもの（a=こうげき s=技 d=ぼうぎょ f=にげる、数字は狙う敵） */
  actions: string;
}

export function encodeActions(actions: PlayerAction[]): string {
  return actions
    .map((a) => {
      switch (a.type) {
        case 'attack':
          return `a${a.target ?? ''}`;
        case 'skill':
          return `s${a.target ?? ''}`;
        case 'defend':
          return 'd';
        case 'flee':
          return 'f';
      }
    })
    .join(',');
}

export function decodeActions(s: string): PlayerAction[] {
  if (!s) return [];
  return s.split(',').map((t): PlayerAction => {
    const kind = t[0];
    const target = t.length > 1 ? Number(t.slice(1)) : undefined;
    if (kind === 'a') return { type: 'attack', target };
    if (kind === 's') return { type: 'skill', target };
    if (kind === 'd') return { type: 'defend' };
    return { type: 'flee' };
  });
}

export async function loadAdventure(): Promise<SavedAdventure | null> {
  return getJson<SavedAdventure>(KEY);
}

export async function saveAdventure(a: SavedAdventure): Promise<void> {
  await setJson(KEY, a);
}

export async function clearAdventure(): Promise<void> {
  await removeItem(KEY);
}
