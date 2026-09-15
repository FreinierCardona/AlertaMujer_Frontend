// Expone idioma reactivo, interpolación simple y persistencia local de la preferencia.
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { defaultLanguage, translations } from "./translations";
import type { AppLanguage, MessageKey } from "./translations";

const LANGUAGE_KEY = "@alertamujer/language";

interface I18nContextValue {
  language: AppLanguage;
  ready: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(
  undefined,
);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(defaultLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((saved) => {
        if (saved === "es" || saved === "en") setLanguageState(saved);
      })
      .finally(() => setReady(true));
  }, []);

  const setLanguage = useCallback(async (next: AppLanguage) => {
    setLanguageState(next);
    await AsyncStorage.setItem(LANGUAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: MessageKey, values?: Record<string, string | number>) => {
      let message: string = translations[language][key];
      Object.entries(values ?? {}).forEach(([name, value]) => {
        message = message.replaceAll(`{{${name}}}`, String(value));
      });
      return message;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, ready, setLanguage, t }),
    [language, ready, setLanguage, t],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
