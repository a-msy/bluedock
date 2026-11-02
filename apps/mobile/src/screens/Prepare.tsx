import { AREAS, type HelperCard, JOB_INFO, JOBS, type Job, type MeResponse, PARTY_HELPER_MAX } from '@pieris/shared';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { api, errorMessage } from '../api';
import { Avatar, Button, Card, Dialog, ErrorNote, JobTag, Loading, Screen, Tag, Title, styles as ui } from '../components/ui';
import { colors, jobColors, space } from '../theme';

const REPORT_REASONS = ['名前が不適切', '名前に連絡先が書かれている', 'その他'];

export function Prepare({
  me,
  onBack,
  onStart,
}: {
  me: MeResponse;
  onBack: () => void;
  onStart: (areaId: number, helperIds: string[]) => Promise<void>;
}) {
  const [helpers, setHelpers] = useState<HelperCard[] | null>(null);
  const [areaId, setAreaId] = useState(Math.min(me.clearedArea + 1, AREAS.length));
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [menuFor, setMenuFor] = useState<HelperCard | null>(null);
  const [reportFor, setReportFor] = useState<HelperCard | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setHelpers((await api.helpers()).helpers);
    } catch (e) {
      setError(errorMessage(e));
      setHelpers([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function toggle(id: string) {
    setPicked((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= PARTY_HELPER_MAX ? cur : [...cur, id],
    );
  }

  async function start() {
    setStarting(true);
    setError(null);
    try {
      await onStart(areaId, picked);
    } catch (e) {
      setError(errorMessage(e));
      setStarting(false);
    }
  }

  async function block(h: HelperCard) {
    try {
      await api.block(h.id);
      setPicked((cur) => cur.filter((x) => x !== h.id));
      setNotice(`${h.name}さんをブロックしました。これからはすれちがいません。`);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function report(h: HelperCard, reason: string) {
    try {
      await api.report(h.id, reason);
      setNotice('通報を受け付けました。ありがとうございます。');
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  if (!helpers) return <Loading text="助っ人を呼んでいます…" />;

  const partyJobs = new Set<Job>([...(me.job ? [me.job] : []), ...helpers.filter((h) => picked.includes(h.id)).map((h) => h.job)]);
  const bonus = JOBS.every((j) => partyJobs.has(j));
  const area = AREAS.find((a) => a.id === areaId)!;

  return (
    <Screen>
      <Title sub="行き先と、連れて行く助っ人（3人まで）を選びます。">冒険の準備</Title>

      <Card style={{ gap: space(1) }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>行き先</Text>
        {AREAS.map((a) => {
          const locked = a.id > me.clearedArea + 1;
          const cleared = a.id <= me.clearedArea;
          const selected = a.id === areaId;
          return (
            <Pressable
              key={a.id}
              disabled={locked}
              onPress={() => setAreaId(a.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: space(1),
                paddingHorizontal: space(1.5),
                borderRadius: 10,
                backgroundColor: selected ? '#F3E3D2' : 'transparent',
                opacity: locked ? 0.45 : 1,
              }}
            >
              <Text style={{ width: 28, fontSize: 16 }}>{locked ? '🔒' : cleared ? '✅' : '🚩'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: selected ? '800' : '600', color: colors.ink }}>
                  {a.id}. {a.name}
                </Text>
                {selected ? <Text style={{ fontSize: 12, color: colors.sub }}>{a.description}</Text> : null}
              </View>
              <Text style={{ fontSize: 12, color: colors.sub }}>推奨Lv{a.recommendedLevel}</Text>
            </Pressable>
          );
        })}
      </Card>

      <Card style={{ gap: space(1.5) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>
            助っ人 {picked.length}/{PARTY_HELPER_MAX}
          </Text>
          {bonus ? <Tag text="4ジョブそろった！ ボーナス" color={colors.good} /> : null}
        </View>
        {helpers.length === 0 ? (
          <Text style={ui.titleSub}>
            まだ助っ人がいません。出かけた先でアプリを開くか、歩いたり移動したりすると旅人が加わります。エリア1はひとりでも越えられます。
          </Text>
        ) : (
          <View style={{ gap: space(1) }}>
            {helpers.map((h) => {
              const on = picked.includes(h.id);
              const full = !on && picked.length >= PARTY_HELPER_MAX;
              return (
                <Pressable
                  key={h.id}
                  onPress={() => toggle(h.id)}
                  onLongPress={() => !h.npc && setMenuFor(h)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space(1.5),
                    padding: space(1),
                    borderRadius: 12,
                    borderWidth: on ? 2 : 1,
                    borderColor: on ? jobColors[h.job] : colors.line,
                    backgroundColor: on ? '#FFF6EA' : colors.card,
                    opacity: full ? 0.5 : 1,
                  }}
                >
                  <Avatar avatar={h.avatar} job={h.job} size={44} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>{h.name}</Text>
                      {h.isNew ? <Tag text="NEW" color={colors.accent} /> : null}
                      {h.npc ? <Tag text="旅人" color={colors.sub} /> : null}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <JobTag job={h.job} />
                      <Text style={{ fontSize: 12, color: colors.sub }}>
                        Lv{h.level}・{JOB_INFO[h.job].helperDescription}
                      </Text>
                    </View>
                  </View>
                  {!h.npc ? (
                    <Pressable accessibilityLabel={`${h.name}のメニュー`} hitSlop={10} onPress={() => setMenuFor(h)}>
                      <Text style={{ fontSize: 20, color: colors.sub, paddingHorizontal: 6 }}>⋯</Text>
                    </Pressable>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </Card>

      {notice ? <Text style={{ color: colors.good, fontSize: 14 }}>{notice}</Text> : null}
      <ErrorNote text={error} />
      <Button title={`${area.name}へ出発`} loading={starting} onPress={() => (picked.length > 0 ? setConfirm(true) : start())} />
      <Button title="もどる" kind="ghost" onPress={onBack} />

      <Dialog
        visible={confirm}
        title="出発しますか？"
        message={`連れて行く助っ人${picked.length}人は、この冒険で力を貸したら帰っていきます（勝っても負けても）。`}
        onClose={() => setConfirm(false)}
        buttons={[
          { text: '出発する', kind: 'primary', onPress: () => void start() },
          { text: 'やめる', kind: 'ghost' },
        ]}
      />
      <Dialog
        visible={menuFor !== null}
        title={menuFor?.name ?? ''}
        message="この人の名前に問題があれば、通報やブロックができます。"
        onClose={() => setMenuFor(null)}
        buttons={[
          { text: '名前を通報する', onPress: () => menuFor && setReportFor(menuFor) },
          { text: 'ブロックする（以後すれちがわない）', kind: 'danger', onPress: () => menuFor && void block(menuFor) },
          { text: 'とじる', kind: 'ghost' },
        ]}
      />
      <Dialog
        visible={reportFor !== null}
        title="通報の理由"
        onClose={() => setReportFor(null)}
        buttons={[
          ...REPORT_REASONS.map((r) => ({ text: r, onPress: () => reportFor && void report(reportFor, r) })),
          { text: 'やめる', kind: 'ghost' as const },
        ]}
      />
    </Screen>
  );
}
