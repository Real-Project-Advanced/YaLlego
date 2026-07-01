'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/lib/supabase';
import {
  deactivateLocalDriverLocation,
  isMissingSupabaseTableError,
  upsertLocalDriverLocation,
} from '@/modules/shared/services/localRealtimeFallback';

const getTrackingWebSocketBase = () => {
  if (process.env.NEXT_PUBLIC_TRACKING_WS_URL) return process.env.NEXT_PUBLIC_TRACKING_WS_URL;

  const goTrackingURL = process.env.NEXT_PUBLIC_GO_TRACKING_URL;
  if (goTrackingURL) {
    return goTrackingURL.replace(/^http/, 'ws').replace(/\/$/, '');
  }

  return null;
};

const trackingWebSocketBase = getTrackingWebSocketBase();

export type DriverPosition = {
  lat: number;
  lng: number;
};

type UseDriverTrackingOptions = {
  driverId: number;
  driverCode: string;
  routeName: string;
};

async function getCurrentPosition(): Promise<DriverPosition> {
  if (Capacitor.isNativePlatform()) {
    const currentPermissions = await Geolocation.checkPermissions();
    const permissionStatus =
      currentPermissions.location === 'granted'
        ? currentPermissions
        : await Geolocation.requestPermissions();

    if (permissionStatus.location === 'denied') {
      throw new Error('No pude obtener permisos de ubicacion.');
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    });

    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tu navegador no permite compartir ubicacion.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => reject(new Error('No pude obtener tu ubicacion actual.')),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  });
}

export function useDriverTracking({ driverCode, driverId, routeName }: UseDriverTrackingOptions) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState<DriverPosition | null>(null);
  const [error, setError] = useState('');
  const [tableExists, setTableExists] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const tableExistsRef = useRef(true);
  const trackingSocketRef = useRef<WebSocket | null>(null);
  const trackingSocketTokenRef = useRef('');

  useEffect(() => {
    tableExistsRef.current = tableExists;
  }, [tableExists]);

  const closeTrackingSocket = useCallback(() => {
    trackingSocketRef.current?.close();
    trackingSocketRef.current = null;
  }, []);

  const sendPositionToTrackingSocket = useCallback(async (position: DriverPosition) => {
    if (!trackingWebSocketBase) return;
    if (typeof WebSocket === 'undefined') return;

    let socket = trackingSocketRef.current;

    const needsNewSocket =
      socket === null ||
      socket.readyState === WebSocket.CLOSED ||
      socket.readyState === WebSocket.CLOSING;

    if (needsNewSocket) {
      try {
        if (!trackingSocketTokenRef.current) {
          const response = await fetch('/api/auth/token');

          if (!response.ok) return;

          const payload = (await response.json()) as { token?: string };
          trackingSocketTokenRef.current = payload.token ?? '';
        }

        if (!trackingSocketTokenRef.current) return;

        socket = new WebSocket(
          `${trackingWebSocketBase}/ws/driver?token=${encodeURIComponent(
            trackingSocketTokenRef.current,
          )}`,
        );

        trackingSocketRef.current = socket;

        socket.onclose = () => {
          if (trackingSocketRef.current === socket) {
            trackingSocketRef.current = null;
          }
        };
      } catch {
        return;
      }
    }

    // TypeScript ya sabe que aquí existe
    if (!socket) return;

    const payload = JSON.stringify({
      lat: position.lat,
      lng: position.lng,
    });

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
      return;
    }

    if (socket.readyState === WebSocket.CONNECTING) {
      const currentSocket = socket;

      const sendWhenOpen = () => {
        currentSocket.send(payload);
      };

      currentSocket.addEventListener('open', sendWhenOpen, {
        once: true,
      });
    }
  }, []);

  const publishPosition = useCallback(async () => {
    const nextPosition = await getCurrentPosition();
    setPosition(nextPosition);
    void sendPositionToTrackingSocket(nextPosition);

    if (!tableExistsRef.current) {
      upsertLocalDriverLocation({
        driverId,
        driverCode,
        routeName,
        lat: nextPosition.lat,
        lng: nextPosition.lng,
        price: 3800,
      });
      setError('');
      return;
    }

    const { error: upsertError } = await supabase.from('driver_locations').upsert(
      {
        driver_id: String(driverId),
        driver_code: driverCode,
        route_name: routeName,
        lat: nextPosition.lat,
        lng: nextPosition.lng,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'driver_code' },
    );

    if (upsertError) {
      if (isMissingSupabaseTableError(`${upsertError.code ?? ''} ${upsertError.message}`)) {
        setTableExists(false);
        upsertLocalDriverLocation({
          driverId,
          driverCode,
          routeName,
          lat: nextPosition.lat,
          lng: nextPosition.lng,
          price: 3800,
        });
        setError('');
        return;
      }

      setError(`GPS activo, pero no pude sincronizar la ubicacion: ${upsertError.message}`);
      return;
    }

    setError('');
  }, [driverCode, driverId, routeName, sendPositionToTrackingSocket]);

  const stopTracking = useCallback(async () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    closeTrackingSocket();
    setIsActive(false);
    setError('');

    if (!tableExistsRef.current) {
      deactivateLocalDriverLocation(driverCode);
      return;
    }

    const { error: updateError } = await supabase
      .from('driver_locations')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('driver_code', driverCode);

    deactivateLocalDriverLocation(driverCode);

    if (
      updateError &&
      isMissingSupabaseTableError(`${updateError.code ?? ''} ${updateError.message}`)
    ) {
      setTableExists(false);
      return;
    }

    if (updateError) {
      setError(updateError.message);
    }
  }, [closeTrackingSocket, driverCode]);

  const startTracking = useCallback(async () => {
    setError('');

    try {
      await publishPosition();
      setIsActive(true);

      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        void publishPosition().catch((trackingError) => {
          setError(
            trackingError instanceof Error
              ? trackingError.message
              : 'No pude leer tu ubicacion GPS.',
          );
        });
      }, 5000);
    } catch (trackingError) {
      setIsActive(false);
      setError(trackingError instanceof Error ? trackingError.message : 'No pude iniciar el GPS.');
    }
  }, [publishPosition]);

  const toggleTracking = useCallback(() => {
    if (isActive) {
      void stopTracking();
      return;
    }

    void startTracking();
  }, [isActive, startTracking, stopTracking]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      closeTrackingSocket();
      if (tableExistsRef.current) {
        void supabase
          .from('driver_locations')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('driver_code', driverCode);
      }
      deactivateLocalDriverLocation(driverCode);
    };
  }, [closeTrackingSocket, driverCode]);

  return {
    error,
    isActive,
    position,
    startTracking,
    stopTracking,
    toggleTracking,
  };
}
