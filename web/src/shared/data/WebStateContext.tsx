// Coordina sesión, registros de la interfaz y acciones confirmables entre los módulos web.
import { createContext, useContext, useState, type ReactNode } from 'react';
import { initialAlerts, initialAudit, initialUsers } from './mockData';
import type {
  AlertRecord,
  AuditEvent,
  FiltersState,
  Session,
  UserRecord,
} from '../types/models';

type LoginResult =
  | 'success'
  | 'invalid'
  | 'disabled'
  | 'unauthorized'
  | 'error';
type AttentionResult = 'success' | 'conflict' | 'error';
type UserMutationResult = 'success' | 'duplicate' | 'notAllowed';

interface WebStateValue {
  session: Session | null;
  alerts: AlertRecord[];
  users: UserRecord[];
  audit: AuditEvent[];
  filters: FiltersState;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  expireSession: () => void;
  startAttention: (alertId: string) => Promise<AttentionResult>;
  sendMessage: (
    alertId: string,
    body: string,
  ) => Promise<'success' | 'offline' | 'closed' | 'error'>;
  retryMessage: (
    alertId: string,
    messageId: string,
  ) => Promise<'success' | 'error'>;
  createUser: (
    input: Pick<UserRecord, 'firstName' | 'lastName' | 'email' | 'phone'>,
  ) => Promise<UserMutationResult>;
  changeUserStatus: (userId: string) => Promise<UserMutationResult>;
  setFilters: (changes: Partial<FiltersState>) => void;
}

const initialFilters: FiltersState = {
  alertStatus: 'all',
  alertDate: '',
  alertPage: 1,
  userSearch: '',
  userStatus: 'all',
  userPage: 1,
  auditAction: 'all',
  auditResult: 'all',
  auditDate: '',
  auditPage: 1,
};

const WebStateContext = createContext<WebStateValue | null>(null);

function readStored<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function wait(milliseconds = 520) {
  return new Promise<void>((resolve) =>
    window.setTimeout(resolve, milliseconds),
  );
}

