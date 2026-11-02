import { useState } from 'react';
import { Text, View } from 'react-native';
import { api, errorMessage, forgetToken } from '../api';
import { clearAdventure } from '../adventure';
import { Button, Card, Dialog, ErrorNote, Screen, Title } from '../components/ui';
import { colors, space } from '../theme';

const PRIVACY = [
  '位置は端末の中で約150m四方のマスに丸めてから送ります。正確な緯度経度はサーバーに届きません。',
  '位置の記録は48時間で自動的に消えます。すれちがいの記録には日付だけを残し、時刻と場所は残しません。',
  '相手には、あなたの名前・アバター・ジョブ・レベルだけが届きます。届くのは1〜3時間後なので「今どこにいるか」は分かりません。',
  'メッセージなど、ユーザー同士のやり取りの機能はありません。',
  '歩数はその日の合計だけを送ります（旅人が加わる計算に使います）。',
  '位置情報を「アプリの使用中のみ」許可すれば遊べます。常に許可する必要はありません。',
];

export function Settings({ onBack, onDeleted }: { onBack: () => void; onDeleted: () => void }) {
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    try {
      await api.deleteAccount();
      await clearAdventure();
      await forgetToken();
      onDeleted();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>このアプリについて</Title>
      <Card style={{ gap: space(1.5) }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>遊び方</Text>
        <Text style={{ fontSize: 14, color: colors.ink, lineHeight: 21 }}>
          出かけた先でアプリを開くと、近くで同じようにアプリを開いた人と「すれちがい」ます。すれちがった人は1〜3時間後に助っ人として届き、すれちがった人数であなたのレベルが上がります。
          {'\n\n'}
          歩いたり移動したりすると、旅人（NPCの助っ人）も加わります。助っ人は冒険で1回力を貸すと帰っていくので、また出かけて新しい人とすれちがおう。
        </Text>
      </Card>
      <Card style={{ gap: space(1) }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>プライバシー</Text>
        {PRIVACY.map((t) => (
          <View key={t} style={{ flexDirection: 'row', gap: 6 }}>
            <Text style={{ color: colors.sub }}>・</Text>
            <Text style={{ flex: 1, fontSize: 13, color: colors.ink, lineHeight: 20 }}>{t}</Text>
          </View>
        ))}
      </Card>
      <Card style={{ gap: space(1.5) }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>アカウントの削除</Text>
        <Text style={{ fontSize: 13, color: colors.sub, lineHeight: 20 }}>
          レベル・助っ人・クリアしたエリアなど、この端末の記録をすべてサーバーから消します。元には戻せません。
        </Text>
        <ErrorNote text={error} />
        <Button title="アカウントを削除する" kind="danger" loading={busy} onPress={() => setAsk(true)} />
      </Card>
      <Button title="もどる" kind="ghost" onPress={onBack} />
      <Dialog
        visible={ask}
        title="本当に削除しますか？"
        message="すべての記録が消え、元には戻せません。"
        onClose={() => setAsk(false)}
        buttons={[
          { text: '削除する', kind: 'danger', onPress: () => void deleteAccount() },
          { text: 'やめる', kind: 'ghost' },
        ]}
      />
    </Screen>
  );
}
