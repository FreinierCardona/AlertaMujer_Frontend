import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { AppState, View, Vibration } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { contactAlertsApi, type ContactAlertSummary } from '@core/api';
import AppButton from '@shared/ui/AppButton';
import StatusBanner from '@shared/ui/StatusBanner';
import { useAppTheme } from '@shared/theme';

function enableLoop(player: ReturnType<typeof useAudioPlayer>) { player.loop = true; }

export default function ContactAlertNotice() {
  const [notice, setNotice] = useState<ContactAlertSummary | null>(null);
  const seen = useRef(new Set<string>());
  const router = useRouter();
  const pathname = usePathname();
  const player = useAudioPlayer(require('../../../../../assets/sounds/contact-alert.wav'));
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  useEffect(() => {
    let disposed = false;
    let busy = false;
    const poll = async () => {
      if (busy || AppState.currentState !== 'active') return;
      busy = true;
      try {
        const alerts: ContactAlertSummary[] = [];
        let page = 0;
        let total = 0;
        do {
          const response = await contactAlertsApi.list(page++, 50);
          alerts.push(...response.items); total = response.total;
          if (!response.items.length) break;
        } while (!disposed && alerts.length < total);
        if (disposed) return;
        const incoming = alerts.find((alert) => !seen.current.has(alert.emergencyId));
        if (incoming && !notice) {
          seen.current.add(incoming.emergencyId); setNotice((current) => current ?? incoming); Vibration.vibrate([0, 300, 150, 300]);
        } else setNotice((current) => current && alerts.some((alert) => alert.emergencyId === current.emergencyId) ? current : null);
      } catch { /* La pantalla autorizada de notificaciones proporciona reintentos y errores. */ }
      finally { busy = false; }
    };
    void poll();
    const timer = setInterval(() => void poll(), 10000);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void poll(); });
    return () => { disposed = true; clearInterval(timer); subscription.remove(); };
  }, [notice, player]);
  useEffect(() => {
    if (!notice) { player.pause(); return; }
    if (pathname === `/notifications/${notice.emergencyId}`) {
      const timer = setTimeout(() => setNotice(null), 0);
      return () => clearTimeout(timer);
    }
    enableLoop(player);
    player.play();
    return () => { player.pause(); };
  }, [notice, pathname, player]);
  if (!notice) return null;
  return <View style={{ position: 'absolute', top: insets.top + 8, left: 12, right: 12, zIndex: 100, padding: 12, borderRadius: 16, backgroundColor: colors.white }}>
    <StatusBanner tone="danger" title="Nueva alerta de un contacto" message={`${notice.userDisplayName} necesita ayuda.`} />
    <AppButton title="Ver alerta" onPress={() => {
      const id = notice.emergencyId; setNotice(null);
      router.push({ pathname: '/notifications/[id]', params: { id } });
    }} />
  </View>;
}
