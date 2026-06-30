import { useState, useEffect, useRef } from 'react';

const getTrackingWebSocketBase = () => {
  if (process.env.NEXT_PUBLIC_TRACKING_WS_URL) return process.env.NEXT_PUBLIC_TRACKING_WS_URL;

  const goTrackingURL = process.env.NEXT_PUBLIC_GO_TRACKING_URL;
  if (goTrackingURL) {
    return goTrackingURL.replace(/^http/, 'ws').replace(/\/$/, '');
  }

  return null;
};

const WS_BASE = getTrackingWebSocketBase();

export interface LiveBus {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  location: { lat: number; lng: number };
  routeId?: number;
  routeName?: string;
}

export function useLiveBuses(): LiveBus[] {
  const [buses, setBuses] = useState<LiveBus[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);

  useEffect(() => {
    if (!WS_BASE) return;

    shouldReconnectRef.current = true;

    function connect() {
      const ws = new WebSocket(`${WS_BASE}/ws/passenger`);
      wsRef.current = ws;

      ws.onopen = () => console.log('[tracking] passenger connected');

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as unknown;
          setBuses(Array.isArray(payload) ? (payload as LiveBus[]) : []);
        } catch {
          console.error('[tracking] failed to parse bus update');
        }
      };

      ws.onclose = () => {
        if (!shouldReconnectRef.current) return;
        console.log('[tracking] passenger disconnected — reconnecting in 5 s');
        retryRef.current = setTimeout(connect, 5_000);
      };

      ws.onerror = (err) => console.error('[tracking] error', err);
    }

    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, []);

  return buses;
}
