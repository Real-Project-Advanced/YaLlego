'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, BusFront, Gauge, LogOut, UserRound } from 'lucide-react';
import type { UserPayload } from '@/lib/auth';
import { BottomSheet } from '@/modules/user/components/BottomSheet';
import { supabase } from '@/lib/supabase';
import { isMissingSupabaseTableError } from '@/modules/shared/services/localRealtimeFallback';
import { DriverBanner } from './DriverBanner';
import { DriverFabMenu, type DriverSheetKey } from './DriverFabMenu';
import { DriverRouteMap } from './DriverRouteMap';
import { RideRequestCard } from './RideRequestCard';
import { useDriverNotifications } from '../hooks/useDriverNotifications';
import { useDriverTracking } from '../hooks/useDriverTracking';
import { useRideRequests, type RideRequest } from '../hooks/useRideRequests';

export type DriverRoute = {
  origin: string;
  destination: string;
  name: string;
  coordinates: [number, number][];
  distanceKm: number;
};

export type DriverProfile = {
  driverId: number;
  driverCode: string;
  licenseType: string;
  experienceYears: number;
  route: DriverRoute;
  availableRoutes?: DriverRoute[];
  totalAcceptedRequests: number;
};

export type AcceptedPickup = {
  id: string;
  userName: string;
  stopName: string;
  lat: number;
  lng: number;
};

type DriverDashboardProps = {
  profile: DriverProfile;
  user: UserPayload;
};

const fallbackStop = {
  name: 'Parada asignada',
  lat: 6.2442,
  lng: -75.5812,
};
const driverDashboardStorageKey = (driverId: number) => `yallego.driverDashboard.${driverId}`;

const formatKm = (value: number) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value);

const estimateMinutes = (distanceKm: number) => Math.max(1, Math.round((distanceKm / 24) * 60));

const distanceInKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const radiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return radiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

function getStopForRequest(request: RideRequest) {
  return {
    name: request.stop_name || fallbackStop.name,
    lat: request.stop_lat ?? request.user_lat ?? fallbackStop.lat,
    lng: request.stop_lng ?? request.user_lng ?? fallbackStop.lng,
  };
}

