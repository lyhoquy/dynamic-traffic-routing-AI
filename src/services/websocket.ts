import type { WSMessage, ConnectionStatus } from '../types/websocket';
import { WS_BASE_URL, WS_RECONNECT_INTERVAL, WS_MAX_RECONNECT_ATTEMPTS } from '../utils/constants';

type MessageHandler = (message: WSMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private handlers = new Set<MessageHandler>();
  private statusHandlers = new Set<(status: ConnectionStatus) => void>();

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.notifyStatus('connecting');
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.notifyStatus('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handlers.forEach((handler) => handler(message));
      } catch {
        console.error('Failed to parse WebSocket message');
      }
    };

    this.ws.onclose = () => {
      this.notifyStatus('disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = () => {
      this.notifyStatus('error');
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = WS_MAX_RECONNECT_ATTEMPTS;
    this.ws?.close();
    this.ws = null;
  }

  send(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= WS_MAX_RECONNECT_ATTEMPTS) return;
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => this.connect(), WS_RECONNECT_INTERVAL);
  }

  private notifyStatus(status: ConnectionStatus): void {
    this.statusHandlers.forEach((handler) => handler(status));
  }
}

export const wsService = new WebSocketService(WS_BASE_URL);
