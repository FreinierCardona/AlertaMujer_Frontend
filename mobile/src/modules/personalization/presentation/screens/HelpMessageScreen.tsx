// Edita el mensaje copiado en alertas futuras y permite restaurarlo con confirmación.
import { useState } from 'react';
import AppScreen from '@shared/ui/AppScreen';
import AppInput from '@shared/ui/AppInput';
import AppButton from '@shared/ui/AppButton';
import ScreenHeader from '@shared/ui/ScreenHeader';
import StatusBanner from '@shared/ui/StatusBanner';
import ConfirmModal from '@shared/ui/ConfirmModal';
import useAppState from '@shell/providers/useAppState';
import { DEFAULT_HELP_MESSAGE } from '@shell/providers/AppStateProvider';
import { useI18n } from '@shared/i18n';
export default function HelpMessageScreen() {
  const { helpMessage, setHelpMessage } = useAppState();
  const { t } = useI18n();
  const [value, setValue] = useState(helpMessage);
  const [saved, setSaved] = useState(false);
  const [restore, setRestore] = useState(false);
  return (
    <AppScreen>
      <ScreenHeader
        canGoBack
        title={t('message.title')}
        subtitle={t('message.description')}
      />
      {saved ? (
        <StatusBanner
          tone="success"
          title={t('common.success')}
        />
      ) : null}
      <AppInput
        multiline
        maxLength={300}
        value={value}
        onChangeText={(text) => {
          setValue(text);
          setSaved(false);
        }}
        error={!value.trim() ? t('validation.required') : undefined}
      />
      <AppButton
        title={t('common.save')}
        disabled={!value.trim()}
        onPress={() => {
          setHelpMessage(value.trim());
          setSaved(true);
        }}
      />
      <AppButton
        title={t('message.restore')}
        onPress={() => setRestore(true)}
        variant="ghost"
      />
      <ConfirmModal
        visible={restore}
        title={t('message.restoreTitle')}
        message={t('message.restoreBody')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setRestore(false)}
        onConfirm={() => {
          setValue(DEFAULT_HELP_MESSAGE);
          setHelpMessage(DEFAULT_HELP_MESSAGE);
          setRestore(false);
          setSaved(true);
        }}
      />
    </AppScreen>
  );
}
