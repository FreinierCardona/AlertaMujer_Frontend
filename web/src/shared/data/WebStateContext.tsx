// Coordina la sesión administrativa real y las preferencias de filtros del panel.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ApiError, webApiClient } from '../api/client';
import { authApi, type RemoteSession } from '../api/authApi';
import type { FiltersState, Session } from '../types/models';

type LoginResult = 'success' | 'invalid' | 'unauthorized' | 'error';

interface WebStateValue {
  hydrated: boolean;
  session: Session | null;
  loggingOut: boolean;
  sessionExpired: boolean;
  filters: FiltersState;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<'confirmed' | 'unconfirmed'>;
  expireSession: () => void;
  refreshSession: () => Promise<boolean>;
  setFilters: (changes: Partial<FiltersState>) => void;
}

const initialFilters: FiltersState = {
  alertStatus: 'all', alertDate: '', alertPage: 1, userSearch: '', userStatus: 'all', userPage: 1,
  auditAction: 'all', auditResult: 'all', auditDate: '', auditPage: 1,
};
const WebStateContext = createContext<WebStateValue | null>(null);

function readStored<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch { return fallback; }
}

export function WebStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [filters, setFiltersState] = useState<FiltersState>(() => readStored('am.filters', initialFilters));
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const activityTimer = useRef<number | null>(null);
  const lastServerActivity = useRef(0);
  const refreshInFlight = useRef<Promise<boolean> | null>(null);

  const clearSession = useCallback(() => {
    webApiClient.setAccessToken(null);
    setSession(null);
    window.sessionStorage.removeItem('am.refresh-token');
  }, []);

  const applySession = useCallback((remote: RemoteSession) => {
    if (remote.user.role !== 'ENTITY_ADMIN') {
      throw new ApiError('Esta cuenta no puede acceder al panel administrativo.', 'FORBIDDEN', 403);
    }
    webApiClient.setAccessToken(remote.accessToken);
    window.sessionStorage.setItem('am.refresh-token', remote.refreshToken);
    lastServerActivity.current = Date.now();
    setSessionExpired(false);
    setSession({
      userId: remote.user.userId,
      name: `${remote.user.firstNames} ${remote.user.lastNames}`.trim() || remote.user.username,
      role: 'administrator',
      email: remote.user.email,
    });
  }, []);

  const expireSession = useCallback(() => {
    clearSession();
    setSessionExpired(true);
  }, [clearSession]);

  const renewSession = useCallback(async () => {
    if (refreshInFlight.current) return refreshInFlight.current;
    const refreshToken = window.sessionStorage.getItem('am.refresh-token');
    if (!refreshToken) return false;
    const renewal = (async () => {
      try {
        applySession(await authApi.refresh(refreshToken));
        return true;
      } catch {
        expireSession();
        return false;
      }
    })();
    refreshInFlight.current = renewal;
    try { return await renewal; }
    finally { refreshInFlight.current = null; }
  }, [applySession, expireSession]);

  useEffect(() => {
    // Retira los datos del antiguo panel simulado. Tema, idioma y filtros
    // siguen siendo preferencias locales y no acreditan la sesión.
    ['am.alerts', 'am.users', 'am.audit'].forEach((key) => window.localStorage.removeItem(key));
    webApiClient.configureSession(renewSession, expireSession);
    const timer = window.setTimeout(() => { void renewSession().finally(() => setHydrated(true)); }, 0);
    return () => window.clearTimeout(timer);
  }, [expireSession, renewSession]);

  useEffect(() => {
    if (!session) return undefined;
    const scheduleExpiry = () => {
      if (activityTimer.current !== null) window.clearTimeout(activityTimer.current);
      activityTimer.current = window.setTimeout(expireSession, 10 * 60 * 1000);
    };
    const recordActivity = () => {
      scheduleExpiry();
      // Renueva por interacción como máximo cada cuatro minutos para mantener la sesión de diez minutos.
      // El cliente coordina las respuestas 401 concurrentes para evitar renovaciones duplicadas.
      if (Date.now() - lastServerActivity.current >= 4 * 60 * 1000) void renewSession();
    };
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    scheduleExpiry();
    return () => {
      if (activityTimer.current !== null) window.clearTimeout(activityTimer.current);
      events.forEach((event) => window.removeEventListener(event, recordActivity));
    };
  }, [expireSession, renewSession, session]);

  const login = async (identifier: string, password: string): Promise<LoginResult> => {
    try {
      applySession(await authApi.login(identifier.trim(), password));
      return 'success';
    } catch (cause) {
      clearSession();
      if (cause instanceof ApiError && cause.status === 401) return 'invalid';
      if (cause instanceof ApiError && cause.status === 403) return 'unauthorized';
      return 'error';
    }
  };

  // Borra la sesión local de inmediato y después informa si el servidor confirmó su revocación.
  const logout = async (): Promise<'confirmed' | 'unconfirmed'> => {
    setLoggingOut(true);
    const request = authApi.logout();
    clearSession();
    try {
      await request;
      return 'confirmed';
    } catch { return 'unconfirmed'; }
    finally { setLoggingOut(false); }
  };

  // Persiste solo las preferencias de búsqueda y paginación del panel.
  const setFilters = (changes: Partial<FiltersState>) => setFiltersState((current) => {
    const next = { ...current, ...changes };
    window.localStorage.setItem('am.filters', JSON.stringify(next));
    return next;
  });

  return <WebStateContext.Provider value={{ hydrated, session, loggingOut, sessionExpired, filters, login, logout, expireSession, refreshSession: renewSession, setFilters }}>{children}</WebStateContext.Provider>;
}

export function useWebState() {
  const value = useContext(WebStateContext);
  if (!value) throw new Error('WebStateProvider is required');
  return value;
}
