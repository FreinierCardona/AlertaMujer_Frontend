// Mantiene el modo claro u oscuro de forma explícita y persistente en el dispositivo.
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { darkColors, lightColors } from "./Colors";
import Spacing from "./Spacing";
import Typography from "./Typography";
import type { AppColors, ResolvedThemeMode, ThemeMode } from "./Colors";

const THEME_KEY = "@alertamujer/theme";
interface AppTheme {
  colors: AppColors;
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  ready: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  spacing: typeof Spacing;
  typography: typeof Typography;
}
export const ThemeContext = createContext<AppTheme | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark") setModeState(saved);
      })
      .finally(() => setReady(true));
  }, []);
  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  }, []);
  const value = useMemo<AppTheme>(
    () => ({
      colors: mode === "dark" ? darkColors : lightColors,
      mode,
      resolvedMode: mode,
      ready,
      setMode,
      spacing: Spacing,
      typography: Typography,
    }),
    [mode, ready, setMode],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
