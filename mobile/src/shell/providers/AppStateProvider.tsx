// Conserva preferencias y prototipos heredados; contactos, sesión y perfil provienen del Backend.
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, apiClient, contactsApi, identityApi } from '@core/api';
import type { ContactAction, ContactRelationship, UserProfile } from '@core/api';
import { tokenStorage } from '@core/api/tokenStorage';
import { startBackgroundLocation, stopBackgroundLocation } from '@modules/location/infrastructure/backgroundLocation';
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
import { registerDeviceToken as registerNativeDeviceToken } from '@modules/location/infrastructure/registerDeviceToken';
import { useI18n } from '@shared/i18n';

const DATA_KEY = '@alertamujer/local-prototype';
const CONTACTS_PAGE_SIZE = 50;

export const DEFAULT_HELP_MESSAGE =
  'Necesito ayuda. He activado una alerta de emergencia. Mi ubicación se está compartiendo.';

export interface UserProfileView {
  username: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
}
export interface EmergencyContactSnapshot {
  id: string;
  name: string;
  relationship: string;
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
  contacts: EmergencyContactSnapshot[];
  evidence: EvidenceItem[];
  chat: ChatMessage[];
}
interface StoredState {
  activeEmergency: Emergency | null;
  history: Emergency[];
}
const initialState: StoredState = { activeEmergency: null, history: [] };
const emptyProfile: UserProfileView = {
  username: '',
  name: '',
  lastName: '',
  email: '',
  phone: '',
};
const toViewProfile = (user: UserProfile): UserProfileView => ({
  username: user.username,
  name: user.firstNames,
  lastName: user.lastNames,
  email: user.email,
  phone: user.phone,
});

