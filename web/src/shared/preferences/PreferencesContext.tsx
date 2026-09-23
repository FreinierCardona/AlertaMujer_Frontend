// Mantiene idioma y modo visual globales, persistentes e independientes de la navegación.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { messages, type MessageKey } from '../i18n/messages';
import type { Language, ThemeMode } from '../types/models';

interface PreferencesValue {
  language: Language;
  theme: ThemeMode;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  t: (key: MessageKey) => string;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

function readPreference<T extends string>(
  key: string,
  allowed: T[],
  fallback: T,
): T {
  const stored = window.localStorage.getItem(key) as T | null;
  return stored && allowed.includes(stored) ? stored : fallback;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() =>
    readPreference('am.language', ['es', 'en'], 'es'),
  );
  const [theme, setTheme] = useState<ThemeMode>(() =>
    readPreference('am.theme', ['light', 'dark'], 'light'),
  );

  useEffect(() => {
    window.localStorage.setItem('am.language', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem('am.theme', theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const value = useMemo<PreferencesValue>(
    () => ({
      language,
      theme,
      setLanguage,
      setTheme,
      t: (key) => messages[language][key],
    }),
    [language, theme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('PreferencesProvider is required');
  return value;
}
