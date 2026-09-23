// Coordina sesión, datos locales, requisitos del dispositivo y ciclo de la alerta del prototipo.
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentCoordinates,
  initialDeviceRequirements,
  inspectDeviceRequirements,
  requestDeviceRequirement,
} from '@modules/location/infrastructure/deviceRequirements';
import type {
  DeviceRequirementKey,
  DeviceRequirements,
} from '@modules/location/infrastructure/deviceRequirements';
import {
  startBackgroundLocation,
  stopBackgroundLocation,
} from '@modules/location/infrastructure/backgroundLocation';
import { useI18n } from '@shared/i18n';

const DATA_KEY = '@alertamujer/local-prototype';
export const DEFAULT_HELP_MESSAGE =
  'Necesito ayuda. He activado una alerta de emergencia. Mi ubicación se está compartiendo.';

export interface UserProfile {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}
export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}
export interface DirectoryUser {
  id: string;
  name: string;
  phone: string;
}
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
}
export interface EvidenceItem {
  id: string;
  uri: string;
  createdAt: string;
  localOnly: true;
}
export interface ChatMessage {
  id: string;
  author: 'user' | 'admin';
  text: string;
  createdAt: string;
  localOnly: true;
}
export type EmergencyStatus = 'active' | 'inProgress' | 'offline' | 'finalized';
export interface Emergency {
  id: string;
  status: EmergencyStatus;
  previousOnlineStatus: 'active' | 'inProgress';
  startedAt: string;
  endedAt?: string;
  location: Coordinates;
  message: string;
  contacts: Contact[];
  evidence: EvidenceItem[];
  chat: ChatMessage[];
}
interface StoredState {
  sessionEmail: string | null;
  profile: UserProfile;
  helpMessage: string;
  contacts: Contact[];
  activeEmergency: Emergency | null;
  history: Emergency[];
}
const initialState: StoredState = {
  sessionEmail: null,
  profile: {
    name: '',
    lastName: '',
    email: '',
    phone: '',
  },
  helpMessage: DEFAULT_HELP_MESSAGE,
  contacts: [],
  activeEmergency: null,
  history: [],
};
export const localDirectory: DirectoryUser[] = [
  { id: 'directory-ana', name: 'Ana Torres', phone: '3001234567' },
  { id: 'directory-laura', name: 'Laura Medina', phone: '3156789065' },
];

