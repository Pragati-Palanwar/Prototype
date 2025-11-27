import { useEffect, useRef } from "react";

const WS_URL = (roomId: string) => `ws://localhost:8000/ws/${roomId}`;

export default function useWebsocket(roomId: string, onMessage: (msg: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const ws = new WebSocket(WS_URL(roomId));
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("ws connected", roomId);
    };
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        onMessage(data);
      } catch (err) {
        console.warn("Invalid ws message", ev.data);
      }
    };
    ws.onclose = () => {
      console.log("ws closed");
    };
    ws.onerror = (ev) => {
      console.error("ws error", ev);
    };

    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [roomId]);

  return {
    send: (payload: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(payload);
      }
    }
  };
}
