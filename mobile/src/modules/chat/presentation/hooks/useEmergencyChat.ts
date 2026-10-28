import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient, ApiError, chatApi } from '@core/api';
import type { ChatMessageResponse } from '@core/api';
import { EmergencyStompClient } from '@modules/chat/infrastructure/EmergencyStompClient';

export type EmergencyChatStatus = 'ACTIVE' | 'IN_PROGRESS' | 'OFFLINE' | 'FINALIZED';
type ConnectionState = 'connecting' | 'connected' | 'degraded';

// Unifica eventos STOMP y lecturas REST por el identificador persistido, sin duplicar mensajes.
function merge(messages: ChatMessageResponse[], incoming: ChatMessageResponse) {
  const byId = new Map(messages.map((message) => [message.messageId, message]));
  byId.set(incoming.messageId, incoming);
  return [...byId.values()].sort((left, right) => left.messageId - right.messageId || left.sentAt.localeCompare(right.sentAt));
}

function createClientMessageId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === 'x' ? value : (value & 0x3) | 0x8).toString(16);
  });
}

// Coordina conversación, recuperación del historial y confirmación del mensaje pendiente.
export function useEmergencyChat(emergencyId: string, confirmedStatus: EmergencyChatStatus) {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  // Cursor de recuperación REST; los eventos en vivo no lo adelantan para no saltar mensajes.
  const recoveredThrough = useRef(0);
  const recovering = useRef(false);
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ clientMessageId: string; content: string } | null>(null);
  const [remoteStatus, setRemoteStatus] = useState<EmergencyChatStatus>(confirmedStatus);
  const clientRef = useRef<EmergencyStompClient | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setRemoteStatus(confirmedStatus), 0);
    return () => clearTimeout(timer);
  }, [confirmedStatus]);

  const apply = useCallback((message: ChatMessageResponse) => {
    setMessages((current) => {
      const next = merge(current, message);
      return next;
    });
    setPending((current) => current?.clientMessageId === message.clientMessageId ? null : current);
  }, []);

  // Recorre páginas de 50 mensajes y evita ejecutar dos recuperaciones a la vez.
  const recover = useCallback(async () => {
    if (recovering.current) return;
    recovering.current = true;
    setLoading(true);
    setError(null);
    try {
      let page: ChatMessageResponse[];
      do {
        page = await chatApi.list(emergencyId, recoveredThrough.current);
        page.forEach(apply);
        if (page.length) recoveredThrough.current = page[page.length - 1].messageId;
      } while (page.length === 50);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible recuperar la conversación.');
    } finally {
      recovering.current = false;
      setLoading(false);
    }
  }, [apply, emergencyId]);

  useEffect(() => {
    recoveredThrough.current = 0;
    const recoveryTimer = setTimeout(() => void recover(), 0);
    const client = new EmergencyStompClient({
      emergencyId,
      accessToken: () => apiClient.getAccessToken(),
      onConnection: (state) => {
        setConnection(state);
        if (state === 'connected') void recover();
      },
      onMessage: apply,
      onEmergencyStatus: (status) => {
        if (status === 'ACTIVE' || status === 'IN_PROGRESS' || status === 'OFFLINE' || status === 'FINALIZED') {
          setRemoteStatus(status);
        }
      },
      onAuthorizationFailure: () => {
        void apiClient.refreshAccessToken().then((refreshed) => {
          if (!refreshed) apiClient.invalidateAuthenticatedSession();
        });
      },
    });
    clientRef.current = client;
    client.start();
    return () => {
      clearTimeout(recoveryTimer);
      client.stop();
      if (clientRef.current === client) clientRef.current = null;
    };
  }, [apply, emergencyId, recover]);

  const pendingId = pending?.clientMessageId;
  useEffect(() => {
    if (!pendingId) return;
    // Mientras falte confirmación, consulta el historial para recuperar un evento que pudo perderse.
    const timer = setInterval(() => void recover(), 3000);
    return () => clearInterval(timer);
  }, [pendingId, recover]);

  const retryPending = useCallback(() => {
    if (!pending) return;
    try {
      if (!clientRef.current) throw new Error('El canal de conversación no está conectado.');
      clientRef.current.send(pending.clientMessageId, pending.content);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible enviar el mensaje.');
    }
  }, [pending]);

  const send = useCallback((value: string) => {
    const content = value.trim();
    if (!content || content.length > 500 || remoteStatus === 'OFFLINE' || remoteStatus === 'FINALIZED') return false;
    // Un reintento conserva el identificador del mensaje pendiente para aprovechar la idempotencia del servidor.
    const logicalMessage = pending ?? { clientMessageId: createClientMessageId(), content };
    setPending(logicalMessage);
    try {
      if (!clientRef.current) throw new Error('El canal de conversación no está conectado.');
      clientRef.current.send(logicalMessage.clientMessageId, logicalMessage.content);
      setError(null);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible enviar el mensaje.');
      return false;
    }
  }, [pending, remoteStatus]);

  return {
    messages,
    loading,
    error,
    connection,
    pending,
    status: remoteStatus,
    canCompose: (remoteStatus === 'ACTIVE' || remoteStatus === 'IN_PROGRESS') && connection === 'connected',
    send,
    recover,
    retryPending,
  };
}