export function DriverDashboard({ profile, user }: DriverDashboardProps) {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<DriverSheetKey | null>(null);
  const routes = useMemo(
    () => (profile.availableRoutes?.length ? profile.availableRoutes : [profile.route]),
    [profile.availableRoutes, profile.route],
  );
  const selectedRouteName = profile.route.name;
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [acceptedPickups, setAcceptedPickups] = useState<AcceptedPickup[]>([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [acceptedCount, setAcceptedCount] = useState(profile.totalAcceptedRequests);
  const [trackingDistance, setTrackingDistance] = useState(0);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const selectedRoute = useMemo(
    () => routes.find((route) => route.name === selectedRouteName) ?? routes[0] ?? profile.route,
    [profile.route, routes, selectedRouteName],
  );
  const automaticDistanceKm = trackingDistance || selectedRoute.distanceKm;
  const automaticEstimatedDuration = estimateMinutes(automaticDistanceKm);
  const savedEstimatedDuration = Number(estimatedDuration);
  const routeEstimatedDuration =
    Number.isFinite(savedEstimatedDuration) && savedEstimatedDuration > 0
      ? savedEstimatedDuration
      : automaticEstimatedDuration;

  const tracking = useDriverTracking({
    driverId: profile.driverId,
    driverCode: profile.driverCode,
    routeName: selectedRoute.name,
  });
  const rideRequests = useRideRequests({ driverId: profile.driverId });

  const openRequests = useCallback(() => {
    setActiveSheet('requests');
    setIsFabOpen(false);
  }, []);

  useDriverNotifications({
    conductorId: profile.driverId,
    onOpenRequests: openRequests,
  });

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      try {
        const storedState = window.localStorage.getItem(
          driverDashboardStorageKey(profile.driverId),
        );
        if (!storedState) return;

        const parsed = JSON.parse(storedState) as {
          estimatedDuration?: string;
          acceptedPickups?: AcceptedPickup[];
          acceptedCount?: number;
          trackingDistance?: number;
        };

        setEstimatedDuration(parsed.estimatedDuration ?? '');
        setAcceptedPickups(parsed.acceptedPickups ?? []);
        setAcceptedCount(parsed.acceptedCount ?? profile.totalAcceptedRequests);
        setTrackingDistance(parsed.trackingDistance ?? 0);
      } catch {
        window.localStorage.removeItem(driverDashboardStorageKey(profile.driverId));
      }
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [profile.driverId, profile.totalAcceptedRequests]);

  useEffect(() => {
    window.localStorage.setItem(
      driverDashboardStorageKey(profile.driverId),
      JSON.stringify({
        estimatedDuration,
        acceptedPickups,
        acceptedCount,
        trackingDistance,
      }),
    );
  }, [acceptedCount, acceptedPickups, estimatedDuration, profile.driverId, trackingDistance]);

  useEffect(() => {
    if (!tracking.position) return;

    if (!lastPositionRef.current) {
      lastPositionRef.current = tracking.position;
      return;
    }

    setTrackingDistance(
      (current) => current + distanceInKm(lastPositionRef.current!, tracking.position!),
    );
    lastPositionRef.current = tracking.position;
  }, [tracking.position]);

  useEffect(() => {
    const channel = supabase
      .channel(`driver-completed-pickups-${profile.driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ride_requests',
          filter: `driver_id=eq.${profile.driverId}`,
        },
        (payload) => {
          const nextRequest = payload.new as { id?: string; status?: string };

          if (nextRequest.status === 'completed' && nextRequest.id) {
            setAcceptedPickups((current) =>
              current.filter((pickup) => pickup.id !== nextRequest.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile.driverId]);

  const activeSheetTitle = useMemo(() => {
    if (activeSheet === 'start') return 'Ruta';
    if (activeSheet === 'requests') return 'Solicitudes';
    if (activeSheet === 'data') return 'Datos';
    if (activeSheet === 'profile') return 'Perfil';
    return 'Conductor';
  }, [activeSheet]);

  const handleFabSelect = (sheet: DriverSheetKey) => {
    if (sheet === 'start') {
      setActiveSheet('start');
      setIsFabOpen(false);
      return;
    }

    setActiveSheet(sheet);
    setIsFabOpen(false);
  };

  const openStartSheet = () => {
    setActiveSheet('start');
    setIsFabOpen(false);
  };

  const handleSelectedRouteChange = (routeName: string) => {
    if (routeName !== profile.route.name) return;
  };

  const handleAcceptRequest = async (request: RideRequest) => {
    const didUpdate = await rideRequests.updateRequestStatus(request.id, 'accepted');
    if (!didUpdate) return;

    const stop = getStopForRequest(request);
    setAcceptedPickups((current) => [
      {
        id: request.id,
        userName: request.user_name || `Usuario ${request.user_id ?? ''}`.trim() || 'Usuario',
        stopName: stop.name,
        lat: stop.lat,
        lng: stop.lng,
      },
      ...current.filter((pickup) => pickup.id !== request.id),
    ]);
    setAcceptedCount((current) => current + 1);
  };

  const handleSaveRouteData = async () => {
    setSaveMessage('');

    const { error } = await supabase.from('driver_routes').upsert(
      {
        driver_id: String(profile.driverId),
        driver_code: profile.driverCode,
        route_name: selectedRoute.name,
        estimated_duration: routeEstimatedDuration,
        total_distance: automaticDistanceKm,
        price: 3800,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'driver_id' },
    );

    if (error) {
      if (isMissingSupabaseTableError(`${error.code ?? ''} ${error.message}`)) {
        setSaveMessage('Datos guardados en este dispositivo.');
        return;
      }

      setSaveMessage(error.message);
      return;
    }

    setSaveMessage('Datos guardados.');
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/82 backdrop-blur-2xl">
        <div className="mx-auto flex h-[88px] w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/driver" className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-lg bg-slate-950 text-lg font-black text-white shadow-xl shadow-slate-950/10">
              LY
            </span>
            <div>
              <p className="text-lg font-black leading-5 text-slate-950">LlegoYa</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Controles del conductor">
            {[
              {
                key: 'start' as const,
                label: tracking.isActive ? 'Ruta activa' : 'Iniciar Ruta',
                icon: BusFront,
              },
              { key: 'requests' as const, label: 'Solicitudes', icon: Bell },
              { key: 'data' as const, label: 'Datos', icon: Gauge },
              { key: 'profile' as const, label: 'Perfil', icon: UserRound },
            ].map((item) => {
              const Icon = item.icon;
              const isStart = item.key === 'start';
              const color =
                isStart && tracking.isActive ? '#dc2626' : isStart ? '#047857' : '#1a1a2e';

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => (isStart ? openStartSheet() : setActiveSheet(item.key))}
                  className="relative inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-slate-950/10 transition active:scale-95"
                  style={{ backgroundColor: item.key === 'data' ? '#0369a1' : color }}
                >
                  <Icon size={15} />
                  {item.label}
                  {item.key === 'requests' && rideRequests.pendingRequests.length > 0 && (
                    <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] text-[#dc2626]">
                      {rideRequests.pendingRequests.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <section className="isolate relative min-h-[calc(100vh-88px)] overflow-hidden border-y border-cyan-100 bg-slate-50">
        <div className="absolute inset-0 z-0">
          <DriverRouteMap
            acceptedPickups={acceptedPickups}
            currentPosition={tracking.position}
            driverCode={profile.driverCode}
            isRouteActive={tracking.isActive}
            route={selectedRoute}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(255,255,255,0.28),rgba(255,255,255,0.08)_22%,rgba(255,255,255,0)_48%),linear-gradient(0deg,rgba(8,145,178,0.10),rgba(255,255,255,0)_32%)]" />

        {tracking.isActive && (
          <DriverBanner
            driverCode={profile.driverCode}
            isActive={tracking.isActive}
            routeName={selectedRoute.name}
          />
        )}

        {tracking.error && (
          <div className="absolute left-1/2 top-24 z-[1200] w-[min(calc(100vw-24px),620px)] -translate-x-1/2 rounded-lg border border-red-100 bg-white/95 p-3 text-sm font-bold text-red-700 shadow-xl">
            {tracking.error}
          </div>
        )}

        {!activeSheet && (
          <DriverFabMenu
            activeItem={activeSheet}
            isActiveRoute={tracking.isActive}
            isOpen={isFabOpen}
            pendingRequests={rideRequests.pendingRequests.length}
            onSelect={handleFabSelect}
            onToggle={() => setIsFabOpen((current) => !current)}
          />
        )}

        <BottomSheet
          open={Boolean(activeSheet)}
          title={activeSheetTitle}
          onClose={() => setActiveSheet(null)}
          hideCloseButton
        >
          {activeSheet === 'start' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Estado actual
                </p>
                <p className="mt-2 text-xl font-black text-slate-950">
                  {tracking.isActive ? 'En ruta' : 'En espera'}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{selectedRoute.name}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {`${selectedRoute.origin} -> ${selectedRoute.destination}`}
                </p>
              </div>

              <label className="block rounded-lg border border-slate-200 bg-white p-4">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Ruta del conductor
                </span>
                <select
                  value={selectedRoute.name}
                  onChange={(event) => handleSelectedRouteChange(event.target.value)}
                  disabled
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-[#047857] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {routes.map((route) => (
                    <option key={route.name} value={route.name}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={tracking.toggleTracking}
                className="h-12 w-full rounded-lg text-sm font-black text-white"
                style={{ backgroundColor: tracking.isActive ? '#dc2626' : '#047857' }}
              >
                {tracking.isActive ? 'Detener Ruta' : 'Iniciar Ruta'}
              </button>
            </div>
          )}

          {activeSheet === 'requests' && (
            <div className="space-y-3">
              {rideRequests.error && (
                <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                  {rideRequests.error}
                </p>
              )}
              {rideRequests.pendingRequests.length === 0 && (
                <p className="rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-500">
                  No hay solicitudes pendientes
                </p>
              )}
              {rideRequests.pendingRequests.map((request) => {
                const stop = getStopForRequest(request);
                const distance = tracking.position
                  ? distanceInKm(tracking.position, { lat: stop.lat, lng: stop.lng })
                  : selectedRoute.distanceKm;

                return (
                  <RideRequestCard
                    key={request.id}
                    request={request}
                    nearestStopName={stop.name}
                    distanceKm={distance}
                    etaMinutes={estimateMinutes(distance)}
                    onAccept={() => void handleAcceptRequest(request)}
                    onReject={(requestId) =>
                      void rideRequests.updateRequestStatus(requestId, 'rejected')
                    }
                  />
                );
              })}
            </div>
          )}

          {activeSheet === 'data' && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Tiempo estimado (min)
                </span>
                <input
                  type="number"
                  min="1"
                  value={estimatedDuration}
                  onChange={(event) => setEstimatedDuration(event.target.value)}
                  placeholder={`${automaticEstimatedDuration}`}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-[#0369a1] focus:ring-2 focus:ring-sky-100"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Distancia
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950">
                    {formatKm(automaticDistanceKm)} km
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Paradas
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950">{acceptedPickups.length}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleSaveRouteData()}
                className="h-12 w-full rounded-lg bg-[#0369a1] text-sm font-black text-white"
              >
                Guardar datos
              </button>
              {saveMessage && <p className="text-sm font-bold text-slate-600">{saveMessage}</p>}
            </div>
          )}

          {activeSheet === 'profile' && (
            <div className="space-y-3 text-sm">
              {[
                ['Nombre completo', user.fullname],
                ['Codigo asignado', profile.driverCode],
                ['Ruta elegida', selectedRoute.name],
                ['Tipo de licencia', profile.licenseType],
                ['Años de experiencia', String(profile.experienceYears)],
                ['Solicitudes aceptadas', String(acceptedCount)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 font-black text-slate-950">{value}</p>
                </div>
              ))}
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a2e] text-sm font-black text-white"
                >
                  <LogOut size={17} />
                  Cerrar sesion
                </button>
              </form>
            </div>
          )}
        </BottomSheet>
      </section>
    </main>
  );
}
