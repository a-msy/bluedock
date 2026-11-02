// バランス確認用: それなりに賢く戦うプレイヤーの方針と、勝率の計算

import {
  type BattleSetup,
  type BattleState,
  type HelperSnapshot,
  type Job,
  JOB_INFO,
  JOBS,
  type PlayerAction,
  applyAction,
  startBattle,
} from '../src';

export function policy(s: BattleState): PlayerAction {
  const job = s.setup.player.job;
  const cost = JOB_INFO[job].skillCost;
  const p = s.player;
  const alive = s.enemies.flatMap((e, i) => (e.hp > 0 ? [i] : []));
  const weakest = alive.reduce((a, b) => (s.enemies[b]!.hp < s.enemies[a]!.hp ? b : a), alive[0]!);
  const strongest = alive.reduce((a, b) => (s.enemies[b]!.hp > s.enemies[a]!.hp ? b : a), alive[0]!);
  const canSkill = p.mp >= cost;
  switch (job) {
    case 'priest':
      if (p.hp < p.maxHp * 0.45 && canSkill) return { type: 'skill' };
      return { type: 'attack', target: weakest };
    case 'mage':
      if (canSkill && alive.length >= 2) return { type: 'skill' };
      if (canSkill && s.enemies[strongest]!.boss) return { type: 'skill' };
      return { type: 'attack', target: weakest };
    case 'swordsman':
      if (canSkill) return { type: 'skill', target: s.enemies[strongest]!.boss ? strongest : weakest };
      return { type: 'attack', target: weakest };
    case 'dancer':
      if (canSkill && s.partyAtkUpTurns === 0) return { type: 'skill' };
      return { type: 'attack', target: weakest };
  }
}

export function helpersOf(count: number, level: number, playerJob: Job, mixed = true): HelperSnapshot[] {
  // ジョブはプレイヤー以外から順に（mixed=false なら全員同じジョブ）
  const others = JOBS.filter((j) => j !== playerJob);
  return Array.from({ length: count }, (_, i) => ({
    id: `h${i}`,
    name: `助っ人${i + 1}`,
    job: mixed ? others[i % others.length]! : playerJob,
    level,
    avatar: 0,
    npc: false,
  }));
}

export function runBattle(setup: BattleSetup, seed: number): { status: BattleState['status']; turns: number; actions: PlayerAction[] } {
  let { state } = startBattle(setup, seed);
  const actions: PlayerAction[] = [];
  while (state.status === 'ongoing' && state.turn < 300) {
    const a = policy(state);
    actions.push(a);
    state = applyAction(state, a).state;
  }
  return { status: state.status, turns: state.turn, actions };
}

export function winRate(
  areaId: number,
  job: Job,
  level: number,
  helperCount: number,
  helperLevel = level,
  runs = 200,
  mixed = true,
): number {
  let wins = 0;
  for (let i = 0; i < runs; i++) {
    const setup: BattleSetup = {
      areaId,
      player: { name: 'あなた', job, level, avatar: 0 },
      helpers: helpersOf(helperCount, helperLevel, job, mixed),
    };
    if (runBattle(setup, 1000 + i * 7919).status === 'won') wins++;
  }
  return wins / runs;
}
