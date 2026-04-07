import { useEffect, useRef, useState } from 'react';
import type { WSMessage, ConnectionStatus } from '../types/websocket';
import { wsService } from '../services/websocket';

interface UseWebSocketOptions {
  onMessage?: (message: WSMessage) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onMessage, autoConnect = true } = options;
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    const unsubStatus = wsService.onStatusChange(setStatus);
    const unsubMessage = wsService.onMessage((msg) => {
      handlerRef.current?.(msg);
    });

    if (autoConnect) {
      wsService.connect();
    }

    return () => {
      unsubStatus();
      unsubMessage();
    };
  }, [autoConnect]);

  return {
    status,
    connect: () => wsService.connect(),
    disconnect: () => wsService.disconnect(),
    send: (message: WSMessage) => wsService.send(message),
  };
}
