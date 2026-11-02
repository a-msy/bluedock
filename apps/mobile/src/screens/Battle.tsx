import {
  type BattleEvent,
  type BattleState,
  type FinishAdventureResponse,
  JOB_INFO,
  type PlayerAction,
  applyAction,
  describeEvent,
  getArea,
  replayBattle,
} from '@pieris/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, type ScrollViewInstance, Text, View } from 'react-native';
import { type SavedAdventure, clearAdventure, decodeActions, encodeActions, saveAdventure } from '../adventure';
import { ApiClientError, api, errorMessage } from '../api';
import { Avatar, Bar, Button, Card, Dialog, ErrorNote, Screen, Tag } from '../components/ui';
import { colors, jobColors, radius, space } from '../theme';

type Line = { id: number; text: string; tone: 'normal' | 'enemy' | 'good' | 'system' };

function toLines(events: BattleEvent[], startId: number): Line[] {
  return events.map((e, i) => ({
    id: startId + i,
    text: describeEvent(e),
    tone:
      e.kind === 'damage' && e.by === 'enemy'
        ? 'enemy'
        : e.kind === 'heal' || (e.kind === 'end' && e.status === 'won')
          ? 'good'
          : e.kind === 'wave' || e.kind === 'start' || e.kind === 'end'
            ? 'system'
            : 'normal',
  }));
}

