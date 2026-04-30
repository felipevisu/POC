import { useEffect, useRef, useCallback } from "react";

export type Role = "controller" | "viewer";
export type WsMessage = Record<string, unknown>;

interface UseWebSocketOptions {
  sessionId: string;
  clientId: string;
  onMessage: (msg: WsMessage) => void;
  onRoleAssigned: (role: Role) => void;
}

const WS_BASE =
  import.meta.env.VITE_WS_URL ?? "ws://localhost:8000";

const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 10;

export function useWebSocket({
  sessionId,
  clientId,
  onMessage,
  onRoleAssigned,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);
  // Keep latest callbacks in refs so reconnect closure captures current versions
  const onMessageRef = useRef(onMessage);
  const onRoleRef = useRef(onRoleAssigned);
  onMessageRef.current = onMessage;
  onRoleRef.current = onRoleAssigned;

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const url = `${WS_BASE}/ws/${sessionId}?clientId=${clientId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptRef.current = 0;
    };

    ws.onmessage = (event) => {
      let msg: WsMessage;
      try {
        msg = JSON.parse(event.data as string) as WsMessage;
      } catch {
        return;
      }

      if (msg.type === "role" && typeof msg.role === "string") {
        onRoleRef.current(msg.role as Role);
      } else {
        onMessageRef.current(msg);
      }
    };

    ws.onclose = (ev) => {
      // Code 1000 = intentional close (component unmounting)
      if (!mountedRef.current || ev.code === 1000) return;

      if (attemptRef.current < MAX_RECONNECT_ATTEMPTS) {
        attemptRef.current++;
        setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [sessionId, clientId]);

  const sendMessage = useCallback((msg: WsMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      wsRef.current?.close(1000, "unmount");
    };
  }, [connect]);

  return { sendMessage };
}
