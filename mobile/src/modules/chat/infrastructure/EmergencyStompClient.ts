import appConfig from '@core/config/appConfig';
import type { ChatMessageResponse } from '@core/api';

type ConnectionState = 'connecting' | 'connected' | 'degraded';

interface Options {
  emergencyId: string;
  accessToken: () => string | null;
  onConnection: (state: ConnectionState) => void;
  onMessage: (message: ChatMessageResponse) => void;
  onEmergencyStatus: (status: string) => void;
  onAuthorizationFailure: () => void;
}

/**
 * Minimal STOMP 1.2 client for the one documented emergency topic. It keeps no
 * persisted queue: a caller may retain one logical message and retry its UUID.
 */
export class EmergencyStompClient {
  private socket: WebSocket | null = null;
  private stopped = false;
  private connected = false;
  private retry = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: Options) {}

  start() {
    this.stopped = false;
    this.retry = 0;
    this.open();
  }

  stop() {
    this.stopped = true;
    this.connected = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.close();
    this.socket = null;
  }

  send(clientMessageId: string, content: string) {
    if (!this.socket || !this.connected || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('El canal de conversación no está conectado.');
    }
    this.frame('SEND', {
      destination: `/app/emergencies/${this.options.emergencyId}/messages`,
      'content-type': 'application/json',
    }, JSON.stringify({ clientMessageId, content }));
  }

  private open() {
    if (this.stopped) return;
    const token = this.options.accessToken();
    if (!token || !appConfig.wsUrl) {
      this.options.onAuthorizationFailure();
      return;
    }
    this.options.onConnection('connecting');
    const socket = new WebSocket(appConfig.wsUrl);
    this.socket = socket;
    socket.onopen = () => {
      if (this.socket !== socket || this.stopped) return;
      this.frame('CONNECT', {
        'accept-version': '1.2',
        'heart-beat': '0,0',
        Authorization: `Bearer ${token}`,
      });
    };
    socket.onmessage = (event) => this.receive(String(event.data));
    socket.onclose = () => {
      if (this.socket === socket) this.socket = null;
      this.connected = false;
      this.scheduleReconnect();
    };
    socket.onerror = () => socket.close();
  }

  private receive(raw: string) {
    for (const frame of raw.split('\0')) {
      const parsed = parseFrame(frame);
      if (!parsed) continue;
      if (parsed.command === 'CONNECTED') {
        this.connected = true;
        this.retry = 0;
        this.options.onConnection('connected');
        this.frame('SUBSCRIBE', {
          id: `emergency-${this.options.emergencyId}`,
          destination: `/topic/emergencies/${this.options.emergencyId}`,
        });
      }
      if (parsed.command === 'ERROR') {
        if (/unauthor|forbidden|access denied/i.test(parsed.body)) this.options.onAuthorizationFailure();
        this.socket?.close();
      }
      if (parsed.command === 'MESSAGE') this.event(parsed.body);
    }
  }

  private event(body: string) {
    try {
      const event = JSON.parse(body) as {
        type?: string;
        messageId?: number;
        clientMessageId?: string;
        senderUserId?: string;
        senderRole?: 'USER' | 'ENTITY_ADMIN';
        content?: string;
        sentAt?: string;
        status?: string;
      };
      if (event.type === 'EMERGENCY_MESSAGE_CREATED' && event.messageId && event.clientMessageId &&
          event.senderUserId && event.senderRole && event.content !== undefined && event.sentAt) {
        this.options.onMessage({
          messageId: event.messageId,
          clientMessageId: event.clientMessageId,
          senderUserId: event.senderUserId,
          senderRole: event.senderRole,
          content: event.content,
          sentAt: event.sentAt,
        });
      }
      if (event.type === 'EMERGENCY_STATUS_CHANGED' && event.status) this.options.onEmergencyStatus(event.status);
    } catch {
      // A malformed frame cannot be treated as a confirmed message.
    }
  }

  private scheduleReconnect() {
    if (this.stopped) return;
    const delays = [1_000, 2_000, 5_000];
    const delay = delays[this.retry];
    if (delay === undefined) {
      this.options.onConnection('degraded');
      return;
    }
    this.retry += 1;
    this.reconnectTimer = setTimeout(() => this.open(), delay);
  }

  private frame(command: string, headers: Record<string, string>, body = '') {
    const headerLines = Object.entries(headers).map(([name, value]) => `${name}:${value}`);
    this.socket?.send(`${command}\n${headerLines.join('\n')}\n\n${body}\0`);
  }
}

function parseFrame(raw: string): { command: string; body: string } | null {
  const value = raw.trim();
  if (!value) return null;
  const separator = value.indexOf('\n\n');
  const command = (separator === -1 ? value : value.slice(0, separator)).split('\n', 1)[0];
  if (!command) return null;
  return { command, body: separator === -1 ? '' : value.slice(separator + 2) };
}
