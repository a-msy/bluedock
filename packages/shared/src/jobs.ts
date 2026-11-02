// ジョブ: 冒険の最初に4つから1つ選ぶ。すれちがった相手には、自分のジョブの助っ人として届く。

export const JOBS = ['swordsman', 'mage', 'priest', 'dancer'] as const;
export type Job = (typeof JOBS)[number];

export function isJob(v: unknown): v is Job {
  return typeof v === 'string' && (JOBS as readonly string[]).includes(v);
}

export interface JobInfo {
  id: Job;
  name: string;
  emoji: string;
  /** 自分で使う時 */
  description: string;
  /** 助っ人として来た時 */
  helperDescription: string;
  skillName: string;
  skillCost: number;
  skillDescription: string;
  helperMove: string;
}

export const JOB_INFO: Record<Job, JobInfo> = {
  swordsman: {
    id: 'swordsman',
    name: '剣士',
    emoji: '⚔️',
    description: 'HPが高く、物理攻撃で前に立つ',
    helperDescription: '敵1体に強い一撃',
    skillName: '渾身斬り',
    skillCost: 4,
    skillDescription: '敵1体に通常の2倍の一撃',
    helperMove: '助太刀の一撃',
  },
  mage: {
    id: 'mage',
    name: '魔法使い',
    emoji: '🪄',
    description: '魔法で敵をまとめて攻撃する',
    helperDescription: '敵全体に魔法攻撃',
    skillName: 'ファイア',
    skillCost: 5,
    skillDescription: '敵全体に炎の魔法',
    helperMove: '援護の魔法',
  },
  priest: {
    id: 'priest',
    name: '僧侶',
    emoji: '✝️',
    description: '回復でねばり強く戦う',
    helperDescription: 'あなたのHPを回復（満タンなら光で攻撃）',
    skillName: 'ヒール',
    skillCost: 5,
    skillDescription: '自分のHPを大きく回復',
    helperMove: 'いやしの祈り',
  },
  dancer: {
    id: 'dancer',
    name: '踊り子',
    emoji: '💃',
    description: '味方の強化と敵の弱体化',
    helperDescription: 'パーティ全員の攻撃力アップ',
    skillName: '魅惑の舞',
    skillCost: 6,
    skillDescription: '敵全体を切りつけ、3ターンの間 味方の攻撃力アップ＋敵の攻撃力ダウン',
    helperMove: '応援の舞',
  },
};

export interface PlayerStats {
  maxHp: number;
  maxMp: number;
  atk: number;
  mag: number;
  def: number;
}

/** 自分（操作するキャラ）の能力値 */
export function playerStats(job: Job, level: number): PlayerStats {
  const L = level;
  const r = Math.round;
  switch (job) {
    case 'swordsman':
      return { maxHp: r(44 + 9 * L), maxMp: r(10 + 1.0 * L), atk: r(9 + 2.4 * L), mag: r(2 + 0.4 * L), def: r(5 + 1.6 * L) };
    case 'mage':
      return { maxHp: r(32 + 7.5 * L), maxMp: r(16 + 1.6 * L), atk: r(4 + 0.9 * L), mag: r(10 + 2.6 * L), def: r(3 + 1.3 * L) };
    case 'priest':
      return { maxHp: r(38 + 7.5 * L), maxMp: r(14 + 1.4 * L), atk: r(6 + 1.5 * L), mag: r(7 + 1.9 * L), def: r(4 + 1.3 * L) };
    case 'dancer':
      return { maxHp: r(36 + 7 * L), maxMp: r(12 + 1.2 * L), atk: r(7 + 1.9 * L), mag: r(5 + 1.2 * L), def: r(4 + 1.2 * L) };
  }
}

/** 自分の技の倍率（test/balance.test.ts で確かめて決めた値） */
export const SKILL_BALANCE = {
  /** 渾身斬り: 攻撃力の何倍か */
  swordsman: 2.0,
  /** ファイア: 魔力の何倍か（敵全体） */
  mage: 1.5,
  /** ヒール: 魔力の何倍回復するか */
  priest: 2.2,
  /** 魅惑の舞: 攻撃力の何倍で敵全体を切りつけるか */
  dancer: 0.6,
};

/** 助っ人の強さ全体に掛ける倍率（test/balance.test.ts で確かめて決めた値） */
export const HELPER_BALANCE = { scale: 0.9 };

/** 助っ人の強さ（相手のレベルで決まる） */
export const helperPower = {
  /** 剣士: 敵1体への一撃の威力 */
  swordsman: (level: number) => (6 + 2.3 * level) * HELPER_BALANCE.scale,
  /** 魔法使い: 敵全体への魔法の威力 */
  mage: (level: number) => (4 + 1.7 * level) * HELPER_BALANCE.scale,
  /** 僧侶: 回復量 */
  priestHeal: (level: number) => (4 + 2.0 * level) * HELPER_BALANCE.scale,
  /** 僧侶: HPが満タンの時の光の威力 */
  priestHoly: (level: number) => (3 + 1.2 * level) * HELPER_BALANCE.scale,
  /** 踊り子: 攻撃力アップの割合（1人あたり、上限40%） */
  dancerBonus: (level: number) => Math.min(0.4, (0.1 + 0.005 * level) * HELPER_BALANCE.scale),
};