export function WebStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() =>
    readStored('am.session', null),
  );
  const [alerts, setAlertsState] = useState<AlertRecord[]>(() =>
    readStored('am.alerts', initialAlerts),
  );
  const [users, setUsersState] = useState<UserRecord[]>(() =>
    readStored('am.users', initialUsers),
  );
  const [audit, setAuditState] = useState<AuditEvent[]>(() =>
    readStored('am.audit', initialAudit),
  );
  const [filters, setFiltersState] = useState<FiltersState>(() =>
    readStored('am.filters', initialFilters),
  );

  const persist = <T,>(key: string, value: T) =>
    window.localStorage.setItem(key, JSON.stringify(value));

  const addAudit = (event: Omit<AuditEvent, 'id' | 'occurredAt' | 'actor'>) => {
    setAuditState((current) => {
      const next: AuditEvent[] = [
        {
          ...event,
          id: `AU-${Date.now()}`,
          occurredAt: new Date().toISOString(),
          actor: 'Freinier Cardona',
        },
        ...current,
      ];
      persist('am.audit', next);
      return next;
    });
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    await wait();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'error@alertamujer.org') return 'error';
    if (normalizedEmail === 'inhabilitada@alertamujer.org') return 'disabled';
    if (normalizedEmail === 'usuaria@alertamujer.org') return 'unauthorized';
    if (
      normalizedEmail !== 'cardonafreinier@gmail.com' ||
      password !== '1234567890Fs.'
    )
      return 'invalid';

    const nextSession: Session = {
      name: 'Freinier Cardona',
      role: 'administrator',
      email: normalizedEmail,
    };
    setSession(nextSession);
    persist('am.session', nextSession);
    addAudit({
      action: 'login',
      entity: 'Sesión administrativa',
      result: 'success',
      detail: 'Acceso administrativo confirmado.',
    });
    return 'success';
  };

  const logout = () => {
    setSession(null);
    window.localStorage.removeItem('am.session');
  };

  const expireSession = () => logout();

  const startAttention = async (alertId: string): Promise<AttentionResult> => {
    await wait(650);
    const current = alerts.find((alert) => alert.id === alertId);
    if (!current) return 'error';
    if (current.status !== 'active') return 'conflict';
    const isConflict = current.attentionConflict;
    const nextAlerts = alerts.map((alert) =>
      alert.id === alertId
        ? {
            ...alert,
            status: 'inProgress' as const,
            updatedAt: new Date().toISOString(),
            attentionConflict: false,
          }
        : alert,
    );
    setAlertsState(nextAlerts);
    persist('am.alerts', nextAlerts);
    if (isConflict) return 'conflict';
    addAudit({
      action: 'startAttention',
      entity: `Alerta ${alertId}`,
      result: 'success',
      detail: 'Cambio confirmado de Activa a En proceso.',
    });
    return 'success';
  };

  const sendMessage = async (alertId: string, body: string) => {
    await wait(460);
    const current = alerts.find((alert) => alert.id === alertId);
    if (!current) return 'error' as const;
    if (current.status === 'offline') return 'offline' as const;
    if (current.status === 'finished') return 'closed' as const;
    const shouldFail = body.trim().toLowerCase().includes('[error]');
    const message = {
      id: `M-${Date.now()}`,
      author: 'admin' as const,
      authorName: 'Freinier Cardona',
      sentAt: new Date().toISOString(),
      body: body.trim(),
      delivery: shouldFail ? ('failed' as const) : ('sent' as const),
    };
    const nextAlerts = alerts.map((alert) =>
      alert.id === alertId
        ? { ...alert, messages: [...alert.messages, message] }
        : alert,
    );
    setAlertsState(nextAlerts);
    persist('am.alerts', nextAlerts);
    return shouldFail ? ('error' as const) : ('success' as const);
  };

  const retryMessage = async (alertId: string, messageId: string) => {
    await wait(380);
    const current = alerts.find((alert) => alert.id === alertId);
    if (
      !current ||
      current.status === 'offline' ||
      current.status === 'finished'
    )
      return 'error' as const;
    const nextAlerts = alerts.map((alert) =>
      alert.id === alertId
        ? {
            ...alert,
            messages: alert.messages.map((message) =>
              message.id === messageId
                ? { ...message, delivery: 'sent' as const }
                : message,
            ),
          }
        : alert,
    );
    setAlertsState(nextAlerts);
    persist('am.alerts', nextAlerts);
    return 'success' as const;
  };

  const createUser = async (
    input: Pick<UserRecord, 'firstName' | 'lastName' | 'email' | 'phone'>,
  ): Promise<UserMutationResult> => {
    await wait(600);
    if (
      users.some(
        (user) => user.email.toLowerCase() === input.email.trim().toLowerCase(),
      )
    )
      return 'duplicate';
    const nextUser: UserRecord = {
      ...input,
      id: `U-${String(Date.now()).slice(-5)}`,
      email: input.email.trim().toLowerCase(),
      status: 'enabled',
      registeredAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
    const nextUsers = [nextUser, ...users];
    setUsersState(nextUsers);
    persist('am.users', nextUsers);
    addAudit({
      action: 'createUser',
      entity: `Usuaria ${nextUser.id}`,
      result: 'success',
      detail: 'Cuenta creada y habilitada.',
    });
    return 'success';
  };

  const changeUserStatus = async (
    userId: string,
  ): Promise<UserMutationResult> => {
    await wait(560);
    const current = users.find((user) => user.id === userId);
    if (!current || current.status === 'deleted') return 'notAllowed';
    if (current.status === 'enabled') {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      if (new Date(current.lastActivityAt) > twoMonthsAgo) return 'notAllowed';
    }
    const nextStatus =
      current.status === 'enabled'
        ? ('disabled' as const)
        : ('enabled' as const);
    const nextUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: nextStatus,
            disabledAt:
              nextStatus === 'disabled' ? new Date().toISOString() : undefined,
          }
        : user,
    );
    setUsersState(nextUsers);
    persist('am.users', nextUsers);
    addAudit({
      action: nextStatus === 'disabled' ? 'disableUser' : 'enableUser',
      entity: `Usuaria ${userId}`,
      result: 'success',
      detail:
        nextStatus === 'disabled'
          ? 'Cuenta inhabilitada según la regla aplicable.'
          : 'Cuenta habilitada nuevamente.',
    });
    return 'success';
  };

  const setFilters = (changes: Partial<FiltersState>) => {
    setFiltersState((current) => {
      const next = { ...current, ...changes };
      persist('am.filters', next);
      return next;
    });
  };

  const value: WebStateValue = {
    session,
    alerts,
    users,
    audit,
    filters,
    login,
    logout,
    expireSession,
    startAttention,
    sendMessage,
    retryMessage,
    createUser,
    changeUserStatus,
    setFilters,
  };

  return (
    <WebStateContext.Provider value={value}>
      {children}
    </WebStateContext.Provider>
  );
}

export function useWebState() {
  const value = useContext(WebStateContext);
  if (!value) throw new Error('WebStateProvider is required');
  return value;
}
