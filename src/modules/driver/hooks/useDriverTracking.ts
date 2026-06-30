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

  useEffect(() => {
    tableExistsRef.current = tableExists;
  }, [tableExists]);

  const publishPosition = useCallback(async () => {
    const nextPosition = await getCurrentPosition();
    setPosition(nextPosition);

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
      if (isMissingSupabaseTableError(upsertError.message)) {
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
  }, [driverCode, driverId, routeName]);

  const stopTracking = useCallback(async () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

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

    if (updateError && isMissingSupabaseTableError(updateError.message)) {
      setTableExists(false);
      return;
    }

    if (updateError) {
      setError(updateError.message);
    }
  }, [driverCode]);

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
      if (tableExistsRef.current) {
        void supabase
          .from('driver_locations')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('driver_code', driverCode);
      }
      deactivateLocalDriverLocation(driverCode);
    };
  }, [driverCode]);

  return {
    error,
    isActive,
    position,
    startTracking,
    stopTracking,
    toggleTracking,
  };
}
