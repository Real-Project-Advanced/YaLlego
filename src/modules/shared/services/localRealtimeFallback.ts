'use client';

import type { ActiveDriverLocation } from '@/modules/user/components/UserRouteMapShared';
import type { RideRequest } from '@/modules/driver/hooks/useRideRequests';

const driverLocationsKey = 'yallego.local.driverLocations';
const rideRequestsKey = 'yallego.local.rideRequests';

const isBrowser = () => typeof window !== 'undefined';

export const isMissingSupabaseTableError = (message = '') =>
  /404|PGRST116|PGRST205|schema cache|could not find the table|does not exist|relation .* does not exist/i.test(
    message,
  );

const readJson = <T>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(`yallego:${key}`));
};

export const readLocalDriverLocations = () =>
  readJson<ActiveDriverLocation[]>(driverLocationsKey, []).filter((driver) => driver.driverCode);

export const upsertLocalDriverLocation = (driver: ActiveDriverLocation) => {
  const current = readLocalDriverLocations();
  writeJson(driverLocationsKey, [
    driver,
    ...current.filter((item) => item.driverCode !== driver.driverCode),
  ]);
};

export const deactivateLocalDriverLocation = (driverCode: string) => {
  const nextDrivers = readLocalDriverLocations().filter(
    (driver) => driver.driverCode !== driverCode,
  );
  writeJson(driverLocationsKey, nextDrivers);
};

export const readLocalRideRequests = () => readJson<RideRequest[]>(rideRequestsKey, []);

export const createLocalRideRequest = (request: Omit<RideRequest, 'id'> & { id?: string }) => {
  const nextRequest: RideRequest = {
    ...request,
    id: request.id ?? `local-${Date.now()}`,
  };

  writeJson(rideRequestsKey, [nextRequest, ...readLocalRideRequests()]);
  return nextRequest;
};

export const updateLocalRideRequestStatus = (requestId: string, status: RideRequest['status']) => {
  const nextRequests = readLocalRideRequests().map((request) =>
    request.id === requestId ? { ...request, status } : request,
  );
  writeJson(rideRequestsKey, nextRequests);
};
