import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export type Profile = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  helpMessage: string;
};
const initial: Profile = {
  name: "Usuaria",
  lastName: "AlertaMujer",
  email: "usuaria@alertamujer.local",
  phone: "300 000 0000",
  helpMessage:
    "Necesito ayuda. Comparto mi ubicación para que puedan asistir me.",
};
const C = createContext<{
  profile: Profile;
  ready: boolean;
  save: (v: Profile) => void;
} | null>(null);
const key = "am.profile";
export function useProfile() {
  const v = useContext(C);
  if (!v) throw new Error("Profile provider missing");
  return v;
}
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((x) => {
        if (x) setProfile(JSON.parse(x));
      })
      .finally(() => setReady(true));
  }, []);
  const save = (v: Profile) => {
    setProfile(v);
    void AsyncStorage.setItem(key, JSON.stringify(v));
  };
  return <C.Provider value={{ profile, ready, save }}>{children}</C.Provider>;
}
