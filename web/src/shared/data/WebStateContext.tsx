// Coordina la sesión administrativa y el estado visual aún usado por las HUs Web posteriores.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { initialAlerts, initialAudit, initialUsers } from './mockData';
import { ApiError, webApiClient } from '../api/client';
import { authApi, type RemoteSession } from '../api/authApi';
import type { AlertRecord, AuditEvent, FiltersState, Session, UserRecord } from '../types/models';

type LoginResult = 'success' | 'invalid' | 'unauthorized' | 'error';
type AttentionResult = 'success' | 'conflict' | 'error';
type UserMutationResult = 'success' | 'duplicate' | 'notAllowed';

interface WebStateValue {
  hydrated: boolean;
  session: Session | null;
  loggingOut: boolean;
  sessionExpired: boolean;
  alerts: AlertRecord[];
  users: UserRecord[];
  audit: AuditEvent[];
  filters: FiltersState;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<'confirmed' | 'unconfirmed'>;
  expireSession: () => void;
  refreshSession: () => Promise<boolean>;
  startAttention: (alertId: string) => Promise<AttentionResult>;
  sendMessage: (alertId: string, body: string) => Promise<'success' | 'offline' | 'closed' | 'error'>;
  retryMessage: (alertId: string, messageId: string) => Promise<'success' | 'error'>;
  createUser: (input: Pick<UserRecord, 'firstName' | 'lastName' | 'email' | 'phone'>) => Promise<UserMutationResult>;
  changeUserStatus: (userId: string) => Promise<UserMutationResult>;
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
function wait(milliseconds = 520) { return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds)); }

export function WebStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // HUs 026 and 027 replace these in-memory visual fixtures with their own API flows.
  // They intentionally never persist operational data in the browser.
  const [alerts, setAlertsState] = useState<AlertRecord[]>(initialAlerts);
  const [users, setUsersState] = useState<UserRecord[]>(initialUsers);
  const [audit, setAuditState] = useState<AuditEvent[]>(initialAudit);
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
    // Remove data written by the old simulated panel. Theme, language and visual
    // filters remain local preferences and are never used as authentication.
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
      // A real interaction keeps the server-side ten-minute session alive without
      // refreshing on every event; concurrent API 401s remain deduplicated in the client.
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

  const addAudit = (event: Omit<AuditEvent, 'id' | 'occurredAt' | 'actor'>) => {
    setAuditState((current) => [{ ...event, id: `AU-${Date.now()}`, occurredAt: new Date().toISOString(), actor: 'Freinier Cardona' }, ...current]);
  };

  const startAttention = async (alertId: string): Promise<AttentionResult> => {
    await wait(650);
    const current = alerts.find((alert) => alert.id === alertId);
    if (!current) return 'error';
    if (current.status !== 'active') return 'conflict';
    const isConflict = current.attentionConflict;
    setAlertsState(alerts.map((alert) => alert.id === alertId ? { ...alert, status: 'inProgress' as const, updatedAt: new Date().toISOString(), attentionConflict: false } : alert));
    if (isConflict) return 'conflict';
    addAudit({ action: 'startAttention', entity: `Alerta ${alertId}`, result: 'success', detail: 'Cambio confirmado de Activa a En proceso.' });
    return 'success';
  };

  const sendMessage = async (alertId: string, body: string) => {
    await wait(460);
    const current = alerts.find((alert) => alert.id === alertId);
    if (!current) return 'error' as const;
    if (current.status === 'offline') return 'offline' as const;
    if (current.status === 'finished') return 'closed' as const;
    const shouldFail = body.trim().toLowerCase().includes('[error]');
    const message = { id: `M-${Date.now()}`, author: 'admin' as const, authorName: 'Freinier Cardona', sentAt: new Date().toISOString(), body: body.trim(), delivery: shouldFail ? 'failed' as const : 'sent' as const };
    setAlertsState(alerts.map((alert) => alert.id === alertId ? { ...alert, messages: [...alert.messages, message] } : alert));
    return shouldFail ? 'error' as const : 'success' as const;
  };

  const retryMessage = async (alertId: string, messageId: string) => {
    await wait(380);
    const current = alerts.find((alert) => alert.id === alertId);
    if (!current || current.status === 'offline' || current.status === 'finished') return 'error' as const;
    setAlertsState(alerts.map((alert) => alert.id === alertId ? { ...alert, messages: alert.messages.map((message) => message.id === messageId ? { ...message, delivery: 'sent' as const } : message) } : alert));
    return 'success' as const;
  };

  const createUser = async (input: Pick<UserRecord, 'firstName' | 'lastName' | 'email' | 'phone'>): Promise<UserMutationResult> => {
    await wait(600);
    if (users.some((user) => user.email.toLowerCase() === input.email.trim().toLowerCase())) return 'duplicate';
    const nextUser: UserRecord = { ...input, id: `U-${String(Date.now()).slice(-5)}`, email: input.email.trim().toLowerCase(), status: 'enabled', registeredAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() };
    setUsersState([nextUser, ...users]);
    addAudit({ action: 'createUser', entity: `Usuaria ${nextUser.id}`, result: 'success', detail: 'Cuenta creada y habilitada.' });
    return 'success';
  };

  const changeUserStatus = async (userId: string): Promise<UserMutationResult> => {
    await wait(560);
    const current = users.find((user) => user.id === userId);
    if (!current || current.status === 'deleted') return 'notAllowed';
    if (current.status === 'enabled') {
      const twoMonthsAgo = new Date(); twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      if (new Date(current.lastActivityAt) > twoMonthsAgo) return 'notAllowed';
    }
    const nextStatus = current.status === 'enabled' ? 'disabled' as const : 'enabled' as const;
    setUsersState(users.map((user) => user.id === userId ? { ...user, status: nextStatus, disabledAt: nextStatus === 'disabled' ? new Date().toISOString() : undefined } : user));
    addAudit({ action: nextStatus === 'disabled' ? 'disableUser' : 'enableUser', entity: `Usuaria ${userId}`, result: 'success', detail: nextStatus === 'disabled' ? 'Cuenta inhabilitada según la regla aplicable.' : 'Cuenta habilitada nuevamente.' });
    return 'success';
  };

  const setFilters = (changes: Partial<FiltersState>) => setFiltersState((current) => {
    const next = { ...current, ...changes };
    window.localStorage.setItem('am.filters', JSON.stringify(next));
    return next;
  });

  return <WebStateContext.Provider value={{ hydrated, session, loggingOut, sessionExpired, alerts, users, audit, filters, login, logout, expireSession, refreshSession: renewSession, startAttention, sendMessage, retryMessage, createUser, changeUserStatus, setFilters }}>{children}</WebStateContext.Provider>;
}

export function useWebState() {
  const value = useContext(WebStateContext);
  if (!value) throw new Error('WebStateProvider is required');
  return value;
}
