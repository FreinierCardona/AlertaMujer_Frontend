// Gestiona las preferencias persistentes de idioma y apariencia para el portal web.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
type Language = "es" | "en";

type PreferencesContextValue = {
  language: Language;
  theme: Theme;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/**
 * Obtiene una preferencia válida del navegador y evita propagar valores corruptos.
 */
function readPreference<T extends string>(key: string, fallback: T, options: T[]): T {
  const value = window.localStorage.getItem(key) as T | null;

  return value && options.includes(value) ? value : fallback;
}

/**
 * Mantiene las preferencias visuales del portal web sin depender de servicios remotos.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    readPreference("am.web.theme", "light", ["light", "dark"]),
  );
  const [language, setLanguage] = useState<Language>(() =>
    readPreference("am.web.language", "es", ["es", "en"]),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("am.web.theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("am.web.language", language);
  }, [language]);

  const value = useMemo(
    () => ({ language, theme, setLanguage, setTheme }),
    [language, theme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

/**
 * Expone las preferencias dentro de las pantallas públicas y administrativas.
 */
export function usePreferences() {
  const value = useContext(PreferencesContext);

  if (!value) {
    throw new Error("PreferencesProvider es obligatorio para usar preferencias.");
  }

  return value;
}
