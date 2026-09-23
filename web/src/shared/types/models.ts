// Define los modelos simples compartidos por las pantallas del frontend web.
export type Language = 'es' | 'en';
export type ThemeMode = 'light' | 'dark';
export type AlertStatus = 'active' | 'inProgress' | 'offline' | 'finished';
export type AccountStatus = 'enabled' | 'disabled' | 'deleted';
export type ResultStatus = 'success' | 'failed';

export interface Session {
  name: string;
  role: 'administrator';
  email: string;
}

export interface Evidence {
  id: string;
  url: string;
  capturedAt: string;
  alt: string;
}

export interface ChatMessage {
  id: string;
  author: 'user' | 'admin';
  authorName: string;
  sentAt: string;
  body: string;
  delivery: 'sent' | 'failed';
}

export interface AlertRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  startedAt: string;
  updatedAt: string;
  finishedAt?: string;
  status: AlertStatus;
  previousStatus?: Exclude<AlertStatus, 'offline' | 'finished'>;
  message: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  evidence: Evidence[];
  messages: ChatMessage[];
  attentionConflict?: boolean;
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: AccountStatus;
  registeredAt: string;
  lastActivityAt: string;
  disabledAt?: string;
}

export interface AuditEvent {
  id: string;
  occurredAt: string;
  actor: string;
  action:
    | 'login'
    | 'startAttention'
    | 'createUser'
    | 'disableUser'
    | 'enableUser';
  entity: string;
  result: ResultStatus;
  detail: string;
}

export interface FiltersState {
  alertStatus: AlertStatus | 'all';
  alertDate: string;
  alertPage: number;
  userSearch: string;
  userStatus: AccountStatus | 'all';
  userPage: number;
  auditAction: AuditEvent['action'] | 'all';
  auditResult: ResultStatus | 'all';
  auditDate: string;
  auditPage: number;
}
