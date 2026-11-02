import { JOB_INFO, type Job } from '@pieris/shared';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { avatarColors, colors, jobColors, radius, space } from '../theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <View style={{ marginBottom: space(2) }}>
      <Text style={styles.title}>{children}</Text>
      {sub ? <Text style={styles.titleSub}>{sub}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  kind = 'primary',
  disabled,
  loading,
  small,
  style,
}: {
  title: string;
  onPress: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    kind === 'primary' ? colors.accent : kind === 'danger' ? colors.bad : kind === 'secondary' ? colors.card : 'transparent';
  const fg = kind === 'primary' || kind === 'danger' ? colors.accentInk : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, borderColor: kind === 'secondary' ? colors.line : 'transparent' },
        (disabled || loading) && { opacity: 0.45 },
        pressed && { transform: [{ translateY: 1 }], opacity: 0.85 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

/** 丸いアバター。色はアバター番号、縁取りと記号はジョブ */
export function Avatar({ avatar, job, size = 48, dim }: { avatar: number; job: Job | null; size?: number; dim?: boolean }) {
  const ring = job ? jobColors[job] : colors.line;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: avatarColors[avatar % avatarColors.length],
        borderWidth: Math.max(2, size / 16),
        borderColor: ring,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: dim ? 0.4 : 1,
      }}
    >
      {job ? <Text style={{ fontSize: size * 0.42 }}>{JOB_INFO[job].emoji}</Text> : null}
    </View>
  );
}

export function JobTag({ job }: { job: Job }) {
  return (
    <View style={[styles.tag, { backgroundColor: jobColors[job] }]}>
      <Text style={styles.tagText}>{JOB_INFO[job].name}</Text>
    </View>
  );
}

export function Tag({ text, color = colors.gold }: { text: string; color?: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}

export function Bar({ value, max, color, height = 10 }: { value: number; max: number; color: string; height?: number }) {
  const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: colors.line, overflow: 'hidden' }}>
      <View style={{ width: `${ratio * 100}%`, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

export interface DialogButton {
  text: string;
  kind?: ButtonKind;
  onPress?: () => void;
}

/** どのプラットフォームでも同じに動く確認ダイアログ（WebではAlertのボタンが使えないため） */
export function Dialog({
  visible,
  title,
  message,
  buttons,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <Text style={styles.dialogTitle}>{title}</Text>
          {message ? <Text style={styles.dialogMessage}>{message}</Text> : null}
          {children}
          <View style={{ gap: space(1), marginTop: space(2) }}>
            {buttons.map((b) => (
              <Button
                key={b.text}
                title={b.text}
                kind={b.kind ?? 'secondary'}
                onPress={() => {
                  onClose();
                  b.onPress?.();
                }}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function Loading({ text }: { text?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.accent} size="large" />
      {text ? <Text style={[styles.titleSub, { marginTop: space(2) }]}>{text}</Text> : null}
    </View>
  );
}

export function ErrorNote({ text }: { text: string | null }) {
  if (!text) return null;
  return <Text style={styles.error}>{text}</Text>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: space(2.5), paddingBottom: space(5), gap: space(2) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: 0.5 },
  titleSub: { fontSize: 14, color: colors.sub, marginTop: 4, lineHeight: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: space(2),
    borderWidth: 1,
    borderColor: colors.line,
  },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space(2),
    borderWidth: 1,
  },
  buttonSmall: { minHeight: 40, paddingHorizontal: space(1.5) },
  buttonText: { fontSize: 16, fontWeight: '700' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, alignSelf: 'flex-start' },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stat: { flex: 1, alignItems: 'flex-start' },
  statLabel: { fontSize: 12, color: colors.sub },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.ink, marginTop: 2 },
  statSub: { fontSize: 11, color: colors.sub },
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: space(3) },
  dialog: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space(3), width: '100%', maxWidth: 420 },
  dialogTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  dialogMessage: { fontSize: 14, color: colors.sub, marginTop: space(1), lineHeight: 21 },
  error: { color: colors.bad, fontSize: 14, lineHeight: 20 },
});
