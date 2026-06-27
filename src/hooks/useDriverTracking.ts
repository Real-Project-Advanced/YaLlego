import { useEffect, useRef, useCallback } from 'react';

const WS_BASE = process.env.NEXT_PUBLIC_TRACKING_WS_URL ?? 'ws://localhost:8080';

export function useDriverTracking() {
  const wsRef = useRef<WebSocket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<() => void>(() => {});

  const stop = useCallback(() => {
    if (retryRef.current) clearTimeout(retryRef.current);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    wsRef.current?.close();
    wsRef.current = null;
    watchIdRef.current = null;
  }, []);

  const connect = useCallback(async () => {
    // Fetch the access token from the Next.js API route
    const res = await fetch('/api/auth/token');
    if (!res.ok) {
      console.error('[tracking] could not retrieve access token');
      return;
    }
    const { token } = await res.json();

    const ws = new WebSocket(`${WS_BASE}/ws/driver?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[tracking] driver connected');

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          ws.send(
            JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          );
        },
        (err) => console.error('[geolocation]', err.message),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 },
      );
    };

    ws.onclose = () => {
      console.log('[tracking] disconnected — reconnecting in 5 s');
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      retryRef.current = setTimeout(() => connectRef.current(), 5_000);
    };

    ws.onerror = (err) => console.error('[tracking] WebSocket error', err);
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return stop;
  }, [connect, stop]);
}
