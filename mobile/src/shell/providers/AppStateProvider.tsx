import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const SESSION_KEY = "@alertamujer/session-email";

interface AppStateValue {
  hydrated: boolean;
  sessionEmail: string | null;
  activeEmergency: null;
  signIn: (email: string) => void;
  signOut: () => void;
}

export const AppStateContext = createContext<AppStateValue | undefined>(
  undefined,
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((saved) => setSessionEmail(saved))
      .catch(() => setSessionEmail(null))
      .finally(() => setHydrated(true));
  }, []);

  const signIn = useCallback((email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    setSessionEmail(normalizedEmail);
    void AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
  }, []);

  const signOut = useCallback(() => {
    setSessionEmail(null);
    void AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      hydrated,
      sessionEmail,
      activeEmergency: null,
      signIn,
      signOut,
    }),
    [hydrated, sessionEmail, signIn, signOut],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
