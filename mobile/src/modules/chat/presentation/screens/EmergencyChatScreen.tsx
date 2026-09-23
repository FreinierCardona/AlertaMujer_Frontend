// Muestra conversación local vinculada a una alerta y bloquea envíos fuera de línea o finalizados.
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
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
export default function EmergencyChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeEmergency, history, requirements, sendMessage } = useAppState();
  const { t } = useI18n();
  const { colors, spacing } = useAppTheme();
  const [text, setText] = useState('');
  const [error, setError] = useState(false);
  const emergency = useMemo(
    () =>
      activeEmergency?.id === id
        ? activeEmergency
        : history.find((item) => item.id === id),
    [activeEmergency, history, id],
  );
  if (!emergency) return <Redirect href={Routes.history} />;
  const open = activeEmergency?.id === id;
  const send = () => {
    if (!sendMessage(text)) {
      setError(true);
      return;
    }
    setText('');
    setError(false);
  };
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('chat.title')}
        subtitle={t('emergency.reference', { id: emergency.id })}
      />
      {error ? (
        <View style={{ height: spacing.sm }}>
          <StatusBanner
            tone="danger"
            title={t('chat.offline')}
          />
        </View>
      ) : null}
      <View style={{ height: spacing.lg }} />
      {emergency.chat.length === 0 ? (
        <StatusBanner title={t('chat.empty')} />
      ) : (
        emergency.chat.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              {
                alignSelf:
                  message.author === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor:
                  message.author === 'user' ? colors.cardPurple : colors.white,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Text style={{ color: colors.textMedium, fontSize: 11 }}>
              {message.author === 'user' ? t('chat.user') : t('chat.admin')} ·{' '}
              {new Date(message.createdAt).toLocaleTimeString()}
            </Text>
            <Text style={{ color: colors.textDark, marginTop: 3 }}>
              {message.text}
            </Text>
          </View>
        ))
      )}
      <View style={{ marginTop: spacing.lg }}>
        {open ? (
          <>
            <AppInput
              value={text}
              onChangeText={setText}
              placeholder={t('chat.placeholder')}
              multiline
            />
            <AppButton
              title={t('chat.send')}
              onPress={send}
              disabled={!text.trim() || !requirements.connection}
            />
            {!requirements.connection ? (
              <StatusBanner
                tone="warning"
                title={t('chat.offline')}
              />
            ) : null}
          </>
        ) : (
          <StatusBanner
            tone="warning"
            title={t('chat.closed')}
          />
        )}
      </View>
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  bubble: {
    maxWidth: '84%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
});
