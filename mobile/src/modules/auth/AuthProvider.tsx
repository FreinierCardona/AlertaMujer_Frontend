import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Auth = {
  ready: boolean;
  signedIn: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<Auth | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Auth provider missing");
  return value;
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("am.session")
      .then((v) => setSignedIn(v === "active"))
      .finally(() => setReady(true));
  }, []);
  return (
    <AuthContext.Provider
      value={{
        ready,
        signedIn,
        signIn: async (email, password) => {
          if (!email.includes("@") || password.length < 8)
            return "Revisa el correo y una contraseña de al menos 8 caracteres.";
          await AsyncStorage.setItem("am.session", "active");
          setSignedIn(true);
          return null;
        },
        signOut: async () => {
          await AsyncStorage.removeItem("am.session");
          setSignedIn(false);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
