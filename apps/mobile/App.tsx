import type { MeResponse } from '@pieris/shared';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { type SavedAdventure, loadAdventure, saveAdventure } from './src/adventure';
import { ApiClientError, api, errorMessage } from './src/api';
import { Button, Loading, Screen, Title } from './src/components/ui';
import { Battle } from './src/screens/Battle';
import { Home } from './src/screens/Home';
import { Onboarding } from './src/screens/Onboarding';
import { Prepare } from './src/screens/Prepare';
import { Settings } from './src/screens/Settings';
import { currentCell, startStepWatch, stopStepWatch, todaySteps } from './src/sensors';
import { colors } from './src/theme';

type Route =
  | { name: 'loading' }
  | { name: 'error'; message: string }
  | { name: 'onboarding' }
  | { name: 'home' }
  | { name: 'prepare' }
  | { name: 'battle'; adventure: SavedAdventure }
  | { name: 'settings' };

/** アプリが前に出てきた時の自動確認は、この間隔より短いと行わない */
const AUTO_SYNC_GAP_MS = 60 * 1000;

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'loading' });
  const [me, setMe] = useState<MeResponse | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const lastSync = useRef(0);
  const routeRef = useRef(route);
  routeRef.current = route;

  const refreshMe = useCallback(async () => {
    const m = await api.me();
    setMe(m);
    return m;
  }, []);

  // 位置と歩数を送って、すれちがい・旅人を確かめる
  const sync = useCallback(
    async (manual: boolean) => {
      if (!manual && Date.now() - lastSync.current < AUTO_SYNC_GAP_MS) return;
      lastSync.current = Date.now();
      setSyncing(true);
      const notes: string[] = [];
      try {
        const cell = await currentCell();
        if (cell.ok) {
          const r = await api.ping(cell.cell);
          if (r.accepted) {
            notes.push('位置を送りました。近くにいた人は1〜3時間後に助っ人として届きます。');
            if (r.addedDistanceMeters > 0) notes.push(`移動距離 +${(r.addedDistanceMeters / 1000).toFixed(1)}km`);
            if (r.newTravelers > 0) notes.push(`旅人が${r.newTravelers}人加わった！`);
          } else if (manual) {
            notes.push('すれちがいは5分に1回まで確かめられます。少し待ってからもう一度どうぞ。');
          }
        } else if (cell.reason === 'denied') {
          notes.push('位置情報が許可されていないため、すれちがいを確かめられません。設定から「アプリの使用中のみ」を許可してください。');
        } else {
          notes.push('今いる場所が分かりませんでした。屋外で試してください。');
        }
        const steps = await todaySteps();
        if (steps) {
          const s = await api.steps(steps.date, steps.steps);
          if (s.newTravelers > 0) notes.push(`歩いたので旅人が${s.newTravelers}人加わった！`);
        }
        await refreshMe();
      } catch (e) {
        notes.push(errorMessage(e));
      } finally {
        setSyncing(false);
        if (notes.length > 0) setSyncNote(notes.join(' '));
      }
    },
    [refreshMe],
  );

  const boot = useCallback(async () => {
    setRoute({ name: 'loading' });
    try {
      const m = await refreshMe();
      if (!m.name || !m.job) {
        setRoute({ name: 'onboarding' });
        return;
      }
      // 途中で閉じた冒険があれば再開する
      const saved = await loadAdventure();
      setRoute(saved ? { name: 'battle', adventure: saved } : { name: 'home' });
      void sync(false);
    } catch (e) {
      if (e instanceof ApiClientError && e.status === 401) {
        // アカウントが消えていた → 作り直す
        void boot();
        return;
      }
      setRoute({ name: 'error', message: errorMessage(e) });
    }
  }, [refreshMe, sync]);

  useEffect(() => {
    void boot();
    void startStepWatch();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && routeRef.current.name === 'home') void sync(false);
    });
    return () => {
      sub.remove();
      stopStepWatch();
    };
  }, [boot, sync]);

  async function startAdventure(areaId: number, helperIds: string[]) {
    const r = await api.startAdventure(areaId, helperIds);
    const adventure: SavedAdventure = { adventureId: r.adventureId, seed: r.seed, setup: r.setup, actions: '' };
    await saveAdventure(adventure);
    setRoute({ name: 'battle', adventure });
  }

  let body;
  switch (route.name) {
    case 'loading':
      body = <Loading text="旅の支度をしています…" />;
      break;
    case 'error':
      body = (
        <Screen>
          <Title sub={route.message}>つながりませんでした</Title>
          <Button title="もう一度" onPress={() => void boot()} />
        </Screen>
      );
      break;
    case 'onboarding':
      body = <Onboarding onDone={() => void boot()} />;
      break;
    case 'home':
      body = me ? (
        <Home
          me={me}
          syncing={syncing}
          syncNote={syncNote}
          onSync={() => void sync(true)}
          onAdventure={() => setRoute({ name: 'prepare' })}
          onSettings={() => setRoute({ name: 'settings' })}
        />
      ) : (
        <Loading />
      );
      break;
    case 'prepare':
      body = me ? <Prepare me={me} onBack={() => setRoute({ name: 'home' })} onStart={startAdventure} /> : <Loading />;
      break;
    case 'battle':
      body = (
        <Battle
          adventure={route.adventure}
          onExit={() => {
            setRoute({ name: 'home' });
            void refreshMe().catch(() => {});
          }}
        />
      );
      break;
    case 'settings':
      body = <Settings onBack={() => setRoute({ name: 'home' })} onDeleted={() => void boot()} />;
      break;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {body ?? <Text style={{ color: colors.ink }}>…</Text>}
    </SafeAreaProvider>
  );
}