export function Battle({
  adventure,
  onExit,
}: {
  adventure: SavedAdventure;
  onExit: (result: FinishAdventureResponse | null) => void;
}) {
  const initial = useMemo(() => {
    const actions = decodeActions(adventure.actions);
    const r = replayBattle(adventure.setup, adventure.seed, actions);
    return { state: r.state, actions, lines: toLines(r.events, 0).slice(-40) };
  }, [adventure]);

  const [state, setState] = useState<BattleState>(initial.state);
  const [lines, setLines] = useState<Line[]>(initial.lines);
  const [target, setTarget] = useState(0);
  const [fleeAsk, setFleeAsk] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState<FinishAdventureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actions = useRef<PlayerAction[]>(initial.actions);
  const stateRef = useRef<BattleState>(initial.state);
  const nextId = useRef(initial.lines.length + 1000);
  const logRef = useRef<ScrollViewInstance>(null);

  const area = getArea(adventure.setup.areaId)!;
  const job = adventure.setup.player.job;
  const info = JOB_INFO[job];

  // 再開した時に、すでに決着がついていたらそのまま結果を送る
  useEffect(() => {
    if (initial.state.status !== 'ongoing') void finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 狙っている敵が倒れたら、生きている敵に合わせる
    if (!state.enemies[target] || state.enemies[target]!.hp <= 0) {
      const alive = state.enemies.findIndex((e) => e.hp > 0);
      if (alive >= 0) setTarget(alive);
    }
  }, [state, target]);

  async function finish() {
    setFinishing(true);
    setError(null);
    try {
      const r = await api.finishAdventure(adventure.adventureId, actions.current);
      await clearAdventure();
      setResult(r);
    } catch (e) {
      if (e instanceof ApiClientError && (e.status === 404 || e.status === 409)) {
        // サーバー側ですでに終わっている（別の冒険を始めた等）
        await clearAdventure();
        onExit(null);
        return;
      }
      // 通信できない時は保存したまま、もう一度送れるようにする
      setError(errorMessage(e));
    } finally {
      setFinishing(false);
    }
  }

  function act(action: PlayerAction) {
    // 連打されても、常に最新の状態に対して1手ずつ進める
    const current = stateRef.current;
    if (current.status !== 'ongoing' || finishing) return;
    const r = applyAction(current, action);
    stateRef.current = r.state;
    actions.current = [...actions.current, action];
    const newLines = toLines(r.events, nextId.current);
    nextId.current += newLines.length;
    setState(r.state);
    setLines((cur) => [...cur, ...newLines].slice(-40));
    void saveAdventure({ ...adventure, actions: encodeActions(actions.current) });
    if (r.state.status !== 'ongoing') void finish();
  }

  if (result) {
    const won = result.status === 'won';
    const nextArea = getArea(area.id + 1);
    return (
      <Screen>
        <Card style={{ alignItems: 'center', gap: space(1.5), paddingVertical: space(4) }}>
          <Text style={{ fontSize: 48 }}>{won ? '🏆' : result.status === 'fled' ? '🏃' : '💫'}</Text>
          <Text style={{ fontSize: 24, fontWeight: '900', color: colors.ink }}>
            {won ? `${area.name}をクリア！` : result.status === 'fled' ? '冒険をあきらめた' : '全滅してしまった…'}
          </Text>
          <Text style={{ fontSize: 14, color: colors.sub, textAlign: 'center', lineHeight: 21 }}>
            {won
              ? result.newlyCleared && nextArea
                ? `次のエリア「${nextArea.name}」に行けるようになりました。`
                : '見事な勝利でした。'
              : 'すれちがいでレベルを上げ、助っ人を集めてまた挑もう。'}
          </Text>
          {adventure.setup.helpers.length > 0 ? (
            <Text style={{ fontSize: 13, color: colors.sub, textAlign: 'center' }}>
              {adventure.setup.helpers.map((h) => h.name).join('、')}は旅に戻っていった。
            </Text>
          ) : null}
        </Card>
        <Button title="ホームへ" onPress={() => onExit(result)} />
      </Screen>
    );
  }

  const p = state.player;
  const hpColor = p.hp < p.maxHp * 0.3 ? colors.hpLow : colors.hp;
  const ongoing = state.status === 'ongoing';

  return (
    <Screen scroll={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>{area.name}</Text>
        <Tag text={state.wave + 1 === state.waveCount ? 'ボス戦' : `${state.wave + 1}/${state.waveCount}戦目`} color={state.wave + 1 === state.waveCount ? colors.accent : colors.sub} />
      </View>

      {/* 敵 */}
      <View style={{ backgroundColor: colors.enemyBg, borderRadius: radius.lg, padding: space(1.5), flexDirection: 'row', gap: space(1), justifyContent: 'center' }}>
        {state.enemies.map((e, i) => {
          const down = e.hp <= 0;
          const selected = i === target && !down;
          return (
            <Pressable
              key={`${state.wave}-${i}`}
              disabled={down}
              onPress={() => setTarget(i)}
              accessibilityLabel={`${e.name} HP${e.hp}`}
              style={{
                flex: 1,
                maxWidth: 140,
                alignItems: 'center',
                padding: space(1),
                borderRadius: radius.md,
                borderWidth: 2,
                borderColor: selected ? '#F2CC8F' : 'transparent',
                opacity: down ? 0.25 : 1,
              }}
            >
              <Text style={{ fontSize: e.boss ? 52 : 40 }}>{e.emoji}</Text>
              <Text style={{ color: colors.enemyInk, fontSize: 12, fontWeight: '700', marginVertical: 4 }} numberOfLines={1}>
                {e.name}
              </Text>
              <View style={{ width: '100%' }}>
                <Bar value={e.hp} max={e.maxHp} color={colors.bad} height={6} />
              </View>
              <Text style={{ color: '#CFC7D8', fontSize: 11, marginTop: 2 }}>
                {e.hp}/{e.maxHp}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ログ */}
      <ScrollView
        ref={logRef}
        onContentSizeChange={() => logRef.current?.scrollToEnd({ animated: true })}
        style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line }}
        contentContainerStyle={{ padding: space(1.5), gap: 4 }}
      >
        {lines.map((l) => (
          <Text
            key={l.id}
            style={{
              fontSize: 13,
              lineHeight: 19,
              color: l.tone === 'enemy' ? colors.bad : l.tone === 'good' ? colors.good : l.tone === 'system' ? colors.gold : colors.ink,
              fontWeight: l.tone === 'system' ? '700' : '400',
            }}
          >
            {l.text}
          </Text>
        ))}
      </ScrollView>

      {/* 味方 */}
      <Card style={{ gap: space(1), padding: space(1.5) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5) }}>
          <Avatar avatar={adventure.setup.player.avatar} job={job} size={40} />
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800', color: colors.ink }}>
                {adventure.setup.player.name} <Text style={{ color: colors.sub, fontWeight: '400' }}>Lv{adventure.setup.player.level}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: colors.sub }}>
                HP {p.hp}/{p.maxHp}　MP {p.mp}/{p.maxMp}
              </Text>
            </View>
            <Bar value={p.hp} max={p.maxHp} color={hpColor} height={8} />
            <Bar value={p.mp} max={p.maxMp} color={colors.mp} height={5} />
          </View>
        </View>
        {adventure.setup.helpers.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(1) }}>
            {adventure.setup.helpers.map((h) => (
              <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 8, borderRadius: 999, backgroundColor: '#F3EBDD' }}>
                <Avatar avatar={h.avatar} job={h.job} size={26} />
                <Text style={{ fontSize: 12, color: jobColors[h.job], fontWeight: '700' }}>
                  {h.name} Lv{h.level}
                </Text>
              </View>
            ))}
            {state.partyBonus ? <Tag text="4ジョブボーナス" color={colors.good} /> : null}
          </View>
        ) : null}
      </Card>

      {/* コマンド */}
      {ongoing ? (
        <View style={{ gap: space(1) }}>
          <View style={{ flexDirection: 'row', gap: space(1) }}>
            <Button style={{ flex: 1 }} title="こうげき" onPress={() => act({ type: 'attack', target })} />
            <Button
              style={{ flex: 1 }}
              kind="secondary"
              title={`${info.skillName}（MP${info.skillCost}）`}
              disabled={p.mp < info.skillCost}
              onPress={() => act({ type: 'skill', target })}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: space(1) }}>
            <Button style={{ flex: 1 }} small kind="secondary" title="ぼうぎょ（MP+2）" onPress={() => act({ type: 'defend' })} />
            <Button style={{ flex: 1 }} small kind="ghost" title="にげる" onPress={() => setFleeAsk(true)} />
          </View>
        </View>
      ) : (
        <View style={{ gap: space(1) }}>
          <ErrorNote text={error} />
          <Button title={finishing ? '結果を送っています…' : '結果を送る'} loading={finishing} onPress={() => void finish()} />
        </View>
      )}

      <Dialog
        visible={fleeAsk}
        title="にげますか？"
        message="冒険はここで終わりです。連れてきた助っ人は帰っていきます。"
        onClose={() => setFleeAsk(false)}
        buttons={[
          { text: 'にげる', kind: 'danger', onPress: () => act({ type: 'flee' }) },
          { text: '戦いを続ける', kind: 'ghost' },
        ]}
      />
    </Screen>
  );
}