interface AppStateValue extends StoredState {
  hydrated: boolean;
  isAuthenticated: boolean;
  termsPending: boolean;
  profile: UserProfileView;
  helpMessage: string;
  sessionNotice: string | null;
  requirements: DeviceRequirements;
  backgroundMessage: string | null;
  contacts: ContactRelationship[];
  contactsLoading: boolean;
  contactsConfirmed: boolean;
  contactsError: string | null;
  deviceTokenConflict: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  acceptTerms: () => Promise<void>;
  updateProfile: (
    profile: Pick<UserProfileView, 'username' | 'name' | 'lastName'>,
  ) => Promise<void>;
  requestContactChange: (
    field: 'email' | 'phone',
    value: string,
  ) => Promise<{ expiresAt: string; simulatedSmsCode?: string | null }>;
  verifyContactChange: (
    field: 'email' | 'phone',
    value: string,
    code: string,
  ) => Promise<void>;
  setHelpMessage: (message: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  performContactAction: (
    contactId: string,
    action: ContactAction,
  ) => Promise<void>;
  registerDeviceToken: () => Promise<void>;
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

function messageFor(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : 'No fue posible actualizar los contactos.';
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { language } = useI18n();
  const [state, setState] = useState<StoredState>(initialState);
  const [profile, setProfile] = useState<UserProfileView>(emptyProfile);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [termsPending, setTermsPending] = useState(false);
  const [helpMessage, setHelpMessageState] = useState(DEFAULT_HELP_MESSAGE);
  const [hydrated, setHydrated] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [requirements, setRequirements] = useState(initialDeviceRequirements);
  const [backgroundMessage, setBackgroundMessage] = useState<string | null>(
    null,
  );
  const [contacts, setContacts] = useState<ContactRelationship[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsConfirmed, setContactsConfirmed] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [deviceTokenConflict, setDeviceTokenConflict] = useState(false);
  const contactsRefreshInFlight = useRef<Promise<void> | null>(null);

  const refreshContacts = useCallback(async () => {
    if (contactsRefreshInFlight.current) return contactsRefreshInFlight.current;
    const refresh = (async () => {
      setContactsLoading(true);
      setContactsError(null);
      try {
        const allContacts: ContactRelationship[] = [];
        let page = 0;
        let total = Number.POSITIVE_INFINITY;
        while (allContacts.length < total) {
          const response = await contactsApi.list(page, CONTACTS_PAGE_SIZE);
          allContacts.push(...response.items);
          total = response.total;
          if (response.items.length === 0) break;
          page += 1;
        }
        setContacts(allContacts);
        setContactsConfirmed(true);
      } catch (error) {
        setContactsConfirmed(false);
        setContactsError(messageFor(error));
        throw error;
      } finally {
        setContactsLoading(false);
      }
    })();
    contactsRefreshInFlight.current = refresh;
    try {
      await refresh;
    } finally {
      contactsRefreshInFlight.current = null;
    }
  }, []);

  const registerDeviceToken = useCallback(async () => {
    const result = await registerNativeDeviceToken();
    setDeviceTokenConflict(result === 'conflict');
  }, []);

  const clearSession = useCallback(async (notice: string | null = null) => {
    apiClient.setAccessToken(null);
    setAccessToken(null);
    setProfile(emptyProfile);
    setTermsPending(false);
    setHelpMessageState(DEFAULT_HELP_MESSAGE);
    setContacts([]);
    setContactsConfirmed(false);
    setContactsError(null);
    setDeviceTokenConflict(false);
    setSessionNotice(notice);
    await tokenStorage.clear();
  }, []);

  const applySession = useCallback(
    async (session: {
      accessToken: string;
      refreshToken: string;
      user: UserProfile;
      termsPending: boolean;
    }) => {
      if (session.user.role !== 'USER') {
        throw new ApiError(
          'Esta cuenta no puede acceder desde la aplicación móvil.',
          'FORBIDDEN',
        );
      }
      apiClient.setAccessToken(session.accessToken);
      setAccessToken(session.accessToken);
      await tokenStorage.setRefreshToken(session.refreshToken);
      setTermsPending(session.termsPending);
      setProfile(toViewProfile(session.user));
      const [freshProfile, settings] = await Promise.all([
        identityApi.getProfile(),
        identityApi.getEmergencySettings(),
      ]);
      setProfile(toViewProfile(freshProfile));
      setHelpMessageState(settings.message);
      void refreshContacts().catch(() => undefined);
      void registerDeviceToken();
    },
    [refreshContacts, registerDeviceToken],
  );

  const renewSession = useCallback(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return false;
    try {
      await applySession(await identityApi.refresh(refreshToken));
      return true;
    } catch {
      await clearSession('Tu sesión expiró. Inicia sesión nuevamente.');
      return false;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    apiClient.configureSession({
      refreshSession: renewSession,
      invalidateSession: () => {
        void clearSession('Tu sesión expiró. Inicia sesión nuevamente.');
      },
    });
  }, [clearSession, renewSession]);
  useEffect(() => {
    void (async () => {
      try {
        await renewSession();
      } finally {
        setHydrated(true);
      }
    })();
  }, [renewSession]);
  useEffect(() => {
    AsyncStorage.getItem(DATA_KEY)
      .then((saved) => {
        if (!saved) return;
        const parsed = JSON.parse(saved) as Partial<StoredState>;
        setState({
          activeEmergency: parsed.activeEmergency ?? null,
          history: Array.isArray(parsed.history) ? parsed.history : [],
        });
      })
      .catch(() => setState(initialState));
  }, []);
  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(DATA_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const signIn = useCallback(
    async (identifier: string, password: string) => {
      setSessionNotice(null);
      try {
        await applySession(await identityApi.login(identifier, password));
      } catch (error) {
        await clearSession(null);
        throw error;
      }
    },
    [applySession, clearSession],
  );
  const signOut = useCallback(async () => {
    try {
      if (accessToken) await identityApi.logout();
    } finally {
      await clearSession();
    }
  }, [accessToken, clearSession]);
  const acceptTerms = useCallback(async () => {
    await identityApi.acceptTerms();
    setTermsPending(false);
  }, []);
  const updateProfile = useCallback(
    async (next: Pick<UserProfileView, 'username' | 'name' | 'lastName'>) => {
      const updated = await identityApi.updateProfile({
        username: next.username,
        firstNames: next.name,
        lastNames: next.lastName,
      });
      setProfile(toViewProfile(updated));
    },
    [],
  );
  const requestContactChange = useCallback(
    (field: 'email' | 'phone', value: string) =>
      identityApi.requestContactChange(field, value),
    [],
  );
  const verifyContactChange = useCallback(
    async (field: 'email' | 'phone', value: string, code: string) => {
      await identityApi.verifyContactChange(field, value, code);
      if (field === 'email') {
        await clearSession('Tu correo cambió. Inicia sesión nuevamente.');
        return;
      }
      setProfile(toViewProfile(await identityApi.getProfile()));
    },
    [clearSession],
  );
  const setHelpMessage = useCallback(async (message: string) => {
    const saved = await identityApi.saveEmergencySettings(message);
    setHelpMessageState(saved.message);
  }, []);
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await identityApi.changePassword(currentPassword, newPassword);
      await clearSession('Tu contraseña cambió. Inicia sesión nuevamente.');
    },
    [clearSession],
  );
  const deleteAccount = useCallback(async () => {
    await identityApi.deleteAccount();
    await clearSession('La cuenta fue eliminada.');
  }, [clearSession]);

  const performContactAction = useCallback(
    async (contactId: string, action: ContactAction) => {
      try {
        if (action === 'ACCEPT') await contactsApi.accept(contactId);
        if (action === 'REJECT') await contactsApi.reject(contactId);
        if (action === 'REINVITE') await contactsApi.reinvite(contactId);
      } finally {
        await refreshContacts().catch(() => undefined);
      }
    },
    [refreshContacts],
  );

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
        if (key === 'notifications') void registerDeviceToken();
      } catch {
        await refreshRequirements();
      }
    },
    [refreshRequirements, registerDeviceToken],
  );
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((network) => {
      const connection = Boolean(
        network.isConnected && network.isInternetReachable !== false,
      );
      setRequirements((current) => ({ ...current, connection, checking: false }));
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (!state.activeEmergency) {
      void stopBackgroundLocation().catch(() => undefined);
      return;
    }
    const title =
      language === 'es' ? 'Alerta Mujer activa' : 'Alerta Mujer active';
    void startBackgroundLocation(title, title)
      .then(() => setBackgroundMessage('ok'))
      .catch(() => setBackgroundMessage('error'));
  }, [language, state.activeEmergency]);

  const hasEligibleContact =
    contactsConfirmed &&
    contacts.some(
      (contact) => contact.status === 'ACCEPTED' && contact.eligible,
    );
  const createEmergency = useCallback(async () => {
    if (
      !hasEligibleContact ||
      !requirements.foreground ||
      !requirements.background ||
      !requirements.notifications ||
      !requirements.gps ||
      !requirements.connection
    ) {
      return { ok: false, reason: 'requirements' };
    }
    try {
      const location = await getCurrentCoordinates();
      const emergency: Emergency = {
        id: `L-${Date.now().toString().slice(-8)}`,
        status: 'active',
        previousOnlineStatus: 'active',
        startedAt: new Date().toISOString(),
        location,
        message: helpMessage || DEFAULT_HELP_MESSAGE,
        contacts: contacts
          .filter(
            (contact) => contact.status === 'ACCEPTED' && contact.eligible,
          )
          .map((contact) => ({
            id: contact.contactId,
            name: `${contact.counterpart.firstNames} ${contact.counterpart.lastNames}`.trim(),
            relationship: contact.counterpart.username,
          })),
        evidence: [],
        chat: [],
      };
      setState((current) => ({ ...current, activeEmergency: emergency }));
      return { ok: true };
    } catch {
      return { ok: false, reason: 'location' };
    }
  }, [contacts, hasEligibleContact, helpMessage, requirements]);
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
      const evidence: EvidenceItem = {
        id: `E-${Date.now()}`,
        uri,
        createdAt: new Date().toISOString(),
        localOnly: true,
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
      if (!requirements.connection || !state.activeEmergency || !text.trim()) {
        return false;
      }
      const message: ChatMessage = {
        id: `M-${Date.now()}`,
        author: 'user',
        text: text.trim(),
        createdAt: new Date().toISOString(),
        localOnly: true,
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
      isAuthenticated: Boolean(accessToken),
      termsPending,
      profile,
      helpMessage,
      sessionNotice,
      requirements,
      backgroundMessage,
      contacts,
      contactsLoading,
      contactsConfirmed,
      contactsError,
      deviceTokenConflict,
      signIn,
      signOut,
      acceptTerms,
      updateProfile,
      requestContactChange,
      verifyContactChange,
      setHelpMessage,
      changePassword,
      deleteAccount,
      refreshContacts,
      performContactAction,
      registerDeviceToken,
      refreshRequirements,
      resolveRequirement,
      createEmergency,
      setEmergencyStatus,
      finishEmergency,
      addEvidence,
      sendMessage,
    }),
    [
      accessToken,
      acceptTerms,
      addEvidence,
      backgroundMessage,
      changePassword,
      contacts,
      contactsConfirmed,
      contactsError,
      contactsLoading,
      createEmergency,
      deleteAccount,
      deviceTokenConflict,
      finishEmergency,
      helpMessage,
      hydrated,
      performContactAction,
      profile,
      refreshContacts,
      refreshRequirements,
      registerDeviceToken,
      requestContactChange,
      requirements,
      resolveRequirement,
      sendMessage,
      sessionNotice,
      setEmergencyStatus,
      setHelpMessage,
      signIn,
      signOut,
      state,
      termsPending,
      updateProfile,
      verifyContactChange,
    ],
  );
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
