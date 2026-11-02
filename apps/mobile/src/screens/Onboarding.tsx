import { AVATAR_COUNT, JOB_INFO, JOBS, type Job, NAME_MAX_LENGTH, validateDisplayName } from '@pieris/shared';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { api, errorMessage } from '../api';
import { Avatar, Button, Card, ErrorNote, Screen, Title, styles as ui } from '../components/ui';
import { colors, jobColors, radius, space } from '../theme';

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<'name' | 'job'>('name');
  const [name, setName] = useState('');
  const [job, setJob] = useState<Job | null>(null);
  const [avatar, setAvatar] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const nameCheck = validateDisplayName(name);

  async function finish() {
    if (!job || !nameCheck.ok) return;
    setSaving(true);
    setError(null);
    try {
      await api.updateProfile({ name: nameCheck.name, job, avatar });
      onDone();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (step === 'name') {
    return (
      <Screen>
        <Title sub="すれちがった人が、あなたの旅の仲間になる。">すれちがいクエスト</Title>
        <Card style={{ gap: space(1.5) }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>あなたの名前</Text>
          <Text style={ui.titleSub}>すれちがった相手に表示されます（{NAME_MAX_LENGTH}文字まで）。本名や連絡先は入れないでください。</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="たびびと"
            placeholderTextColor={colors.locked}
            maxLength={NAME_MAX_LENGTH * 2}
            autoCorrect={false}
            style={{
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: radius.sm,
              padding: space(1.5),
              fontSize: 18,
              backgroundColor: '#fff',
              color: colors.ink,
            }}
          />
          {name.length > 0 && !nameCheck.ok ? <ErrorNote text={nameCheck.reason} /> : null}
        </Card>
        <Card style={{ gap: space(1.5) }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>アバターの色</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(1.5) }}>
            {Array.from({ length: AVATAR_COUNT }, (_, i) => (
              <Pressable
                key={i}
                accessibilityLabel={`色${i + 1}`}
                onPress={() => setAvatar(i)}
                style={{
                  padding: 3,
                  borderRadius: 999,
                  borderWidth: 2,
                  borderColor: avatar === i ? colors.ink : 'transparent',
                }}
              >
                <Avatar avatar={i} job={null} size={44} />
              </Pressable>
            ))}
          </View>
        </Card>
        <Button title="つぎへ" disabled={!nameCheck.ok} onPress={() => setStep('job')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title sub="あとから変えられません。すれちがった相手には、このジョブの助っ人として届きます。">ジョブを選ぶ</Title>
      {JOBS.map((j) => {
        const info = JOB_INFO[j];
        const selected = job === j;
        return (
          <Pressable key={j} onPress={() => setJob(j)} accessibilityRole="radio" accessibilityState={{ selected }}>
            <Card
              style={{
                flexDirection: 'row',
                gap: space(2),
                alignItems: 'center',
                borderColor: selected ? jobColors[j] : colors.line,
                borderWidth: selected ? 2 : 1,
              }}
            >
              <Avatar avatar={avatar} job={j} size={56} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>{info.name}</Text>
                <Text style={{ fontSize: 13, color: colors.ink }}>{info.description}</Text>
                <Text style={{ fontSize: 12, color: colors.sub }}>
                  技「{info.skillName}」: {info.skillDescription}
                </Text>
                <Text style={{ fontSize: 12, color: jobColors[j], fontWeight: '700' }}>助っ人として: {info.helperDescription}</Text>
              </View>
            </Card>
          </Pressable>
        );
      })}
      <ErrorNote text={error} />
      <Button title="冒険をはじめる" disabled={!job} loading={saving} onPress={finish} />
      <Button title="もどる" kind="ghost" onPress={() => setStep('name')} />
    </Screen>
  );
}