interface AppStateValue extends StoredState {
  hydrated: boolean;
  requirements: DeviceRequirements;
  backgroundMessage: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
  updateProfile: (profile: UserProfile) => void;
  setHelpMessage: (message: string) => void;
  addContact: (
    user: DirectoryUser,
    relationship: string,
  ) => 'saved' | 'duplicate' | 'self';
  updateContact: (id: string, relationship: string) => void;
  removeContact: (id: string) => void;
  refreshRequirements: () => Promise<void>;
  resolveRequirement: (key: DeviceRequirementKey) => Promise<void>;
  createEmergency: () => Promise<{ ok: boolean; reason?: string }>;
  setEmergencyStatus: (status: 'active' | 'inProgress') => void;
  finishEmergency: () => boolean;
  addEvidence: (uri: string) => boolean;
  sendMessage: (text: string) => boolean;
}
export const AppStateContext = createContext<AppStateValue | undefined>(
  undefined,
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { language } = useI18n();
  const [state, setState] = useState<StoredState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [requirements, setRequirements] = useState(initialDeviceRequirements);
  const [backgroundMessage, setBackgroundMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    AsyncStorage.getItem(DATA_KEY)
      .then((saved) => {
        if (saved)
          setState({ ...initialState, ...(JSON.parse(saved) as StoredState) });
      })
      .catch(() => setState(initialState))
      .finally(() => setHydrated(true));
  }, []);
  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(DATA_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const refreshRequirements = useCallback(async () => {
    setRequirements((current) => ({ ...current, checking: true }));
    try {
      setRequirements(await inspectDeviceRequirements());
    } catch {
      setRequirements((current) => ({ ...current, checking: false }));
    }
  }, []);
  const resolveRequirement = useCallback(
    async (key: DeviceRequirementKey) => {
      try {
        setRequirements(await requestDeviceRequirement(key));
      } catch {
        await refreshRequirements();
      }
    },
    [refreshRequirements],
  );
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((network) => {
      const connection = Boolean(
        network.isConnected && network.isInternetReachable !== false,
      );
      setRequirements((current) => ({
        ...current,
        connection,
        checking: false,
      }));
      setState((current) =>
        current.activeEmergency
          ? {
              ...current,
              activeEmergency: connection
                ? {
                    ...current.activeEmergency,
                    status:
                      current.activeEmergency.status === 'offline'
                        ? current.activeEmergency.previousOnlineStatus
                        : current.activeEmergency.status,
                  }
                : {
                    ...current.activeEmergency,
                    previousOnlineStatus:
                      current.activeEmergency.status === 'inProgress'
                        ? 'inProgress'
                        : current.activeEmergency.previousOnlineStatus,
                    status: 'offline',
                  },
            }
          : current,
      );
    });
    return unsubscribe;
  }, [refreshRequirements]);

  useEffect(() => {
    if (!state.activeEmergency) {
      void stopBackgroundLocation().catch(() => undefined);
      return;
    }
    const title =
      language === 'es' ? 'Alerta Mujer activa' : 'Alerta Mujer active';
    const body =
      state.activeEmergency.status === 'offline'
        ? language === 'es'
          ? 'Obteniendo ubicación. Envío pendiente por conexión'
          : 'Obtaining location. Sending pending due to connection'
        : language === 'es'
          ? 'Obteniendo y enviando ubicación'
          : 'Obtaining and sending location';
    void startBackgroundLocation(title, body)
      .then(() => setBackgroundMessage('ok'))
      .catch(() => setBackgroundMessage('error'));
  }, [language, state.activeEmergency]);

  const signIn = useCallback(
    (email: string) =>
      setState((current) => ({
        ...current,
        sessionEmail: email.trim().toLowerCase(),
        profile: { ...current.profile, email: email.trim().toLowerCase() },
      })),
    [],
  );
  const signOut = useCallback(
    () => setState((current) => ({ ...current, sessionEmail: null })),
    [],
  );
  const updateProfile = useCallback(
    (profile: UserProfile) => setState((current) => ({ ...current, profile })),
    [],
  );
  const setHelpMessage = useCallback(
    (helpMessage: string) =>
      setState((current) => ({ ...current, helpMessage })),
    [],
  );
  const addContact = useCallback(
    (user: DirectoryUser, relationship: string) => {
      if (state.profile.phone && user.phone === state.profile.phone)
        return 'self';
      if (state.contacts.some((item) => item.id === user.id))
        return 'duplicate';
      setState((current) => ({
        ...current,
        contacts: [
          ...current.contacts,
          { ...user, relationship: relationship.trim() },
        ],
      }));
      return 'saved';
    },
    [state.contacts, state.profile.phone],
  );
  const updateContact = useCallback(
    (id: string, relationship: string) =>
      setState((current) => ({
        ...current,
        contacts: current.contacts.map((item) =>
          item.id === id ? { ...item, relationship } : item,
        ),
      })),
    [],
  );
  const removeContact = useCallback(
    (id: string) =>
      setState((current) => ({
        ...current,
        contacts: current.contacts.filter((item) => item.id !== id),
      })),
    [],
  );

  const createEmergency = useCallback(async () => {
    if (
      state.contacts.length === 0 ||
      !requirements.foreground ||
      !requirements.background ||
      !requirements.notifications ||
      !requirements.gps ||
      !requirements.connection
    )
      return { ok: false, reason: 'requirements' };
    try {
      const location = await getCurrentCoordinates();
      const emergency: Emergency = {
        id: `L-${Date.now().toString().slice(-8)}`,
        status: 'active',
        previousOnlineStatus: 'active',
        startedAt: new Date().toISOString(),
        location,
        message: state.helpMessage || DEFAULT_HELP_MESSAGE,
        contacts: state.contacts.map((item) => ({ ...item })),
        evidence: [],
        chat: [],
      };
      setState((current) => ({ ...current, activeEmergency: emergency }));
      return { ok: true };
    } catch {
      return { ok: false, reason: 'location' };
    }
  }, [requirements, state.contacts, state.helpMessage]);
  const setEmergencyStatus = useCallback(
    (status: 'active' | 'inProgress') =>
      setState((current) =>
        current.activeEmergency
          ? {
              ...current,
              activeEmergency: {
                ...current.activeEmergency,
                status: requirements.connection ? status : 'offline',
                previousOnlineStatus: status,
              },
            }
          : current,
      ),
    [requirements.connection],
  );
  const finishEmergency = useCallback(() => {
    if (!requirements.connection || !state.activeEmergency) return false;
    setState((current) => {
      if (!current.activeEmergency) return current;
      const finished = {
        ...current.activeEmergency,
        status: 'finalized' as const,
        endedAt: new Date().toISOString(),
      };
      return {
        ...current,
        activeEmergency: null,
        history: [finished, ...current.history],
      };
    });
    return true;
  }, [requirements.connection, state.activeEmergency]);
  const addEvidence = useCallback(
    (uri: string) => {
      if (!requirements.connection || !state.activeEmergency) return false;
      const evidence = {
        id: `E-${Date.now()}`,
        uri,
        createdAt: new Date().toISOString(),
        localOnly: true as const,
      };
      setState((current) =>
        current.activeEmergency
          ? {
              ...current,
              activeEmergency: {
                ...current.activeEmergency,
                evidence: [...current.activeEmergency.evidence, evidence],
              },
            }
          : current,
      );
      return true;
    },
    [requirements.connection, state.activeEmergency],
  );
  const sendMessage = useCallback(
    (text: string) => {
      if (!requirements.connection || !state.activeEmergency || !text.trim())
        return false;
      const message = {
        id: `M-${Date.now()}`,
        author: 'user' as const,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        localOnly: true as const,
      };
      setState((current) =>
        current.activeEmergency
          ? {
              ...current,
              activeEmergency: {
                ...current.activeEmergency,
                chat: [...current.activeEmergency.chat, message],
              },
            }
          : current,
      );
      return true;
    },
    [requirements.connection, state.activeEmergency],
  );

  const value = useMemo<AppStateValue>(
    () => ({
      ...state,
      hydrated,
      requirements,
      backgroundMessage,
      signIn,
      signOut,
      updateProfile,
      setHelpMessage,
      addContact,
      updateContact,
      removeContact,
      refreshRequirements,
      resolveRequirement,
      createEmergency,
      setEmergencyStatus,
      finishEmergency,
      addEvidence,
      sendMessage,
    }),
    [
      state,
      hydrated,
      requirements,
      backgroundMessage,
      signIn,
      signOut,
      updateProfile,
      setHelpMessage,
      addContact,
      updateContact,
      removeContact,
      refreshRequirements,
      resolveRequirement,
      createEmergency,
      setEmergencyStatus,
      finishEmergency,
      addEvidence,
      sendMessage,
    ],
  );
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
