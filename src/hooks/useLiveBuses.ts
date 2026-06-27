import { useState, useEffect, useRef } from 'react';

const WS_BASE = process.env.NEXT_PUBLIC_TRACKING_WS_URL ?? 'ws://localhost:8080';

export interface LiveBus {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  location: { lat: number; lng: number };
  routeId?: number;
}

export function useLiveBuses(): LiveBus[] {
  const [buses, setBuses] = useState<LiveBus[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(`${WS_BASE}/ws/passenger`);
      wsRef.current = ws;

      ws.onopen = () => console.log('[tracking] passenger connected');

      ws.onmessage = (event) => {
        try {
          setBuses(JSON.parse(event.data) as LiveBus[]);
        } catch {
          console.error('[tracking] failed to parse bus update');
        }
      };

      ws.onclose = () => {
        console.log('[tracking] passenger disconnected — reconnecting in 5 s');
        retryRef.current = setTimeout(connect, 5_000);
      };

      ws.onerror = (err) => console.error('[tracking] error', err);
    }

    connect();

    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, []);

  return buses;
}
