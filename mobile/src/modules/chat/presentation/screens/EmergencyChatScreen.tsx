import NetInfo from '@react-native-community/netinfo';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import Routes from '@shell/navigation/routes';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import useAppState from '@shell/providers/useAppState';
import { useEmergencyChat } from '@modules/chat/presentation/hooks/useEmergencyChat';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import type { Emergency, UserProfileView } from '@shell/providers/AppStateProvider';

export default function EmergencyChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeEmergency, history, profile } = useAppState();
  const emergency = useMemo(
    () => activeEmergency?.id === id ? activeEmergency : history.find((item) => item.id === id),
    [activeEmergency, history, id],
  );
  if (!emergency) return <Redirect href={Routes.history} />;
  return <EmergencyChatConversation key={emergency.id} emergency={emergency} profile={profile} />;
}

function EmergencyChatConversation({ emergency, profile }: { emergency: Emergency; profile: UserProfileView }) {
  const { t } = useI18n();
  const { colors, spacing } = useAppTheme();
  const [internet, setInternet] = useState<boolean | null>(null);
  useEffect(() => NetInfo.addEventListener((state) => setInternet(Boolean(state.isConnected && state.isInternetReachable !== false))), []);
  const [text, setText] = useState('');
  const confirmedStatus = emergency.status === 'active' ? 'ACTIVE'
    : emergency.status === 'inProgress' ? 'IN_PROGRESS'
      : emergency.status === 'offline' ? 'OFFLINE' : 'FINALIZED';
  const chat = useEmergencyChat(emergency.id, confirmedStatus);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const confirmed = submitted !== null && !chat.pending && chat.messages.some((item) => item.content === submitted && item.senderUserId === profile.userId);
  const draft = confirmed ? '' : text;
  const send = () => { setSubmitted(draft.trim()); chat.send(draft); };

  return (
    <AppScreen>
      <ScreenHeader canGoBack title={t('chat.title')} />
      {internet === false ? <StatusBanner tone="warning" title="Sin conexión a Internet" message="Tu borrador se conserva." /> : null}
      {chat.error ? <View style={{ marginBottom: spacing.sm }}>
        <StatusBanner tone="danger" title={t('common.error')} message={chat.error} />
      </View> : null}
      <View style={{ height: spacing.lg }} />
      {chat.loading && chat.messages.length === 0 ? <StatusBanner title={t('common.loading')} /> : chat.messages.length === 0 ? (
        <StatusBanner title={t('chat.empty')} />
      ) : chat.messages.map((message) => (
        <View key={message.messageId} style={[
          styles.bubble,
          {
            alignSelf: message.senderUserId === profile.userId ? 'flex-end' : 'flex-start',
            backgroundColor: message.senderUserId === profile.userId ? colors.cardPurple : colors.white,
            borderColor: colors.inputBorder,
          },
        ]}>
          <Text style={{ color: colors.textMedium, fontSize: 11 }}>
            {message.senderUserId === profile.userId ? t('chat.user') : message.senderRole === 'ENTITY_ADMIN' ? t('chat.admin') : t('chat.user')} · {new Date(message.sentAt).toLocaleTimeString()}
          </Text>
          <Text style={{ color: colors.textDark, marginTop: 3 }}>{message.content}</Text>
        </View>
      ))}
      <View style={{ marginTop: spacing.lg }}>
        {chat.status !== 'FINALIZED' ? <><AppInput value={draft} onChangeText={(value) => { setText(value); setSubmitted(null); }} placeholder={t('chat.placeholder')} multiline maxLength={500} editable={!chat.pending} />
        <AppButton title={t('chat.send')} onPress={send} disabled={!chat.canCompose || !draft.trim() || chat.pending !== null} />
        {chat.pending ? <><StatusBanner title="Mensaje pendiente de confirmación" message={chat.pending.content} /><AppButton title={t('common.retry')} onPress={chat.retryPending} disabled={!chat.canCompose} variant="outline" /></> : null}
        {chat.connection !== 'connected' ? <StatusBanner tone="warning" title="Reconectando conversación" message="Tu borrador se conserva. El canal del chat está desconectado." /> : null}
        {chat.status === 'OFFLINE' ? <StatusBanner tone="warning" title="Ubicación pendiente de sincronización" /> : null}
        </> : <StatusBanner title={t('chat.closed')} />}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '84%', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 8 },
});
