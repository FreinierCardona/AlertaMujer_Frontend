import { useContext } from 'react';
import { I18nContext } from './I18nProvider';

export function useI18n() {
  const i18n = useContext(I18nContext);

  if (!i18n) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return i18n;
}
