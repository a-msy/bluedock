// 冒険のエリア。エリアを順に進み、先へ行くほど敵が強くなる。
// 1つのエリアは「敵の群れ2つ＋ボス」の3戦。

export interface EnemyTemplate {
  key: string;
  name: string;
  emoji: string;
  /** エリアの基準値に掛ける倍率 */
  hp: number;
  atk: number;
  def: number;
  boss?: boolean;
}

export interface Area {
  id: number;
  name: string;
  /** 推奨レベル（助っ人3人を連れて行く想定） */
  recommendedLevel: number;
  description: string;
  waves: EnemyTemplate[][];
}

const slime: EnemyTemplate = { key: 'slime', name: 'スライム', emoji: '💧', hp: 0.6, atk: 0.7, def: 0.5 };
const rat: EnemyTemplate = { key: 'rat', name: 'おおネズミ', emoji: '🐀', hp: 0.8, atk: 0.9, def: 0.6 };
const goblin: EnemyTemplate = { key: 'goblin', name: 'ゴブリン', emoji: '👺', hp: 0.9, atk: 1.0, def: 0.8 };
const bat: EnemyTemplate = { key: 'bat', name: 'こうもり', emoji: '🦇', hp: 0.6, atk: 0.9, def: 0.5 };
const harpy: EnemyTemplate = { key: 'harpy', name: 'ハーピー', emoji: '🦅', hp: 0.8, atk: 1.1, def: 0.7 };
const pebble: EnemyTemplate = { key: 'pebble', name: 'いしころゴーレム', emoji: '🪨', hp: 1.3, atk: 0.8, def: 1.5 };
const golem: EnemyTemplate = { key: 'golem', name: 'ゴーレム', emoji: '🗿', hp: 1.3, atk: 0.9, def: 1.4 };
const merman: EnemyTemplate = { key: 'merman', name: 'マーマン', emoji: '🐟', hp: 1.0, atk: 1.0, def: 0.9 };
const ghost: EnemyTemplate = { key: 'ghost', name: '霧のおばけ', emoji: '👻', hp: 0.7, atk: 1.2, def: 0.4 };
const salamander: EnemyTemplate = { key: 'salamander', name: 'サラマンダー', emoji: '🦎', hp: 1.0, atk: 1.1, def: 0.9 };
const lavaGolem: EnemyTemplate = { key: 'lava_golem', name: '溶岩ゴーレム', emoji: '🌋', hp: 1.4, atk: 1.0, def: 1.4 };
const iceKnight: EnemyTemplate = { key: 'ice_knight', name: '氷の騎士', emoji: '🛡️', hp: 1.1, atk: 1.1, def: 1.2 };
const snowSprite: EnemyTemplate = { key: 'snow_sprite', name: '雪の精', emoji: '❄️', hp: 0.7, atk: 1.2, def: 0.6 };
const demonSoldier: EnemyTemplate = { key: 'demon_soldier', name: '魔族の兵', emoji: '👹', hp: 1.0, atk: 1.1, def: 1.0 };
const demonMage: EnemyTemplate = { key: 'demon_mage', name: '魔導士', emoji: '🧙', hp: 0.8, atk: 1.3, def: 0.7 };

export const AREAS: Area[] = [
  {
    id: 1,
    name: 'はじまりの草原',
    recommendedLevel: 1,
    description: 'やさしい風が吹く草原。ひとりでも越えられる。',
    waves: [
      [slime, slime],
      [slime, rat],
      [{ key: 'king_slime', name: 'キングスライム', emoji: '👑', hp: 2.0, atk: 0.9, def: 1.0, boss: true }],
    ],
  },
  {
    id: 2,
    name: 'ささやきの森',
    recommendedLevel: 3,
    description: '木々がざわめく森。ここから先は仲間の力が要る。',
    waves: [
      [goblin, goblin],
      [goblin, bat, bat],
      [{ key: 'forest_lord', name: '森のぬし', emoji: '🌳', hp: 3.5, atk: 1.2, def: 1.1, boss: true }],
    ],
  },
  {
    id: 3,
    name: '風の丘',
    recommendedLevel: 5,
    description: '強い風が吹き抜ける丘。空から敵が来る。',
    waves: [
      [harpy, harpy],
      [harpy, pebble],
      [{ key: 'whirl_dragon', name: 'つむじかぜの竜', emoji: '🐉', hp: 3.5, atk: 1.25, def: 1.1, boss: true }],
    ],
  },
  {
    id: 4,
    name: '古い鉱山',
    recommendedLevel: 8,
    description: '打ち捨てられた鉱山。かたい敵が多い。',
    waves: [
      [golem, golem],
      [bat, bat, golem],
      [{ key: 'mine_keeper', name: '鉱山の番人', emoji: '⛏️', hp: 3.8, atk: 1.25, def: 1.3, boss: true }],
    ],
  },
  {
    id: 5,
    name: '霧の湖',
    recommendedLevel: 11,
    description: '霧に包まれた湖。見えない敵に気をつけて。',
    waves: [
      [merman, merman],
      [merman, ghost, ghost],
      [{ key: 'lake_serpent', name: '湖の大蛇', emoji: '🐍', hp: 4.0, atk: 1.3, def: 1.1, boss: true }],
    ],
  },
  {
    id: 6,
    name: '火山のふもと',
    recommendedLevel: 15,
    description: '大地が煮えたぎる火山。長い戦いになる。',
    waves: [
      [salamander, salamander],
      [salamander, lavaGolem],
      [{ key: 'fire_giant', name: '炎の巨人', emoji: '🔥', hp: 4.2, atk: 1.3, def: 1.2, boss: true }],
    ],
  },
  {
    id: 7,
    name: '氷の城',
    recommendedLevel: 20,
    description: '凍てついた城。女王が待っている。',
    waves: [
      [iceKnight, iceKnight],
      [iceKnight, snowSprite, snowSprite],
      [{ key: 'ice_queen', name: '氷の女王', emoji: '🧊', hp: 4.4, atk: 1.35, def: 1.2, boss: true }],
    ],
  },
  {
    id: 8,
    name: '魔王の塔',
    recommendedLevel: 25,
    description: '旅の終わり。すれちがった仲間たちと挑もう。',
    waves: [
      [demonSoldier, demonSoldier, demonSoldier],
      [demonSoldier, demonSoldier, demonMage],
      [
        { key: 'demon_lord', name: '魔王', emoji: '😈', hp: 4.6, atk: 1.4, def: 1.25, boss: true },
        { key: 'demon_aide', name: '側近', emoji: '💀', hp: 1.0, atk: 1.0, def: 1.0 },
      ],
    ],
  },
];

export function getArea(id: number): Area | undefined {
  return AREAS.find((a) => a.id === id);
}

/** 敵の強さの基準（推奨レベル R に対して base + per × R）。test/balance.test.ts で確かめて決めた値 */
export const ENEMY_BALANCE = {
  hpBase: 16,
  hpPer: 10,
  atkBase: 7,
  atkPer: 1.6,
  defBase: 1,
  defPer: 0.9,
};

/** エリアの基準値（推奨レベルから決まる）に倍率を掛けた敵の能力値 */
export function enemyStats(area: Area, t: EnemyTemplate): { maxHp: number; atk: number; def: number } {
  const R = area.recommendedLevel;
  const b = ENEMY_BALANCE;
  return {
    maxHp: Math.max(1, Math.round((b.hpBase + b.hpPer * R) * t.hp)),
    atk: Math.max(1, Math.round((b.atkBase + b.atkPer * R) * t.atk)),
    def: Math.max(0, Math.round((b.defBase + b.defPer * R) * t.def)),
  };
}
