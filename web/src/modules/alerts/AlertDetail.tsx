import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigation } from '../../app/navigation';
import { ApiError, webApiClient, webSocketUrl } from '../../shared/api/client';
import { adminEmergencyApi } from '../../shared/api/emergencyApi';
import type { RemoteEmergency, RemoteEmergencyStatus } from '../../shared/api/emergencyApi';
import { chatApi } from '../../shared/api/chatApi';
import type { ChatMessageResponse } from '../../shared/api/chatApi';
import { evidenceApi } from '../../shared/api/evidenceApi';
import type { EvidenceResponse } from '../../shared/api/evidenceApi';
import { useWebState } from '../../shared/data/WebStateContext';
import { usePreferences } from '../../shared/preferences/PreferencesContext';
import type { AlertStatus } from '../../shared/types/models';
import { Button, Modal, Notice, PageHeader, StatePanel, StatusBadge } from '../../shared/ui/components';
import { Icon } from '../../shared/ui/Icon';
import { formatDateTime } from '../../shared/utils/format';

const statusMap: Record<RemoteEmergencyStatus, AlertStatus> = {
  ACTIVE: 'active', IN_PROGRESS: 'inProgress', OFFLINE: 'offline', FINALIZED: 'finished',
};
const statusView = (status: RemoteEmergencyStatus): AlertStatus => statusMap[status];

function frame(socket: WebSocket, command: string, headers: Record<string, string>, body = '') {
  socket.send(`${command}\n${Object.entries(headers).map(([key, value]) => `${key}:${value}`).join('\n')}\n\n${body}\0`);
}

function merge(current: ChatMessageResponse[], next: ChatMessageResponse) {
  const messages = new Map(current.map((message) => [message.messageId, message]));
  messages.set(next.messageId, next);
  return [...messages.values()].sort((left, right) => left.messageId - right.messageId || left.sentAt.localeCompare(right.sentAt));
}

function parseStomp(raw: string) {
  return raw.split('\0').map((chunk) => {
    const value = chunk.trim();
    const separator = value.indexOf('\n\n');
    return value ? { command: value.split('\n', 1)[0], body: separator < 0 ? '' : value.slice(separator + 2) } : null;
  }).filter((item): item is { command: string; body: string } => item !== null);
}

function useEmergencyChat(emergencyId: string, confirmedStatus: RemoteEmergencyStatus | null) {
  const { refreshSession } = useWebState();
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const messagesRef = useRef<ChatMessageResponse[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<'connecting' | 'connected' | 'degraded'>('connecting');
  const [status, setStatus] = useState<RemoteEmergencyStatus | null>(confirmedStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ clientMessageId: string; content: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setStatus(confirmedStatus), 0);
    return () => window.clearTimeout(timer);
  }, [confirmedStatus]);

  const append = useCallback((message: ChatMessageResponse) => {
    setMessages((current) => {
      const next = merge(current, message);
      messagesRef.current = next;
      return next;
    });
    setPending((current) => current?.clientMessageId === message.clientMessageId ? null : current);
  }, []);

  const recover = useCallback(async () => {
    setLoading(true);
    try {
      const after = messagesRef.current.at(-1)?.messageId ?? 0;
      (await chatApi.list(emergencyId, after)).forEach(append);
      setError(null);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible recuperar la conversación.');
    } finally { setLoading(false); }
  }, [append, emergencyId]);

  useEffect(() => {
    messagesRef.current = [];
    const recoveryTimer = window.setTimeout(() => void recover(), 0);
    let stopped = false;
    let retry = 0;
    let timer: number | undefined;
    const connect = () => {
      if (stopped) return;
      const token = webApiClient.getAccessToken();
      if (!token || !webSocketUrl()) return;
      setConnection('connecting');
      const socket = new WebSocket(webSocketUrl());
      socketRef.current = socket;
      socket.onopen = () => frame(socket, 'CONNECT', { 'accept-version': '1.2', Authorization: `Bearer ${token}` });
      socket.onmessage = (event) => parseStomp(String(event.data)).forEach(async (packet) => {
        if (packet.command === 'CONNECTED') {
          retry = 0;
          setConnection('connected');
          frame(socket, 'SUBSCRIBE', { id: `emergency-${emergencyId}`, destination: `/topic/emergencies/${emergencyId}` });
          void recover();
        }
        if (packet.command === 'ERROR') {
          if (/unauthor|forbidden|access denied/i.test(packet.body)) await refreshSession();
          socket.close();
        }
        if (packet.command === 'MESSAGE') {
          try {
            const eventData = JSON.parse(packet.body) as ChatMessageResponse & { type?: string; status?: RemoteEmergencyStatus };
            if (eventData.type === 'EMERGENCY_MESSAGE_CREATED') append(eventData);
            if (eventData.type === 'EMERGENCY_STATUS_CHANGED' && eventData.status) setStatus(eventData.status);
          } catch { /* Never display a malformed frame as a confirmed message. */ }
        }
      });
      socket.onerror = () => socket.close();
      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
        if (stopped) return;
        const delay = [1_000, 2_000, 5_000][retry++];
        if (delay === undefined) { setConnection('degraded'); return; }
        timer = window.setTimeout(connect, delay);
      };
    };
    connect();
    return () => { stopped = true; window.clearTimeout(recoveryTimer); if (timer) window.clearTimeout(timer); socketRef.current?.close(); socketRef.current = null; };
  }, [append, confirmedStatus, emergencyId, recover, refreshSession]);

  const send = useCallback((content: string, existing?: { clientMessageId: string; content: string }) => {
    const value = content.trim();
    if (!value || value.length > 500 || !socketRef.current || connection !== 'connected') return false;
    const logical = existing ?? { clientMessageId: crypto.randomUUID(), content: value };
    setPending(logical);
    frame(socketRef.current, 'SEND', { destination: `/app/emergencies/${emergencyId}/messages`, 'content-type': 'application/json' }, JSON.stringify(logical));
    return true;
  }, [connection, emergencyId]);

  return { messages, loading, connection, error, pending, status, recover, send };
}

