// Conserva preferencias y prototipos heredados; contactos, sesión y perfil provienen del Backend.
import NetInfo from '@react-native-community/netinfo';
import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ApiError,
  apiClient,
  contactsApi,
  emergencyApi,
  identityApi,
} from '@core/api';
import type {
  ContactAction,
  ContactRelationship,
  EmergencyDetailResponse,
  EmergencyResponse,
  UserProfile,
} from '@core/api';
import { tokenStorage } from '@core/api/tokenStorage';
import { canUseBackgroundLocation, canUseRemotePush } from '@core/config/appConfig';
import {
  setLocationSyncListener,
  startBackgroundLocation,
  stopBackgroundLocation,
} from '@modules/location/infrastructure/backgroundLocation';
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

const CONTACTS_PAGE_SIZE = 50;
const HISTORY_PAGE_SIZE = 20;

export const DEFAULT_HELP_MESSAGE =
  'Necesito ayuda. He activado una alerta de emergencia. Mi ubicación se está compartiendo.';

export interface UserProfileView {
  username: string;
  name: string;
  lastName: string;
  email: string;
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
  previousOnlineStatus: 'active' | 'inProgress' | null;
  startedAt: string;
  endedAt?: string;
  lastHeartbeatAt: string | null;
  lastConfirmedLocation?: Coordinates;
  messageSnapshot?: string;
  syncState: 'synced' | 'pending';
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

function toEmergency(
  response: EmergencyResponse | EmergencyDetailResponse,
  lastConfirmedLocation?: Coordinates,
): Emergency {
  const status: Record<EmergencyResponse['status'], EmergencyStatus> = {
    ACTIVE: 'active',
    IN_PROGRESS: 'inProgress',
    OFFLINE: 'offline',
    FINALIZED: 'finalized',
  };
  return {
    id: response.emergencyId,
    status: status[response.status],
    previousOnlineStatus:
      response.previousOperationalStatus === 'IN_PROGRESS'
        ? 'inProgress'
        : response.previousOperationalStatus === 'ACTIVE'
          ? 'active'
          : null,
    startedAt: response.startedAt,
    endedAt: response.finalizedAt ?? undefined,
    lastHeartbeatAt: response.lastHeartbeatAt,
    lastConfirmedLocation:
      lastConfirmedLocation ??
      ('lastConfirmedLocation' in response && response.lastConfirmedLocation
        ? {
            latitude: response.lastConfirmedLocation.latitude,
            longitude: response.lastConfirmedLocation.longitude,
            accuracy: response.lastConfirmedLocation.accuracyMeters,
            capturedAt: response.lastConfirmedLocation.capturedAt,
          }
        : undefined),
    messageSnapshot:
      'messageSnapshot' in response ? response.messageSnapshot : undefined,
    syncState: 'synced',
    evidence: [],
    chat: [],
  };
}

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
  historyLoading: boolean;
  historyError: string | null;
  historyHasMore: boolean;
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
  createEmergency: () => Promise<{
    ok: boolean;
    reason?: 'requirements' | 'location' | 'server';
    message?: string;
  }>;
  finishEmergency: () => Promise<{ ok: boolean; message?: string }>;
  refreshHistory: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;
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
  const activeEmergencyId = state.activeEmergency?.id;
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
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(-1);
  const [historyHasMore, setHistoryHasMore] = useState(true);
  const contactsRefreshInFlight = useRef<Promise<void> | null>(null);
  const needsEmergencyReconciliation = useRef(false);
  const emergencyCreateInFlight = useRef<Promise<{
    ok: boolean;
    reason?: 'requirements' | 'location' | 'server';
    message?: string;
  }> | null>(null);

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

