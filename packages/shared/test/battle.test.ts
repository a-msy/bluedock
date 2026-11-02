import { describe, expect, it } from 'vitest';
import {
  AREAS,
  type BattleSetup,
  ReplayError,
  applyAction,
  describeEvent,
  replayBattle,
  startBattle,
} from '../src';
import { helpersOf, runBattle } from './sim';

const setup: BattleSetup = {
  areaId: 2,
  player: { name: 'まさや', job: 'swordsman', level: 4, avatar: 1 },
  helpers: helpersOf(3, 4, 'swordsman'),
};

describe('battle engine', () => {
  it('is deterministic for the same seed and actions', () => {
    const a = runBattle(setup, 42);
    const b = replayBattle(setup, 42, a.actions);
    expect(b.state.status).toBe(a.status);
    expect(b.state.turn).toBe(a.turns);
    const c = replayBattle(setup, 42, a.actions);
    expect(JSON.stringify(c.state)).toBe(JSON.stringify(b.state));
  });

  it('gives a different fight for a different seed', () => {
    const a = replayBattle(setup, 1, [{ type: 'attack' }, { type: 'attack' }]);
    const b = replayBattle(setup, 2, [{ type: 'attack' }, { type: 'attack' }]);
    expect(JSON.stringify(a.events)).not.toBe(JSON.stringify(b.events));
  });

  it('does not mutate the previous state', () => {
    const { state } = startBattle(setup, 7);
    const before = JSON.stringify(state);
    applyAction(state, { type: 'attack', target: 0 });
    expect(JSON.stringify(state)).toBe(before);
  });

  it('falls back to a normal attack when MP runs out', () => {
    let { state } = startBattle({ ...setup, helpers: [] }, 3);
    state = { ...state, player: { ...state.player, mp: 0 } };
    const r = applyAction(state, { type: 'skill', target: 0 });
    expect(r.events.some((e) => e.kind === 'no_mp')).toBe(true);
    expect(r.state.player.mp).toBe(1);
  });

  it('retargets when the chosen enemy is already down', () => {
    const { state } = startBattle(setup, 9);
    const r = applyAction(state, { type: 'attack', target: 99 });
    const hit = r.events.find((e) => e.kind === 'damage' && e.by === 'player');
    expect(hit).toBeDefined();
  });

  it('ends the run when the player flees', () => {
    const r = replayBattle(setup, 5, [{ type: 'flee' }, { type: 'attack' }]);
    expect(r.state.status).toBe('fled');
    expect(r.state.turn).toBe(1);
  });

  it('turns on the party bonus only when all four jobs are present', () => {
    expect(startBattle(setup, 1).state.partyBonus).toBe(true);
    expect(startBattle({ ...setup, helpers: helpersOf(2, 4, 'swordsman') }, 1).state.partyBonus).toBe(false);
  });

  it('rejects bad replays', () => {
    expect(() => replayBattle(setup, 1, [{ type: 'cast_meteor' }])).toThrow(ReplayError);
    expect(() => replayBattle(setup, 1, new Array(700).fill({ type: 'defend' }))).toThrow(ReplayError);
    expect(() => replayBattle({ ...setup, helpers: helpersOf(4, 4, 'mage') }, 1, [])).toThrow();
  });

  it('describes every event in Japanese', () => {
    const r = replayBattle(setup, 11, runBattle(setup, 11).actions);
    for (const e of r.events) expect(describeEvent(e).length).toBeGreaterThan(0);
  });

  it('has three fights in every area', () => {
    for (const a of AREAS) expect(a.waves).toHaveLength(3);
  });
});
