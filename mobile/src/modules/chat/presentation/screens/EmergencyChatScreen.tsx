import { useMemo, useState } from 'react';
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
  return <EmergencyChatConversation emergency={emergency} profile={profile} />;
}

function EmergencyChatConversation({ emergency, profile }: { emergency: Emergency; profile: UserProfileView }) {
  const { t } = useI18n();
  const { colors, spacing } = useAppTheme();
  const [text, setText] = useState('');
  const confirmedStatus = emergency.status === 'active' ? 'ACTIVE'
    : emergency.status === 'inProgress' ? 'IN_PROGRESS'
      : emergency.status === 'offline' ? 'OFFLINE' : 'FINALIZED';
  const chat = useEmergencyChat(emergency.id, confirmedStatus);
  const send = () => { if (chat.send(text)) setText(''); };

  return (
    <AppScreen>
      <ScreenHeader canGoBack title={t('chat.title')} subtitle={t('emergency.reference', { id: emergency.id })} />
      {chat.error ? <View style={{ height: spacing.sm }}>
        <StatusBanner tone="danger" title={t('common.error')} message={chat.error} />
      </View> : null}
      <View style={{ height: spacing.lg }} />
      {chat.loading ? <StatusBanner title={t('common.loading')} /> : chat.messages.length === 0 ? (
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
        {chat.canCompose ? <>
          <AppInput value={text} onChangeText={setText} placeholder={t('chat.placeholder')} multiline maxLength={500} />
          <AppButton title={t('chat.send')} onPress={send} disabled={!text.trim() || chat.pending !== null} />
          {chat.pending ? <AppButton title={t('common.retry')} onPress={chat.retryPending} variant="outline" /> : null}
        </> : <>
          <StatusBanner tone="warning" title={chat.status === 'FINALIZED' ? t('chat.closed') : t('chat.offline')} />
          {chat.connection === 'degraded' ? <AppButton title={t('common.retry')} onPress={() => void chat.recover()} variant="outline" /> : null}
        </>}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '84%', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 8 },
});
