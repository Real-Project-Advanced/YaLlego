'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ActiveDriverLocation } from '../components/UserRouteMapShared';
import {
  isMissingSupabaseTableError,
  readLocalDriverLocations,
} from '@/modules/shared/services/localRealtimeFallback';

export type DriverLocation = {
  id: string;
  driver_id: string;
  driver_code: string;
  route_name: string;
  lat: number;
  lng: number;
  is_active: boolean;
  updated_at: string;
};

type DriverLocationRow = {
  id?: string | null;
  driver_id?: number | string | null;
  driver_code?: string | null;
  route_name?: string | null;
  lat?: number | null;
  lng?: number | null;
  is_active?: boolean | null;
  updated_at?: string | null;
};

type DriverRouteRow = {
  driver_code?: string | null;
  route_name?: string | null;
  estimated_duration?: number | null;
  total_distance?: number | null;
  price?: number | null;
};

const getDriverIdFromCode = (driverCode: string) => {
  const driverId = Number(driverCode.replace(/\D/g, ''));

  return Number.isFinite(driverId) && driverId > 0 ? driverId : null;
};

const isDriverLocationsUnavailable = (error: { code?: string; message?: string }) =>
  error.code === 'PGRST116' ||
  error.code === 'PGRST205' ||
  isMissingSupabaseTableError(error.message ?? '');

export function useDriverLocations() {
  const [drivers, setDrivers] = useState<ActiveDriverLocation[]>([]);
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
  const [error, setError] = useState('');
  const [tableExists, setTableExists] = useState(true);

  const loadDrivers = useCallback(async () => {
    if (!tableExists) return;

    let data: unknown[] | null = null;

    try {
      const { data: locationData, error: locationError } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('is_active', true);

      if (locationError) {
        if (isDriverLocationsUnavailable(locationError)) {
          setTableExists(false);
        }

        console.warn('driver_locations unavailable:', locationError.message);
        setDrivers([]);
        setDriverLocations([]);
        setError('');
        return;
      }

      data = locationData;
    } catch {
      setDrivers([]);
      setDriverLocations([]);
      setError('');
      return;
    }

    const locationRows = (data ?? []) as DriverLocationRow[];
    const nextDriverLocations = locationRows
      .filter(
        (row) =>
          row.id &&
          row.driver_id &&
          row.driver_code &&
          row.route_name &&
          typeof row.lat === 'number' &&
          typeof row.lng === 'number',
      )
      .map((row) => ({
        id: row.id ?? `${row.driver_code}-${row.updated_at ?? 'active'}`,
        driver_id: String(row.driver_id ?? ''),
        driver_code: row.driver_code ?? '',
        route_name: row.route_name ?? 'Ruta activa',
        lat: row.lat ?? 0,
        lng: row.lng ?? 0,
        is_active: row.is_active ?? true,
        updated_at: row.updated_at ?? '',
      }));
    const driverCodes = locationRows
      .map((row) => row.driver_code)
      .filter((driverCode): driverCode is string => Boolean(driverCode));

    let routeRows: DriverRouteRow[] = [];

    if (driverCodes.length > 0) {
      const { data: driverRouteData } = await supabase
        .from('driver_routes')
        .select('*')
        .in('driver_code', driverCodes);

      routeRows = (driverRouteData ?? []) as DriverRouteRow[];
    }

    const routeByDriver = new Map(routeRows.map((row) => [row.driver_code, row]));
    const nextDrivers = locationRows
      .filter(
        (row) =>
          row.driver_code &&
          row.route_name &&
          typeof row.lat === 'number' &&
          typeof row.lng === 'number',
      )
      .map((row) => {
        const routeData = routeByDriver.get(row.driver_code ?? '');
        const rawDriverId = row.driver_id;
        const parsedDriverId =
          typeof rawDriverId === 'number' ? rawDriverId : Number(rawDriverId ?? NaN);

        return {
          driverCode: row.driver_code ?? '',
          driverId:
            Number.isFinite(parsedDriverId) && parsedDriverId > 0
              ? parsedDriverId
              : getDriverIdFromCode(row.driver_code ?? ''),
          routeName: routeData?.route_name ?? row.route_name ?? 'Ruta activa',
          lat: row.lat ?? 0,
          lng: row.lng ?? 0,
          estimatedDuration: routeData?.estimated_duration,
          totalDistance: routeData?.total_distance,
          price: routeData?.price ?? 3800,
        };
      });

    const localDrivers = readLocalDriverLocations();
    const remoteCodes = new Set(nextDrivers.map((driver) => driver.driverCode));
    setDrivers([
      ...nextDrivers,
      ...localDrivers.filter((driver) => !remoteCodes.has(driver.driverCode)),
    ]);
    setDriverLocations(nextDriverLocations);
    setError('');
  }, [tableExists]);

  useEffect(() => {
    if (!tableExists) return;

    const loadTimer = window.setTimeout(() => {
      void loadDrivers();
    }, 0);

    const interval = window.setInterval(() => {
      void loadDrivers();
    }, 5000);

    const channel = supabase
      .channel('user-driver-locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_locations' }, () => {
        void loadDrivers();
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setTableExists(false);
          void supabase.removeChannel(channel);
        }
      });

    return () => {
      window.clearTimeout(loadTimer);
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [loadDrivers, tableExists]);

  return { drivers, driverLocations, error, reload: loadDrivers };
}