  const fetchHistoryPage = useCallback(async (page: number, append: boolean) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await emergencyApi.history(page, HISTORY_PAGE_SIZE);
      const items = response.items.map((item) => toEmergency(item));
      setState((current) => ({
        ...current,
        history: append ? [...current.history, ...items] : items,
      }));
      setHistoryPage(response.page);
      setHistoryHasMore((response.page + 1) * response.size < response.total);
    } catch (error) {
      setHistoryError(messageFor(error));
      throw error;
    } finally {
      setHistoryLoading(false);
    }
  }, []);
  const refreshHistory = useCallback(() => fetchHistoryPage(0, false), [fetchHistoryPage]);
  const loadMoreHistory = useCallback(async () => {
    if (historyLoading || !historyHasMore) return;
    await fetchHistoryPage(historyPage + 1, true);
  }, [fetchHistoryPage, historyHasMore, historyLoading, historyPage]);

  const restoreActiveEmergency = useCallback(async () => {
    try {
      const response = await emergencyApi.active();
      const detail = await emergencyApi.get(response.emergencyId);
      setState((current) => ({ ...current, activeEmergency: toEmergency(detail) }));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setState((current) => ({ ...current, activeEmergency: null }));
        return;
      }
      setSessionNotice(
        error instanceof ApiError
          ? error.message
          : 'No pudimos comprobar si tienes una alerta activa.',
      );
      throw error;
    }
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
    setState(initialState);
    setHistoryPage(-1);
    setHistoryHasMore(true);
    setHistoryError(null);
    setSessionNotice(notice);
    await stopBackgroundLocation().catch(() => undefined);
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
      try {
        await restoreActiveEmergency();
      } catch {
        // La sesiÃ³n es vÃ¡lida; el aviso se expone sin sustituirla por una sesiÃ³n local.
      }
      void refreshContacts().catch(() => undefined);
      void registerDeviceToken();
    },
    [refreshContacts, registerDeviceToken, restoreActiveEmergency],
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
      if (!connection) {
        needsEmergencyReconciliation.current = true;
        setState((current) =>
          current.activeEmergency
            ? {
                ...current,
                activeEmergency: {
                  ...current.activeEmergency,
                  syncState: 'pending',
                },
              }
            : current,
        );
      }
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    setLocationSyncListener((result) => {
      let emergencyId: string | null = null;
      setState((current) => {
        if (!current.activeEmergency) return current;
        if (!result.confirmed) {
          return {
            ...current,
            activeEmergency: { ...current.activeEmergency, syncState: 'pending' },
          };
        }
        return {
          ...current,
          activeEmergency: {
            ...current.activeEmergency,
            lastConfirmedLocation: result.location,
            lastHeartbeatAt: new Date().toISOString(),
            syncState: 'synced',
          },
        };
      });
      if (result.confirmed && needsEmergencyReconciliation.current) {
        setState((current) => {
          emergencyId = current.activeEmergency?.id ?? null;
          return current;
        });
        if (emergencyId) {
          void emergencyApi
            .get(emergencyId)
            .then((response) => {
              needsEmergencyReconciliation.current = false;
              setState((current) => ({
                ...current,
                activeEmergency:
                  current.activeEmergency?.id === response.emergencyId
                    ? toEmergency(response, current.activeEmergency.lastConfirmedLocation)
                    : current.activeEmergency,
              }));
            })
            .catch(() => undefined);
        }
      }
    });
    return () => setLocationSyncListener(null);
  }, []);
  useEffect(() => {
    if (!activeEmergencyId) {
      void stopBackgroundLocation().catch(() => undefined);
      return;
    }
    if (!canUseBackgroundLocation) return;
    const title =
      language === 'es' ? 'Alerta Mujer activa' : 'Alerta Mujer active';
    void startBackgroundLocation(activeEmergencyId, title, title)
      .then(() => setBackgroundMessage('ok'))
      .catch(() => setBackgroundMessage('error'));
  }, [activeEmergencyId, language]);
  useEffect(() => {
    if (!activeEmergencyId || canUseBackgroundLocation) return;
    const heartbeat = async () => {
      if (!requirements.connection) {
        setState((current) =>
          current.activeEmergency?.id === activeEmergencyId
            ? {
                ...current,
                activeEmergency: { ...current.activeEmergency, syncState: 'pending' },
              }
            : current,
        );
        return;
      }
      try {
        const location = await getCurrentCoordinates();
        await emergencyApi.heartbeat(activeEmergencyId, {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracyMeters: location.accuracy,
          capturedAt: location.capturedAt,
        });
        setState((current) =>
          current.activeEmergency?.id === activeEmergencyId
            ? {
                ...current,
                activeEmergency: {
                  ...current.activeEmergency,
                  lastConfirmedLocation: location,
                  lastHeartbeatAt: new Date().toISOString(),
                  syncState: 'synced',
                },
              }
            : current,
        );
      } catch {
        setState((current) =>
          current.activeEmergency?.id === activeEmergencyId
            ? {
                ...current,
                activeEmergency: { ...current.activeEmergency, syncState: 'pending' },
              }
            : current,
        );
      }
    };
    const interval = setInterval(() => void heartbeat(), 60_000);
    return () => clearInterval(interval);
  }, [activeEmergencyId, requirements.connection]);

  const hasEligibleContact =
    contactsConfirmed &&
    contacts.some(
      (contact) => contact.status === 'ACCEPTED' && contact.eligible,
    );
  const createEmergency = useCallback(async () => {
    if (emergencyCreateInFlight.current) return emergencyCreateInFlight.current;
    const request = (async () => {
      if (
        !hasEligibleContact ||
        !requirements.foreground ||
        (canUseBackgroundLocation && !requirements.background) ||
        (canUseRemotePush && !requirements.notifications) ||
        !requirements.gps ||
        !requirements.connection
      ) {
        return { ok: false as const, reason: 'requirements' as const };
      }
      let location: Coordinates;
      try {
        location = await getCurrentCoordinates();
      } catch {
        return { ok: false as const, reason: 'location' as const };
      }
      if (
        !Number.isFinite(location.latitude) ||
        !Number.isFinite(location.longitude) ||
        location.latitude < -90 ||
        location.latitude > 90 ||
        location.longitude < -180 ||
        location.longitude > 180 ||
        (location.accuracy !== null && location.accuracy < 0)
      ) {
        return { ok: false as const, reason: 'location' as const };
      }
      try {
        const response = await emergencyApi.createOrRecover({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracyMeters: location.accuracy,
          capturedAt: location.capturedAt,
          message: helpMessage.trim() || undefined,
        });
        let resolved: EmergencyResponse | EmergencyDetailResponse = response;
        try {
          resolved = await emergencyApi.get(response.emergencyId);
        } catch {
          // A successful creation remains authoritative even if this optional detail read fails.
        }
        setState((current) => ({
          ...current,
          activeEmergency: toEmergency(resolved, location),
        }));
        return { ok: true as const };
      } catch (error) {
        if (error instanceof ApiError && (error.status === 409 || error.status === 422)) {
          void refreshContacts().catch(() => undefined);
          void restoreActiveEmergency().catch(() => undefined);
        }
        return {
          ok: false as const,
          reason: 'server' as const,
          message: error instanceof ApiError ? error.message : undefined,
        };
      }
    })();
    emergencyCreateInFlight.current = request;
    try {
      return await request;
    } finally {
      emergencyCreateInFlight.current = null;
    }
  }, [hasEligibleContact, helpMessage, refreshContacts, requirements, restoreActiveEmergency]);
  const finishEmergency = useCallback(async () => {
    const emergency = state.activeEmergency;
    if (!emergency) return { ok: false, message: 'No hay una alerta abierta.' };
    try {
      await emergencyApi.finish(emergency.id);
      await stopBackgroundLocation().catch(() => undefined);
      setState((current) => ({ ...current, activeEmergency: null }));
      void refreshHistory().catch(() => undefined);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof ApiError
            ? error.message
            : 'No pudimos confirmar la finalizaciÃ³n. La alerta sigue abierta.',
      };
    }
  }, [refreshHistory, state.activeEmergency]);
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
      historyLoading,
      historyError,
      historyHasMore,
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
      finishEmergency,
      refreshHistory,
      loadMoreHistory,
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
      historyError,
      historyHasMore,
      historyLoading,
      hydrated,
      performContactAction,
      profile,
      refreshContacts,
      refreshHistory,
      refreshRequirements,
      registerDeviceToken,
      requestContactChange,
      requirements,
      resolveRequirement,
      loadMoreHistory,
      sendMessage,
      sessionNotice,
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
