import { io, type Socket } from 'socket.io-client';
import type { NotificationType } from '../types';

export interface ServerNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  data?: Record<string, unknown>;
}

/**
 * Connect to the realtime notification server. Realtime is optional: when
 * VITE_APP_SOCKET_URL is not configured (e.g. a serverless deployment) this
 * does nothing. Returns a disconnect function.
 */
export function connectRealtime(token: string, onNotification: (n: ServerNotification) => void): () => void {
  const url = import.meta.env.VITE_APP_SOCKET_URL;
  if (!url) return () => undefined;

  // Connect on the next tick: an effect that is set up and immediately torn
  // down (React StrictMode in development) then never opens a socket at all.
  let socket: Socket | null = null;
  const timer = setTimeout(() => {
    socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socket.on('notification', onNotification);
  }, 0);

  return () => {
    clearTimeout(timer);
    socket?.off('notification', onNotification);
    socket?.disconnect();
  };
}
