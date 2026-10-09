import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient, ApiError, chatApi } from '@core/api';
import type { ChatMessageResponse } from '@core/api';
import { EmergencyStompClient } from '@modules/chat/infrastructure/EmergencyStompClient';

export type EmergencyChatStatus = 'ACTIVE' | 'IN_PROGRESS' | 'OFFLINE' | 'FINALIZED';
type ConnectionState = 'connecting' | 'connected' | 'degraded';

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

export function useEmergencyChat(emergencyId: string, confirmedStatus: EmergencyChatStatus) {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const messagesRef = useRef<ChatMessageResponse[]>([]);
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ clientMessageId: string; content: string } | null>(null);
  const [remoteStatus, setRemoteStatus] = useState<EmergencyChatStatus>(confirmedStatus);
  const clientRef = useRef<EmergencyStompClient | null>(null);

  const apply = useCallback((message: ChatMessageResponse) => {
    setMessages((current) => {
      const next = merge(current, message);
      messagesRef.current = next;
      return next;
    });
    setPending((current) => current?.clientMessageId === message.clientMessageId ? null : current);
  }, []);

  const recover = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const after = messagesRef.current.at(-1)?.messageId ?? 0;
      const recovered = await chatApi.list(emergencyId, after);
      recovered.forEach(apply);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No fue posible recuperar la conversación.');
    } finally {
      setLoading(false);
    }
  }, [apply, emergencyId]);

  useEffect(() => {
    messagesRef.current = [];
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
  }, [apply, confirmedStatus, emergencyId, recover]);

  const retryPending = useCallback(() => {
    if (!pending) return;
    try {
      clientRef.current?.send(pending.clientMessageId, pending.content);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible enviar el mensaje.');
    }
  }, [pending]);

  const send = useCallback((value: string) => {
    const content = value.trim();
    if (!content || content.length > 500 || remoteStatus === 'OFFLINE' || remoteStatus === 'FINALIZED') return false;
    const logicalMessage = pending ?? { clientMessageId: createClientMessageId(), content };
    setPending(logicalMessage);
    try {
      clientRef.current?.send(logicalMessage.clientMessageId, logicalMessage.content);
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
