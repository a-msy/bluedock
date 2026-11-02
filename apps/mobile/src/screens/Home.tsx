import { AREAS, JOB_INFO, type MeResponse } from '@pieris/shared';
import { Text, View } from 'react-native';
import { Avatar, Bar, Button, Card, JobTag, Screen, Stat, styles as ui } from '../components/ui';
import { colors, space } from '../theme';

export function Home({
  me,
  syncing,
  syncNote,
  onSync,
  onAdventure,
  onSettings,
}: {
  me: MeResponse;
  syncing: boolean;
  syncNote: string | null;
  onSync: () => void;
  onAdventure: () => void;
  onSettings: () => void;
}) {
  const p = me.progress;
  const span = p.nextAt === null ? 1 : p.nextAt - p.currentFloor;
  const into = p.nextAt === null ? 1 : p.count - p.currentFloor;
  const nextArea = AREAS.find((a) => a.id === me.clearedArea + 1);
  const allCleared = me.clearedArea >= AREAS.length;

  return (
    <Screen>
      <Card style={{ gap: space(1.5) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
          <Avatar avatar={me.avatar} job={me.job} size={64} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.ink }}>{me.name}</Text>
            <View style={{ flexDirection: 'row', gap: space(1), alignItems: 'center' }}>
              {me.job ? <JobTag job={me.job} /> : null}
              <Text style={{ fontSize: 13, color: colors.sub }}>{me.job ? `技「${JOB_INFO[me.job].skillName}」` : ''}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: colors.sub }}>レベル</Text>
            <Text style={{ fontSize: 34, fontWeight: '900', color: colors.ink, lineHeight: 38 }}>{p.level}</Text>
          </View>
        </View>
        <Bar value={into} max={span} color={colors.gold} />
        <Text style={{ fontSize: 13, color: colors.sub }}>
          {p.nextAt === null ? `最大レベル（累計${p.count}人）` : `次のレベルまで あと${p.remaining}人（累計${p.count}人）`}
        </Text>
      </Card>

      <Card style={{ gap: space(1.5) }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>今日の旅</Text>
        <View style={{ flexDirection: 'row' }}>
          <Stat label="すれちがい" value={`${me.today.encounters}/${me.today.encounterCap}`} sub="人" />
          <Stat label="旅人" value={`${me.today.travelers}/${me.today.travelerCap}`} sub="人" />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Stat label="歩数" value={me.today.steps.toLocaleString()} sub="2,000歩ごとに旅人1人" />
          <Stat label="移動距離" value={`${(me.today.distanceMeters / 1000).toFixed(1)}km`} sub="10kmごとに旅人1人" />
        </View>
        <Button title="すれちがいを確かめる" kind="secondary" loading={syncing} onPress={onSync} />
        <Text style={{ fontSize: 12, color: colors.sub, lineHeight: 18 }}>
          {syncNote ?? '出かけた先でアプリを開くと、近くにいた人と「すれちがい」ます。相手は1〜3時間後に助っ人として届きます。'}
        </Text>
      </Card>

      <Card style={{ gap: space(1.5) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>待っている助っ人</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: colors.accent }}>
            {me.available}
            <Text style={{ fontSize: 14, color: colors.sub }}> 人</Text>
          </Text>
        </View>
        <Text style={ui.titleSub}>
          {allCleared
            ? 'すべてのエリアをクリアしました。何度でも挑戦できます。'
            : `次の目的地: ${nextArea?.name}（推奨レベル${nextArea?.recommendedLevel}・助っ人3人）`}
        </Text>
        <Button title="冒険に出る" onPress={onAdventure} />
      </Card>

      <Button title="このアプリについて・設定" kind="ghost" small onPress={onSettings} />
    </Screen>
  );
}