function useEvidence(emergencyId: string) {
  const [items, setItems] = useState<EvidenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await evidenceApi.list(emergencyId)); setError(null); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'No fue posible cargar las evidencias.'); }
    finally { setLoading(false); }
  }, [emergencyId]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  return { items, loading, error, load };
}

async function findEmergency(emergencyId: string): Promise<RemoteEmergency | null> {
  let page = 0;
  for (;;) {
    const response = await adminEmergencyApi.list(page, 50);
    const found = response.items.find((item) => item.emergencyId === emergencyId);
    if (found) return found;
    if ((page + 1) * response.size >= response.total) return null;
    page += 1;
  }
}

export function AlertDetail({ alertId }: { alertId: string }) {
  const { t, language } = usePreferences();
  const { session } = useWebState();
  const { navigate } = useNavigation();
  const [alert, setAlert] = useState<RemoteEmergency | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [attentionOpen, setAttentionOpen] = useState(false);
  const [attentionBusy, setAttentionBusy] = useState(false);
  const [viewer, setViewer] = useState<EvidenceResponse | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const evidence = useEvidence(alertId);
  const chat = useEmergencyChat(alertId, alert?.status ?? null);

  const loadDetail = useCallback(async () => {
    try { setAlert(await findEmergency(alertId)); setDetailError(null); }
    catch (cause) { setDetailError(cause instanceof ApiError ? cause.message : t('alertsError')); }
  }, [alertId, t]);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadDetail(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDetail]);
  useEffect(() => () => { if (viewerUrl) URL.revokeObjectURL(viewerUrl); }, [viewerUrl]);

  const openEvidence = async (item: EvidenceResponse) => {
    setViewer(item); setViewerError(null); setViewerUrl(null);
    try { setViewerUrl(URL.createObjectURL(await evidenceApi.content(item.evidenceId))); }
    catch (cause) { setViewerError(cause instanceof ApiError ? cause.message : t('imageUnavailable')); }
  };
  const closeViewer = () => { setViewer(null); setViewerUrl(null); };
  const startAttention = async () => {
    if (!alert) return;
    setAttentionBusy(true);
    try { await adminEmergencyApi.startAttention(alert.emergencyId); setAlert({ ...alert, status: 'IN_PROGRESS' }); setAttentionOpen(false); }
    catch (cause) { setDetailError(cause instanceof ApiError ? cause.message : t('serviceError')); }
    finally { setAttentionBusy(false); }
  };
  const [message, setMessage] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); if (chat.send(message)) setMessage(''); };
  const canCompose = (chat.status === 'ACTIVE' || chat.status === 'IN_PROGRESS') && chat.connection === 'connected';

  return <div className="alert-detail-page">
    <PageHeader eyebrow={alertId} title={t('alertDetail')} description={alert ? `${t('startDate')}: ${formatDateTime(alert.startedAt, language)}` : undefined}
      actions={<><Button variant="secondary" icon="arrowLeft" onClick={() => navigate('/admin/alertas')}>{t('back')}</Button>
        {alert?.status === 'ACTIVE' ? <Button icon="spark" onClick={() => setAttentionOpen(true)}>{t('startAttention')}</Button> : null}</>} />
    {detailError ? <StatePanel kind="error" title={t('error')} message={detailError} action={<Button onClick={() => void loadDetail()}>{t('retry')}</Button>} /> : null}
    {!alert && !detailError ? <StatePanel kind="loading" message={t('loading')} /> : null}
    {alert ? <><div className="detail-status-row"><StatusBadge status={statusView(alert.status)} /><span>{t('lastUpdate')}: {formatDateTime(alert.lastHeartbeatAt ?? alert.startedAt, language)}</span></div>
      <Notice kind="warning">{t('partialData')}</Notice>
      <div className="detail-grid detail-grid--context">
        <section className="panel-card evidence-card"><header className="panel-card__header"><div><p className="eyebrow">{t('photoEvidence')}</p><h2>{t('evidence')}</h2></div><span className="count-chip">{evidence.items.length}</span></header>
          {evidence.loading ? <StatePanel kind="loading" message={t('loading')} /> : evidence.error ? <StatePanel kind="error" message={evidence.error} action={<Button onClick={() => void evidence.load()}>{t('retry')}</Button>} />
            : evidence.items.length === 0 ? <StatePanel kind="empty" message={t('noEvidence')} />
              : <div className="evidence-grid">{evidence.items.map((item, index) => <button key={item.evidenceId} type="button" className="evidence-thumb" onClick={() => void openEvidence(item)}><span className="evidence-thumb__image"><Icon name="camera" /></span><span>{t('photo')} {index + 1}<small>{formatDateTime(item.receivedAt, language)}</small></span></button>)}</div>}
        </section>
        <section className="panel-card chat-card"><header className="panel-card__header"><div><p className="eyebrow">{alert.emergencyId}</p><h2>{t('conversation')}</h2></div><span className={`connection-chip ${chat.connection === 'degraded' ? 'is-offline' : ''}`}><span />{chat.status === 'FINALIZED' ? t('closedChat') : chat.connection === 'connecting' ? t('connecting') : chat.connection === 'degraded' ? t('disconnected') : t('connected')}</span></header>
          <div className="messages" aria-live="polite">{chat.loading ? <StatePanel kind="loading" message={t('loading')} /> : chat.messages.length === 0 ? <StatePanel kind="empty" message={t('noMessages')} />
            : chat.messages.map((item) => <article key={item.messageId} className={`message message--${item.senderUserId === session?.userId ? 'admin' : 'user'}`}><header><strong>{item.senderUserId === session?.userId ? t('adminRole') : item.senderRole === 'ENTITY_ADMIN' ? t('adminRole') : t('user')}</strong><time>{formatDateTime(item.sentAt, language)}</time></header><p>{item.content}</p></article>)}</div>
          {chat.error ? <Notice kind="error">{chat.error}</Notice> : null}
          {canCompose ? <form className="chat-compose" onSubmit={submit}><label className="sr-only" htmlFor="chat-message">{t('messagePlaceholder')}</label><textarea id="chat-message" value={message} maxLength={500} onChange={(event) => setMessage(event.target.value)} placeholder={t('messagePlaceholder')} rows={2} /><Button type="submit" icon="send" disabled={!message.trim() || chat.pending !== null}>{t('send')}</Button></form>
            : <div className="chat-compose"><StatePanel kind="warning" message={chat.status === 'FINALIZED' ? t('closedChat') : t('disconnected')} />{chat.pending ? <Button onClick={() => { if (chat.pending) chat.send(chat.pending.content, chat.pending); }}>{t('retrySend')}</Button> : null}{chat.connection === 'degraded' ? <Button variant="secondary" onClick={() => void chat.recover()}>{t('retry')}</Button> : null}</div>}
        </section>
      </div></> : null}
    <Modal open={attentionOpen} title={t('startAttentionTitle')} description={t('startAttentionText')} onClose={() => !attentionBusy && setAttentionOpen(false)}><div className="modal__actions"><Button variant="secondary" onClick={() => setAttentionOpen(false)} disabled={attentionBusy}>{t('cancel')}</Button><Button onClick={() => void startAttention()} disabled={attentionBusy}>{attentionBusy ? t('processing') : t('confirm')}</Button></div></Modal>
    <Modal open={viewer !== null} title={t('evidence')} description={viewer ? formatDateTime(viewer.receivedAt, language) : undefined} onClose={closeViewer} size="viewer">{viewerError ? <StatePanel kind="error" message={viewerError} /> : viewerUrl ? <div className="evidence-viewer"><img src={viewerUrl} alt={t('photo')} /><div className="viewer-controls"><Button variant="secondary" onClick={closeViewer}>{t('closeViewer')}</Button></div></div> : <StatePanel kind="loading" message={t('loading')} />}</Modal>
  </div>;
}
