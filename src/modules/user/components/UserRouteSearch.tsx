'use client';

import type { FormEvent, PointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  Bot,
  BusFront,
  Clock3,
  Eye,
  Gauge,
  Heart,
  Layers3,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Plus,
  Route,
  Search,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import type { UserPayload } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { BottomSheet } from './BottomSheet';
import { FabMenu, type FabMenuItem } from './FabMenu';
import { UserChatbotPanel } from './UserChatbotPanel';
import { UserRouteMap } from './UserRouteMap';
import { useDriverLocations, type DriverLocation } from '../hooks/useDriverLocations';
import { useRideRequestStatus } from '../hooks/useRideRequestStatus';
import { useSendRideRequest } from '../hooks/useSendRideRequest';
import {
  getStopLogoOption,
  stopLogoOptions,
  type ActiveDriverLocation,
  type Parada,
  type SearchRouteResult,
  type StopLogoId,
} from './UserRouteMapShared';

type UserRouteSearchProps = {
  user: UserPayload;
  visiblePanels: Record<RoutePanelKey, boolean>;
  onTogglePanel: (panel: RoutePanelKey) => void;
};

type GeocodedPlace = {
  name: string;
  lat: number;
  lng: number;
};

type NominatimPlace = {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string | undefined>;
  importance?: number;
};

export type RoutePanelKey = 'search' | 'route' | 'metrics' | 'timeline';

type FloatingPanelKey = RoutePanelKey;
type MobileSheetKey = RoutePanelKey | 'chat' | 'favorites' | 'profile';

const medellinViewbox = '-75.7000,6.3600,-75.4800,6.1500';

const favoriteStorageKey = 'yallego.favoritePlaces';
const publicStopsStorageKey = 'yallego.publicStops';
const favoriteRoutesStorageKey = 'yallego.favoriteRoutes';
const routeSearchStorageKey = (userId: string | number) => `yallego.routeSearch.${userId}`;

const mobileRouteItems: FabMenuItem<MobileSheetKey>[] = [
  { key: 'search', label: 'Buscar', icon: Eye },
  { key: 'route', label: 'Ruta', icon: Navigation },
  { key: 'metrics', label: 'Datos', icon: Gauge },
  { key: 'timeline', label: 'Paradas', icon: Layers3 },
  { key: 'chat', label: 'Chat', icon: Bot },
  { key: 'favorites', label: 'Favoritos', icon: Heart },
  { key: 'profile', label: 'Perfil', icon: UserRound },
];

const routePanelKeys = new Set<RoutePanelKey>(['search', 'route', 'metrics', 'timeline']);

const isRoutePanelKey = (sheet: MobileSheetKey): sheet is RoutePanelKey =>
  routePanelKeys.has(sheet as RoutePanelKey);

type StoredStop = Partial<Parada> & {
  name?: string;
  lat?: number;
  lng?: number;
  detail?: string;
  category?: string;
  logoText?: string;
};

type FavoriteRoute = SearchRouteResult & {
  driverCode?: string;
  routeName?: string;
  savedAt: string;
};

const normalizeStoredStop = (item: StoredStop): Parada | null => {
  const latitud = item.latitud ?? item.lat;
  const longitud = item.longitud ?? item.lng;
  const titulo = item.titulo ?? item.name;
  const descripcion = item.descripcion ?? item.detail;

  if (!item.id || typeof latitud !== 'number' || typeof longitud !== 'number' || !titulo) {
    return null;
  }

  return {
    id: item.id,
    latitud,
    longitud,
    logoId: item.logoId ?? 'home',
    logoUrl: item.logoUrl,
    titulo,
    descripcion: descripcion ?? 'Parada guardada.',
    esFavorito: item.esFavorito ?? true,
    informacionAdicional: item.informacionAdicional ?? item.category,
  };
};

const readStoredFavoriteRoutes = () => {
  if (typeof window === 'undefined') return [];

  const stored = window.localStorage.getItem(favoriteRoutesStorageKey);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as FavoriteRoute[];
  } catch {
    return [];
  }
};

const readStoredFavorites = () => {
  if (typeof window === 'undefined') return [];

  const stored = window.localStorage.getItem(favoriteStorageKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as StoredStop[];
    return parsed.map(normalizeStoredStop).filter((item): item is Parada => Boolean(item));
  } catch {
    return [];
  }
};

const readStoredPublicStops = () => {
  if (typeof window === 'undefined') return [];

  const stored = window.localStorage.getItem(publicStopsStorageKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as StoredStop[];
    return parsed.map(normalizeStoredStop).filter((item): item is Parada => Boolean(item));
  } catch {
    return [];
  }
};

const formatDistance = (distanceKm: number) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(distanceKm);

const formatDuration = (durationMinutes: number) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(durationMinutes);

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

async function getCurrentCoordinates() {
  if (Capacitor.isNativePlatform()) {
    const permissionStatus = await Geolocation.requestPermissions();

    if (permissionStatus.location === 'denied') {
      throw new Error('No pude obtener tu ubicacion. Revisa los permisos del dispositivo.');
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    return position.coords;
  }

  return new Promise<GeolocationCoordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tu navegador no permite usar ubicacion actual.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      () => reject(new Error('No pude obtener tu ubicacion. Revisa los permisos del navegador.')),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

const mergeParadas = (...groups: Parada[][]) => {
  const stops = new Map<string, Parada>();

  groups.flat().forEach((parada) => {
    const current = stops.get(parada.id);
    stops.set(parada.id, {
      ...current,
      ...parada,
      esFavorito: Boolean(current?.esFavorito || parada.esFavorito),
    });
  });

  return Array.from(stops.values()).slice(0, 80);
};

const normalizeAddressQuery = (value: string) =>
  value
    .trim()
    .replace(/\b(cl|cll)\.?\b/gi, 'Calle')
    .replace(/\b(cra|kr|krr|cr)\.?\b/gi, 'Carrera')
    .replace(/\b(av|avda)\.?\b/gi, 'Avenida')
    .replace(/#/g, ' ')
    .replace(
      /\b(interior|int\.?|apto|apartamento|torre|bloque|piso|oficina|of|local|lc)\s*[\w-]+/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim();

const buildPlaceQueries = (value: string) => {
  const normalized = normalizeAddressQuery(value);
  const rawValue = value.trim();
  const baseValue = normalized || rawValue;
  const hasMedellin =
    baseValue.toLowerCase().includes('medellin') || baseValue.toLowerCase().includes('medellín');
  const queries = [
    hasMedellin ? baseValue : `${baseValue}, Medellín, Antioquia, Colombia`,
    rawValue.toLowerCase().includes('medellin') || rawValue.toLowerCase().includes('medellín')
      ? rawValue
      : `${rawValue}, Medellín, Antioquia, Colombia`,
  ];

  return Array.from(new Set(queries.filter(Boolean)));
};

const isMedellinAreaPlace = (place: NominatimPlace) => {
  const haystack = `${place.display_name} ${Object.values(place.address ?? {}).join(' ')}`;

  return /medell[ií]n|antioquia|valle de aburr[aá]|colombia/i.test(haystack);
};

async function geocodePlace(value: string): Promise<GeocodedPlace> {
  let results: NominatimPlace[] = [];

  for (const query of buildPlaceQueries(value)) {
    const params = new URLSearchParams({
      format: 'jsonv2',
      q: query,
      limit: '5',
      countrycodes: 'co',
      viewbox: medellinViewbox,
      bounded: '1',
      addressdetails: '1',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'YaLlego/1.0',
        },
      },
    );
    if (!response.ok) throw new Error('No pude consultar el origen o destino.');

    results = (await response.json()) as NominatimPlace[];
    if (results.length > 0) break;
  }

  const medellinResults = results.filter(
    (result) =>
      result.display_name.toLowerCase().includes('medellín') ||
      result.display_name.toLowerCase().includes('medellin') ||
      result.display_name.toLowerCase().includes('antioquia') ||
      isMedellinAreaPlace(result),
  );

  const place = medellinResults[0] ?? results[0];

  if (!place) throw new Error(`No encontre "${value}" dentro de Medellin.`);

  return {
    name: place.display_name.split(',').slice(0, 3).join(', '),
    lat: Number(place.lat),
    lng: Number(place.lon),
  };
}

const buildReadableAddress = (result: {
  display_name?: string;
  address?: Record<string, string | undefined>;
}) => {
  const address = result.address ?? {};
  const road = address.road ?? address.pedestrian ?? address.footway ?? address.path;
  const houseNumber = address.house_number;
  const neighborhood =
    address.neighbourhood ?? address.suburb ?? address.quarter ?? address.city_district;
  const city = address.city ?? address.town ?? address.municipality;

  const street = [road, houseNumber].filter(Boolean).join(' ');
  const parts = [street, neighborhood, city].filter(Boolean);

  if (parts.length > 0) return parts.join(', ');
  if (result.display_name) return result.display_name.split(',').slice(0, 3).join(', ');

  return 'Mi ubicacion actual';
};

async function reverseGeocodeCoordinates(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    zoom: '18',
    addressdetails: '1',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
  if (!response.ok) throw new Error('No pude convertir tu ubicacion en direccion.');

  const result = (await response.json()) as {
    display_name?: string;
    address?: Record<string, string | undefined>;
  };

  return buildReadableAddress(result);
}

async function calculateRoute(origin: GeocodedPlace, destination: GeocodedPlace) {
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    alternatives: 'false',
    steps: 'false',
  });

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?${params.toString()}`,
  );
  if (!response.ok) throw new Error('No pude calcular una ruta entre esos puntos.');

  const data = (await response.json()) as {
    routes?: Array<{
      distance: number;
      duration: number;
      geometry: {
        coordinates: [number, number][];
      };
    }>;
  };

  const route = data.routes?.[0];
  if (!route) throw new Error('No encontre una ruta disponible para ese trayecto.');

  return {
    distance: route.distance / 1000,
    duration: route.duration / 60,
    coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
  };
}

function StopLogoPicker({
  value,
  onChange,
}: {
  value: StopLogoId;
  onChange: (logoId: StopLogoId) => void;
}) {
  return (
    <div className="rounded-lg border border-cyan-100 bg-cyan-50/50 p-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Logo</p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {stopLogoOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`grid h-14 min-w-0 place-items-center rounded-lg border text-slate-950 shadow-sm transition ${
                isSelected
                  ? 'border-slate-950 bg-white ring-2 ring-cyan-300'
                  : 'border-white/80 bg-white/70 hover:border-cyan-300 hover:bg-white'
              }`}
              aria-label={`Usar logo ${option.label}`}
              title={option.label}
            >
              <span
                className="grid size-10 place-items-center rounded-full ring-1 ring-white/80"
                style={{ backgroundColor: option.color }}
              >
                <Icon size={20} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function UserRouteSearch({ user, visiblePanels, onTogglePanel }: UserRouteSearchProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [currentOriginPlace, setCurrentOriginPlace] = useState<GeocodedPlace | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState<SearchRouteResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<ActiveDriverLocation | null>(null);
  const [favoriteRoutes, setFavoriteRoutes] = useState<FavoriteRoute[]>([]);
  const [requestStatus, setRequestStatus] = useState('');
  const [currentRideRequestId, setCurrentRideRequestId] = useState<string | null>(null);
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [newStop, setNewStop] = useState({
    titulo: '',
    descripcion: '',
    logoId: 'home' as StopLogoId,
    informacionAdicional: '',
    direccion: '',
  });
  const [isCreatingStop, setIsCreatingStop] = useState(false);
  const [isLocatingStop, setIsLocatingStop] = useState(false);
  const [routingStopId, setRoutingStopId] = useState('');
  const [isMobileFabOpen, setIsMobileFabOpen] = useState(false);
  const [activeMobileSheet, setActiveMobileSheet] = useState<MobileSheetKey | null>(null);
  const [draggedPanel, setDraggedPanel] = useState<FloatingPanelKey | null>(null);
  const [panelOffsets, setPanelOffsets] = useState<
    Record<FloatingPanelKey, { x: number; y: number }>
  >({
    search: { x: 0, y: 0 },
    route: { x: 0, y: 0 },
    metrics: { x: 0, y: 0 },
    timeline: { x: 0, y: 0 },
  });
  const routedFavoriteIdRef = useRef('');
  const searchParams = useSearchParams();
  const favoriteToRouteId = searchParams.get('favorite');
  const favoriteRouteName = searchParams.get('favoriteRoute');
  const driverLocations = useDriverLocations();
  const sendRideRequest = useSendRideRequest();
  const rideRequestStatus = useRideRequestStatus(currentRideRequestId);

  const favoriteStops = useMemo(() => paradas.filter((parada) => parada.esFavorito), [paradas]);
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];
  const nearbyDrivers = useMemo(() => {
    if (!selectedRoute) return driverLocations.drivers;

    return [...driverLocations.drivers]
      .filter((driver) => !favoriteRouteName || driver.routeName === favoriteRouteName)
      .map((driver) => ({
        ...driver,
        distanceFromOrigin: distanceInKm(selectedRoute.startPoint, {
          lat: driver.lat,
          lng: driver.lng,
        }),
      }))
      .filter((driver) => driver.distanceFromOrigin <= 18)
      .sort((a, b) => a.distanceFromOrigin - b.distanceFromOrigin)
      .map(({ distanceFromOrigin: _distanceFromOrigin, ...driver }) => ({
        ...driver,
        isHighlighted: true,
      }));
  }, [driverLocations.drivers, favoriteRouteName, selectedRoute]);
  const routeStopsNearDriverRoute = useMemo(() => {
    if (!selectedRoute || !selectedDriver) return [];

    return paradas.filter((parada) => {
      const point = { lat: parada.latitud, lng: parada.longitud };
      return selectedRoute.coordinates.some(
        ([lat, lng]) => distanceInKm(point, { lat, lng }) <= 0.8,
      );
    });
  }, [paradas, selectedDriver, selectedRoute]);
  const nearestStopToOrigin = useMemo(() => {
    if (!selectedRoute || routeStopsNearDriverRoute.length === 0) return null;

    return [...routeStopsNearDriverRoute].sort(
      (a, b) =>
        distanceInKm(selectedRoute.startPoint, { lat: a.latitud, lng: a.longitud }) -
        distanceInKm(selectedRoute.startPoint, { lat: b.latitud, lng: b.longitud }),
    )[0];
  }, [routeStopsNearDriverRoute, selectedRoute]);
  const selectedDriverDuration = selectedDriver?.estimatedDuration ?? selectedRoute?.duration ?? 0;
  const selectedDriverDistance = selectedDriver?.totalDistance ?? selectedRoute?.distance ?? 0;
  const handlePanelDragStart = (panel: FloatingPanelKey, event: PointerEvent<HTMLElement>) => {
    setDraggedPanel(panel);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePanelDragMove = (panel: FloatingPanelKey, event: PointerEvent<HTMLElement>) => {
    if (draggedPanel !== panel) return;

    setPanelOffsets((current) => ({
      ...current,
      [panel]: {
        x: current[panel].x + event.movementX,
        y: current[panel].y + event.movementY,
      },
    }));
  };

  const handlePanelDragEnd = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDraggedPanel(null);
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setParadas(mergeParadas(readStoredPublicStops(), readStoredFavorites()));
      setFavoriteRoutes(readStoredFavoriteRoutes());

      try {
        const storedSearch = window.localStorage.getItem(routeSearchStorageKey(user.id));
        if (!storedSearch) return;

        const parsed = JSON.parse(storedSearch) as {
          origin?: string;
          destination?: string;
          currentOriginPlace?: GeocodedPlace | null;
          routes?: SearchRouteResult[];
          selectedRouteId?: string;
          currentRideRequestId?: string | null;
        };

        setOrigin(parsed.origin ?? '');
        setDestination(parsed.destination ?? '');
        setCurrentOriginPlace(parsed.currentOriginPlace ?? null);
        setRoutes(parsed.routes ?? []);
        setSelectedRouteId(parsed.selectedRouteId ?? parsed.routes?.[0]?.id ?? '');
        setCurrentRideRequestId(parsed.currentRideRequestId ?? null);
      } catch {
        window.localStorage.removeItem(routeSearchStorageKey(user.id));
      }
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [user.id]);

  useEffect(() => {
    window.localStorage.setItem(
      routeSearchStorageKey(user.id),
      JSON.stringify({
        origin,
        destination,
        currentOriginPlace,
        routes,
        selectedRouteId,
        currentRideRequestId,
      }),
    );
  }, [
    currentOriginPlace,
    currentRideRequestId,
    destination,
    origin,
    routes,
    selectedRouteId,
    user.id,
  ]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    const closeMobileUiOnDesktop = () => {
      if (!desktopQuery.matches) return;
      setActiveMobileSheet(null);
      setIsMobileFabOpen(false);
    };

    closeMobileUiOnDesktop();
    desktopQuery.addEventListener('change', closeMobileUiOnDesktop);

    return () => desktopQuery.removeEventListener('change', closeMobileUiOnDesktop);
  }, []);

  const saveFavorites = (nextStops: Parada[]) => {
    setParadas(nextStops);
    window.localStorage.setItem(
      favoriteStorageKey,
      JSON.stringify(nextStops.filter((parada) => parada.esFavorito)),
    );
    window.dispatchEvent(new CustomEvent('yallego:favorites-updated'));
  };

  const savePublicStops = (nextPublicStops: Parada[]) => {
    const favoriteStops = readStoredFavorites();
    const mergedStops = mergeParadas(nextPublicStops, favoriteStops);

    setParadas(mergedStops);
    window.localStorage.setItem(publicStopsStorageKey, JSON.stringify(nextPublicStops));
    window.dispatchEvent(new CustomEvent('yallego:public-stops-updated'));
  };

  const toggleFavoriteParada = (parada: Parada) => {
    const exists = paradas.some((item) => item.id === parada.id);
    const nextParada = { ...parada, esFavorito: !parada.esFavorito };
    const nextStops = exists
      ? paradas.map((item) => (item.id === parada.id ? nextParada : item))
      : [nextParada, ...paradas].slice(0, 30);

    saveFavorites(nextStops);
  };

  const handleCreatePublicStop = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanTitle = newStop.titulo.trim();
    const cleanDescription = newStop.descripcion.trim();
    const cleanAddress = newStop.direccion.trim();

    if (!cleanTitle || !cleanDescription || !cleanAddress) {
      setError('Completa titulo, descripcion y direccion para crear la parada.');
      return;
    }

    setError('');
    setIsCreatingStop(true);

    try {
      const place = await geocodePlace(cleanAddress);
      const addressDetail =
        cleanAddress.toLowerCase() === place.name.toLowerCase()
          ? `Direccion: ${place.name}`
          : `Direccion: ${cleanAddress} | Ubicacion: ${place.name}`;
      const publicStop: Parada = {
        id: `public-${Date.now()}`,
        latitud: place.lat,
        longitud: place.lng,
        logoId: newStop.logoId,
        titulo: cleanTitle,
        descripcion: cleanDescription,
        esFavorito: false,
        informacionAdicional: newStop.informacionAdicional.trim() || addressDetail,
      };

      const nextPublicStops = [publicStop, ...readStoredPublicStops()].slice(0, 80);
      savePublicStops(nextPublicStops);
      setNewStop({
        titulo: '',
        descripcion: '',
        logoId: 'home',
        informacionAdicional: '',
        direccion: '',
      });
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'No pude encontrar esa direccion en Medellin.',
      );
    } finally {
      setIsCreatingStop(false);
    }
  };

  const removePublicStop = (stopId: string) => {
    const nextPublicStops = readStoredPublicStops().filter((parada) => parada.id !== stopId);
    const nextFavoriteStops = readStoredFavorites().filter((parada) => parada.id !== stopId);

    window.localStorage.setItem(favoriteStorageKey, JSON.stringify(nextFavoriteStops));
    savePublicStops(nextPublicStops);
    window.dispatchEvent(new CustomEvent('yallego:favorites-updated'));
  };

  useEffect(() => {
    const status = rideRequestStatus.request?.status;

    if (status !== 'completed') return;

    const completeTimer = window.setTimeout(() => {
      setRequestStatus('');
      setCurrentRideRequestId(null);
    }, 0);

    return () => window.clearTimeout(completeTimer);
  }, [rideRequestStatus.request?.status]);

  const saveFavoriteRoute = async (driver = selectedDriver) => {
    if (!selectedRoute) return;

    const favoriteRoute: FavoriteRoute = {
      ...selectedRoute,
      driverCode: driver?.driverCode,
      routeName: driver?.routeName,
      savedAt: new Date().toISOString(),
    };
    const nextFavoriteRoutes = [
      favoriteRoute,
      ...favoriteRoutes.filter(
        (route) =>
          route.startPoint.name !== selectedRoute.startPoint.name ||
          route.endPoint.name !== selectedRoute.endPoint.name ||
          route.driverCode !== driver?.driverCode,
      ),
    ].slice(0, 20);

    setFavoriteRoutes(nextFavoriteRoutes);
    window.localStorage.setItem(favoriteRoutesStorageKey, JSON.stringify(nextFavoriteRoutes));
    window.dispatchEvent(new CustomEvent('yallego:favorite-routes-updated'));

    if (driver) {
      await supabase.from('user_favorite_routes').insert({
        user_id: String(user.id),
        route_name: driver.routeName,
        driver_code: driver.driverCode,
        price: 3800,
        created_at: new Date().toISOString(),
      });
    }
  };

  const selectNearbyDriver = (driver: ActiveDriverLocation) => {
    setSelectedDriver(driver);
    setRequestStatus('');
    setCurrentRideRequestId(null);
    setSelectedRouteId(selectedRoute?.id ?? routes[0]?.id ?? '');
  };

  const requestSelectedBus = async (driver = selectedDriver) => {
    if (!selectedRoute || !driver) {
      setRequestStatus('Primero elige un bus cercano.');
      return;
    }

    const requestId = await sendRideRequest.sendRideRequest({
      driver,
      nearestStop: nearestStopToOrigin,
      route: selectedRoute,
      user,
    });

    if (requestId) {
      setSelectedDriver(driver);
      setCurrentRideRequestId(requestId);
    }

    setRequestStatus(
      requestId
        ? `Solicitud enviada a ${driver.driverCode}. Espera la respuesta del conductor.`
        : sendRideRequest.error || 'No pude enviar la solicitud.',
    );
  };

  const toActiveDriverLocation = (driver: DriverLocation): ActiveDriverLocation => ({
    driverCode: driver.driver_code,
    driverId: Number(driver.driver_id) || null,
    routeName: driver.route_name,
    lat: driver.lat,
    lng: driver.lng,
    price: 3800,
  });

  const handleSendRideRequest = async (driver: DriverLocation) => {
    await requestSelectedBus(toActiveDriverLocation(driver));
  };

  const handleSaveFavorite = async (driver: DriverLocation) => {
    await saveFavoriteRoute(toActiveDriverLocation(driver));
  };

  const getCurrentLocationPlace = useCallback(async () => {
    const coords = await getCurrentCoordinates();
    const address = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);

    return {
      name: address,
      lat: coords.latitude,
      lng: coords.longitude,
    };
  }, []);

  const routeFromCurrentLocationToStop = useCallback(
    async (parada: Parada) => {
      setError('');
      setRoutingStopId(parada.id);

      try {
        const originPlace = await getCurrentLocationPlace();
        const destinationPlace = {
          name: parada.titulo,
          lat: parada.latitud,
          lng: parada.longitud,
        };
        const route = await calculateRoute(originPlace, destinationPlace);
        const nextRoute: SearchRouteResult = {
          id: `current-${parada.id}-${Date.now()}`,
          name: `${originPlace.name} -> ${parada.titulo}`,
          startPoint: originPlace,
          endPoint: destinationPlace,
          distance: route.distance,
          duration: route.duration,
          coordinates: route.coordinates,
        };

        setOrigin(originPlace.name);
        setCurrentOriginPlace(originPlace);
        setDestination(parada.titulo);
        setRoutes([nextRoute]);
        setSelectedRouteId(nextRoute.id);
        setParadas((currentStops) => mergeParadas([parada], currentStops));
      } catch (routeError) {
        setError(routeError instanceof Error ? routeError.message : 'No pude calcular esa ruta.');
      } finally {
        setRoutingStopId('');
      }
    },
    [getCurrentLocationPlace],
  );

  useEffect(() => {
    if (!favoriteToRouteId || routedFavoriteIdRef.current === favoriteToRouteId) return;

    const favorite = readStoredFavorites().find((item) => item.id === favoriteToRouteId);

    if (!favorite) return;

    routedFavoriteIdRef.current = favoriteToRouteId;
    const routeTimer = window.setTimeout(() => {
      void routeFromCurrentLocationToStop(favorite);
    }, 0);

    return () => window.clearTimeout(routeTimer);
  }, [favoriteToRouteId, routeFromCurrentLocationToStop]);

  const useCurrentLocation = async () => {
    setError('');
    setIsLocating(true);

    try {
      const place = await getCurrentLocationPlace();
      setCurrentOriginPlace(place);
      setOrigin(place.name);
    } catch {
      setError('No pude obtener tu ubicacion. Puedes escribir una direccion manualmente.');
    } finally {
      setIsLocating(false);
    }
  };

  const useCurrentLocationForStop = async () => {
    setError('');
    setIsLocatingStop(true);

    try {
      const place = await getCurrentLocationPlace();
      setNewStop((current) => ({
        ...current,
        direccion: place.name,
        informacionAdicional: current.informacionAdicional || 'Direccion obtenida automaticamente',
      }));
    } catch {
      setError('No pude obtener la direccion automatica para la parada.');
    } finally {
      setIsLocatingStop(false);
    }
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanOrigin = origin.trim();
    const cleanDestination = destination.trim();

    if (!cleanOrigin || !cleanDestination) {
      setError('Escribe origen y destino para buscar una ruta.');
      return;
    }

    setError('');
    setIsSearching(true);

    try {
      const originPlacePromise =
        currentOriginPlace && cleanOrigin === currentOriginPlace.name
          ? Promise.resolve(currentOriginPlace)
          : geocodePlace(cleanOrigin);

      const [originPlace, destinationPlace] = await Promise.all([
        originPlacePromise,
        geocodePlace(cleanDestination),
      ]);
      const route = await calculateRoute(originPlace, destinationPlace);
      const nextRoute: SearchRouteResult = {
        id: `${Date.now()}`,
        name: `${originPlace.name} -> ${destinationPlace.name}`,
        startPoint: originPlace,
        endPoint: destinationPlace,
        distance: route.distance,
        duration: route.duration,
        coordinates: route.coordinates,
      };

      setRoutes([nextRoute]);
      setSelectedRouteId(nextRoute.id);
      setSelectedDriver(null);
      setRequestStatus('');
    } catch (searchError) {
      setRoutes([]);
      setSelectedRouteId('');
      setSelectedDriver(null);
      setError(searchError instanceof Error ? searchError.message : 'No pude buscar esa ruta.');
    } finally {
      setIsSearching(false);
    }
  };

  const openMobileSheet = (sheet: MobileSheetKey) => {
    if (isRoutePanelKey(sheet) && !visiblePanels[sheet]) {
      onTogglePanel(sheet);
    }

    setActiveMobileSheet(sheet);
    setIsMobileFabOpen(false);
  };

  const closeMobileSheet = () => {
    setActiveMobileSheet(null);
  };

  const mobileSheetTitle =
    mobileRouteItems.find((item) => item.key === activeMobileSheet)?.label ?? 'YaLlego';
  const displayRequestStatus =
    rideRequestStatus.request?.status === 'accepted'
      ? 'Tu bus viene 🚌'
      : rideRequestStatus.request?.status === 'rejected'
        ? 'Bus no disponible'
        : requestStatus;

  return (
    <section
      id="rutas"
      className="isolate relative min-h-[calc(100vh-88px)] overflow-hidden border-y border-cyan-100 bg-slate-50"
    >
      <div className="absolute inset-0 z-0">
        <UserRouteMap
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          paradas={paradas}
          onToggleFavoriteParada={toggleFavoriteParada}
          onRouteFromCurrentLocation={routeFromCurrentLocationToStop}
          activeDrivers={nearbyDrivers}
          onSelectDriver={selectNearbyDriver}
          onRequestDriver={(driver) => void requestSelectedBus(driver)}
          onFavoriteDriverRoute={(driver) => void saveFavoriteRoute(driver)}
          driverLocations={driverLocations.driverLocations}
          onSendRideRequest={(driver) => void handleSendRideRequest(driver)}
          onSaveFavorite={(driver) => void handleSaveFavorite(driver)}
          requestedDriverCode={currentRideRequestId ? selectedDriver?.driverCode : undefined}
          isSendingRequest={sendRideRequest.isSending}
          routingStopId={routingStopId}
          selectedDriverCode={selectedDriver?.driverCode}
          showRouteLines={routes.length > 0}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(255,255,255,0.28),rgba(255,255,255,0.08)_22%,rgba(255,255,255,0)_48%),linear-gradient(0deg,rgba(8,145,178,0.10),rgba(255,255,255,0)_32%)]" />

      {visiblePanels.search && (
        <aside
          className="absolute left-0 top-16 z-[1100] hidden max-h-[calc(100%-64px)] w-[min(410px,calc(100vw-24px))] flex-col rounded-r-lg border border-l-0 border-cyan-100 bg-white/92 p-4 shadow-2xl shadow-cyan-950/15 backdrop-blur-2xl md:flex lg:top-24"
          style={{
            transform: `translate(${panelOffsets.search.x}px, ${panelOffsets.search.y}px)`,
          }}
        >
          <div
            className="flex cursor-grab touch-none items-start justify-between gap-3 active:cursor-grabbing"
            onPointerDown={(event) => handlePanelDragStart('search', event)}
            onPointerMove={(event) => handlePanelDragMove('search', event)}
            onPointerUp={handlePanelDragEnd}
            onPointerCancel={handlePanelDragEnd}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-700">
                Busqueda de rutas
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">
                Elige tu trayecto
              </h2>
            </div>
          </div>

          {driverLocations.error && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">
              {driverLocations.error}
            </p>
          )}

          <form onSubmit={handleSearch} className="mt-4">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="space-y-2">
                <label className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-700 shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
                  <span className="size-3 rounded-full bg-cyan-500" />
                  <input
                    value={origin}
                    onChange={(event) => {
                      setCurrentOriginPlace(null);
                      setOrigin(event.target.value);
                    }}
                    placeholder="Origen o mi ubicacion"
                    className="w-full bg-transparent text-sm font-black text-slate-900 outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
                    aria-label="Usar mi ubicacion actual"
                  >
                    {isLocating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <LocateFixed size={16} />
                    )}
                  </button>
                </label>
                <label className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-700 shadow-sm focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100">
                  <span className="size-3 rounded-full bg-rose-500" />
                  <input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="Destino"
                    className="w-full bg-transparent text-sm font-black text-slate-900 outline-none placeholder:text-slate-500"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handleSwap}
                className="mt-8 grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700"
                aria-label="Invertir origen y destino"
              >
                <ArrowUpDown size={18} />
              </button>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSearching ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
              {isSearching ? 'Buscando ruta' : 'Buscar rutas'}
            </button>
          </form>

          {error && (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
              Resultado
            </p>
            {favoriteStops.length > 0 && (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black text-rose-700">
                {favoriteStops.length} favoritos
              </span>
            )}
          </div>

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {!selectedRoute && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                Busca un origen y un destino para calcular una ruta real sobre el mapa.
              </div>
            )}

            {selectedRoute && (
              <button
                type="button"
                onClick={() => setSelectedRouteId(selectedRoute.id)}
                className="w-full rounded-lg border border-cyan-400 bg-white p-3 text-left shadow-lg shadow-cyan-200/30 transition hover:border-cyan-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-slate-950">
                      {selectedRoute.startPoint.name}
                    </h3>
                    <p className="mt-1 truncate text-xs font-bold text-slate-500">
                      hacia {selectedRoute.endPoint.name}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-black text-cyan-700">
                    {formatDuration(selectedRoute.duration)} min
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold text-slate-600">
                  <span className="rounded-lg bg-slate-50 p-3">
                    <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                      <Route size={14} />
                      Distancia
                    </span>
                    <span className="mt-2 block text-base font-black text-slate-950">
                      {formatDistance(selectedRoute.distance)} km
                    </span>
                  </span>
                  <span className="rounded-lg bg-slate-50 p-3">
                    <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                      <Clock3 size={14} />
                      Tiempo
                    </span>
                    <span className="mt-2 block text-base font-black text-slate-950">
                      {formatDuration(selectedRoute.duration)} min
                    </span>
                  </span>
                </div>
              </button>
            )}
            {paradas.length > 0 && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                {paradas.length} paradas cargadas en el mapa.
              </div>
            )}
          </div>
        </aside>
      )}

      {visiblePanels.route && (
        <aside
          className="absolute right-4 top-24 z-[1100] hidden w-[min(340px,calc(100vw-32px))] rounded-lg border border-cyan-100 bg-white/90 p-4 shadow-2xl shadow-cyan-950/15 backdrop-blur-2xl md:block md:right-6 lg:top-28 xl:right-[470px]"
          style={{
            transform: `translate(${panelOffsets.route.x}px, ${panelOffsets.route.y}px)`,
          }}
        >
          <div
            className="flex cursor-grab touch-none items-center justify-between gap-4 active:cursor-grabbing"
            onPointerDown={(event) => handlePanelDragStart('route', event)}
            onPointerMove={(event) => handlePanelDragMove('route', event)}
            onPointerUp={handlePanelDragEnd}
            onPointerCancel={handlePanelDragEnd}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
                Ruta activa
              </p>
              <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">
                {selectedRoute?.name ?? 'Sin ruta seleccionada'}
              </h3>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
              <Navigation size={20} />
            </span>
          </div>
          {selectedRoute ? (
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-cyan-700" />
                <span>{selectedRoute.startPoint.name}</span>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <Route size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                <span>{selectedRoute.endPoint.name}</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Bus cercano
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {selectedDriver
                    ? `${selectedDriver.driverCode} - ${selectedDriver.routeName}`
                    : nearbyDrivers.length > 0
                      ? 'Toca un bus en el mapa'
                      : 'No hay buses activos cerca'}
                </p>
                {nearestStopToOrigin && (
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Parada: {nearestStopToOrigin.titulo}
                  </p>
                )}
                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${
                    selectedDriver
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedDriver ? 'En ruta' : 'Fuera de servicio'}
                </span>
                <button
                  type="button"
                  onClick={() => void requestSelectedBus()}
                  disabled={
                    !selectedDriver || sendRideRequest.isSending || Boolean(currentRideRequestId)
                  }
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <BusFront size={17} />
                  {currentRideRequestId
                    ? 'Solicitud enviada ✓'
                    : sendRideRequest.isSending
                      ? 'Enviando'
                      : 'Solicitar bus'}
                </button>
                {displayRequestStatus && (
                  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-600">
                    {displayRequestStatus}
                  </p>
                )}
                {rideRequestStatus.request?.status === 'accepted' && (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800">
                    <p className="text-sm font-black">Tu bus viene 🚌</p>
                    <p className="mt-1">
                      Espera en{' '}
                      {rideRequestStatus.request.stop_name ??
                        rideRequestStatus.request.nearest_stop ??
                        nearestStopToOrigin?.titulo ??
                        'la parada mas cercana'}
                      .
                    </p>
                    <p className="mt-1">ETA: ~{formatDuration(selectedDriverDuration || 8)} min</p>
                    <button
                      type="button"
                      onClick={() => void rideRequestStatus.completeRequest()}
                      className="mt-3 h-10 w-full rounded-lg bg-emerald-600 text-xs font-black text-white"
                    >
                      Ya subi al bus
                    </button>
                  </div>
                )}
                {rideRequestStatus.request?.status === 'rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRideRequestId(null);
                      setRequestStatus('');
                      setSelectedDriver(null);
                    }}
                    className="mt-3 h-10 w-full rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-800"
                  >
                    Buscar otro bus
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
              Busca una ruta o toca Como llegar en una parada para ver el trayecto aqui.
            </div>
          )}
        </aside>
      )}

      {visiblePanels.metrics && (
        <aside
          className="absolute bottom-5 left-1/2 z-[1100] hidden w-[min(320px,calc(100vw-32px))] rounded-lg border border-cyan-100 bg-white/90 p-4 text-center shadow-2xl shadow-cyan-950/15 backdrop-blur-2xl md:block lg:bottom-6"
          style={{
            transform: `translate(calc(-50% + ${panelOffsets.metrics.x}px), ${panelOffsets.metrics.y}px)`,
          }}
        >
          <div
            className="mb-3 flex cursor-grab touch-none items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 active:cursor-grabbing"
            onPointerDown={(event) => handlePanelDragStart('metrics', event)}
            onPointerMove={(event) => handlePanelDragMove('metrics', event)}
            onPointerUp={handlePanelDragEnd}
            onPointerCancel={handlePanelDragEnd}
          >
            <Gauge size={14} />
            Datos
          </div>
          <div className="grid gap-3">
            {[
              {
                label: 'Distancia',
                value: selectedRoute ? `${formatDistance(selectedDriverDistance)} km` : '0 km',
                icon: Gauge,
              },
              {
                label: 'Duracion',
                value: selectedRoute ? `${formatDuration(selectedDriverDuration)} min` : '0 min',
                icon: Clock3,
              },
              {
                label: 'Paradas',
                value: `${routeStopsNearDriverRoute.length || paradas.length}`,
                icon: Sparkles,
              },
              { label: 'Precio', value: '$3.800', icon: BusFront },
            ].map((metric) => {
              const Icon = metric.icon;

              return (
                <div key={metric.label} className="rounded-lg bg-white">
                  <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <Icon size={14} />
                    {metric.label}
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-950">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {visiblePanels.timeline && (
        <aside
          className="absolute bottom-4 left-4 z-[1100] hidden max-h-[calc(100%-120px)] w-[min(420px,calc(100vw-32px))] overflow-y-auto rounded-lg border border-cyan-100 bg-white/92 p-4 shadow-2xl shadow-cyan-950/15 backdrop-blur-2xl md:block md:left-6 lg:bottom-6"
          style={{
            transform: `translate(${panelOffsets.timeline.x}px, ${panelOffsets.timeline.y}px)`,
          }}
        >
          <div
            className="flex cursor-grab touch-none items-center justify-between gap-3 active:cursor-grabbing"
            onPointerDown={(event) => handlePanelDragStart('timeline', event)}
            onPointerMove={(event) => handlePanelDragMove('timeline', event)}
            onPointerUp={handlePanelDragEnd}
            onPointerCancel={handlePanelDragEnd}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
                Paradas
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">Sitios publicos</h3>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
              <MapPin size={18} />
            </span>
          </div>

          <form onSubmit={handleCreatePublicStop} className="mt-4 space-y-3">
            <input
              value={newStop.titulo}
              onChange={(event) =>
                setNewStop((current) => ({ ...current, titulo: event.target.value }))
              }
              placeholder="Titulo del sitio"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
            <textarea
              value={newStop.descripcion}
              onChange={(event) =>
                setNewStop((current) => ({ ...current, descripcion: event.target.value }))
              }
              placeholder="Descripcion"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
            <StopLogoPicker
              value={newStop.logoId}
              onChange={(logoId) => setNewStop((current) => ({ ...current, logoId }))}
            />
            <input
              value={newStop.informacionAdicional}
              onChange={(event) =>
                setNewStop((current) => ({
                  ...current,
                  informacionAdicional: event.target.value,
                }))
              }
              placeholder="Informacion adicional"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
            <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
              <input
                value={newStop.direccion}
                onChange={(event) =>
                  setNewStop((current) => ({ ...current, direccion: event.target.value }))
                }
                placeholder="Direccion exacta del sitio"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={useCurrentLocationForStop}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-cyan-700 transition hover:bg-cyan-50"
                aria-label="Obtener direccion automatica"
                title="Obtener direccion automatica"
              >
                {isLocatingStop ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LocateFixed size={16} />
                )}
              </button>
            </label>
            <button
              type="submit"
              disabled={isCreatingStop}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-cyan-700 disabled:cursor-wait disabled:bg-slate-400"
            >
              {isCreatingStop ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
              {isCreatingStop ? 'Buscando direccion' : 'Crear parada publica'}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              {paradas.length} sitios en mapa
            </p>
            {paradas.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                Crea tu primer sitio publico para verlo fijo en el mapa.
              </div>
            ) : (
              paradas.map((parada) => (
                <div
                  key={parada.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-cyan-100 text-xs font-black text-slate-950 ring-1 ring-cyan-200">
                    {(() => {
                      const option = getStopLogoOption(parada.logoId);
                      const Icon = option.icon;

                      return (
                        <span
                          className="grid h-full w-full place-items-center"
                          style={{ backgroundColor: option.color }}
                        >
                          <Icon size={18} />
                        </span>
                      );
                    })()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-950">{parada.titulo}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                      {parada.descripcion}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePublicStop(parada.id)}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Eliminar ${parada.titulo}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {selectedRoute && (
            <div className="mt-5 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Paradas de tu ruta
              </p>
              <div className="mt-3 space-y-2">
                {routeStopsNearDriverRoute.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-500">
                    Toca un bus para ver las paradas que coinciden con su ruta.
                  </p>
                ) : (
                  routeStopsNearDriverRoute.map((parada) => (
                    <div
                      key={parada.id}
                      className="flex items-center gap-3 rounded-lg bg-white p-2"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                        🚌
                      </span>
                      <p className="min-w-0 truncate text-sm font-black text-slate-700">
                        {parada.titulo}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedRoute && (
            <div className="mt-5 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Trayecto activo
              </p>
              <div className="mt-3 space-y-2">
                {[selectedRoute.startPoint.name, selectedRoute.endPoint.name].map((stop, index) => (
                  <div key={stop} className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white text-xs font-black text-cyan-700 ring-1 ring-cyan-100">
                      {index + 1}
                    </span>
                    <p className="min-w-0 truncate text-sm font-black text-slate-700">{stop}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      {!activeMobileSheet && (
        <FabMenu
          items={mobileRouteItems}
          isOpen={isMobileFabOpen}
          activeItem={activeMobileSheet}
          onToggle={() => setIsMobileFabOpen((current) => !current)}
          onSelect={openMobileSheet}
        />
      )}

      <BottomSheet
        open={Boolean(activeMobileSheet)}
        title={mobileSheetTitle}
        onClose={closeMobileSheet}
      >
        {activeMobileSheet === 'search' && (
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-700 shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
                <span className="size-3 rounded-full bg-cyan-500" />
                <input
                  value={origin}
                  onChange={(event) => {
                    setCurrentOriginPlace(null);
                    setOrigin(event.target.value);
                  }}
                  placeholder="Origen o mi ubicacion"
                  className="w-full bg-transparent text-sm font-black text-slate-900 outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
                  aria-label="Usar mi ubicacion actual"
                >
                  {isLocating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LocateFixed size={16} />
                  )}
                </button>
              </label>

              <label className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-700 shadow-sm focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100">
                <span className="size-3 rounded-full bg-rose-500" />
                <input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Destino"
                  className="w-full bg-transparent text-sm font-black text-slate-900 outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleSwap}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
                  aria-label="Invertir origen y destino"
                >
                  <ArrowUpDown size={16} />
                </button>
              </label>

              <button
                type="submit"
                disabled={isSearching}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSearching ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Search size={17} />
                )}
                {isSearching ? 'Buscando ruta' : 'Buscar rutas'}
              </button>
            </form>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
                {error}
              </p>
            )}

            {selectedRoute ? (
              <article className="rounded-lg border border-cyan-300 bg-white p-3 shadow-lg shadow-cyan-200/30">
                <h3 className="truncate text-sm font-black text-slate-950">
                  {selectedRoute.startPoint.name}
                </h3>
                <p className="mt-1 truncate text-xs font-bold text-slate-500">
                  hacia {selectedRoute.endPoint.name}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-black text-slate-700">
                  <span className="rounded-lg bg-slate-50 px-3 py-2">
                    {formatDistance(selectedRoute.distance)} km
                  </span>
                  <span className="rounded-lg bg-slate-50 px-3 py-2">
                    {formatDuration(selectedRoute.duration)} min
                  </span>
                </div>
              </article>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                Busca un origen y un destino para calcular una ruta real sobre el mapa.
              </div>
            )}
          </div>
        )}

        {activeMobileSheet === 'route' && (
          <div className="space-y-3">
            {selectedRoute ? (
              <>
                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-cyan-700" />
                  <span>{selectedRoute.startPoint.name}</span>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                  <Route size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                  <span>{selectedRoute.endPoint.name}</span>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                Busca una ruta o toca Como llegar en una parada para ver el trayecto aqui.
              </div>
            )}
          </div>
        )}

        {activeMobileSheet === 'metrics' && (
          <div className="grid gap-3">
            {[
              {
                label: 'Distancia',
                value: selectedRoute ? `${formatDistance(selectedRoute.distance)} km` : '0 km',
                icon: Gauge,
              },
              {
                label: 'Duracion',
                value: selectedRoute ? `${formatDuration(selectedRoute.duration)} min` : '0 min',
                icon: Clock3,
              },
              { label: 'Paradas', value: `${paradas.length}`, icon: Sparkles },
            ].map((metric) => {
              const Icon = metric.icon;

              return (
                <div key={metric.label} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    <Icon size={14} />
                    {metric.label}
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-950">{metric.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {activeMobileSheet === 'timeline' && (
          <div className="space-y-4">
            <form onSubmit={handleCreatePublicStop} className="space-y-3">
              <input
                value={newStop.titulo}
                onChange={(event) =>
                  setNewStop((current) => ({ ...current, titulo: event.target.value }))
                }
                placeholder="Titulo del sitio"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
              <textarea
                value={newStop.descripcion}
                onChange={(event) =>
                  setNewStop((current) => ({ ...current, descripcion: event.target.value }))
                }
                placeholder="Descripcion"
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
              <StopLogoPicker
                value={newStop.logoId}
                onChange={(logoId) => setNewStop((current) => ({ ...current, logoId }))}
              />
              <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
                <input
                  value={newStop.direccion}
                  onChange={(event) =>
                    setNewStop((current) => ({ ...current, direccion: event.target.value }))
                  }
                  placeholder="Direccion exacta del sitio"
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={useCurrentLocationForStop}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-cyan-700 transition hover:bg-cyan-50"
                  aria-label="Obtener direccion automatica"
                  title="Obtener direccion automatica"
                >
                  {isLocatingStop ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LocateFixed size={16} />
                  )}
                </button>
              </label>
              <button
                type="submit"
                disabled={isCreatingStop}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-cyan-700 disabled:cursor-wait disabled:bg-slate-400"
              >
                {isCreatingStop ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Plus size={17} />
                )}
                {isCreatingStop ? 'Buscando direccion' : 'Crear parada publica'}
              </button>
            </form>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                {paradas.length} sitios en mapa
              </p>
              {paradas.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                  Crea tu primer sitio publico para verlo fijo en el mapa.
                </div>
              ) : (
                paradas.map((parada) => {
                  const option = getStopLogoOption(parada.logoId);
                  const Icon = option.icon;

                  return (
                    <div
                      key={parada.id}
                      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <span
                        className="grid size-10 shrink-0 place-items-center rounded-full text-slate-950"
                        style={{ backgroundColor: option.color }}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-950">
                          {parada.titulo}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                          {parada.descripcion}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePublicStop(parada.id)}
                        className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Eliminar ${parada.titulo}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeMobileSheet === 'chat' && (
          <div className="[&>section]:border-0 [&>section]:p-0 [&>section]:shadow-none">
            <UserChatbotPanel />
          </div>
        )}

        {activeMobileSheet === 'favorites' && (
          <div className="space-y-3">
            {favoriteStops.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                Cuando guardes una parada desde el mapa, aparecera aqui.
              </div>
            ) : (
              favoriteStops.map((parada) => {
                const option = getStopLogoOption(parada.logoId);
                const Icon = option.icon;

                return (
                  <div
                    key={parada.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-full text-slate-950"
                      style={{ backgroundColor: option.color }}
                    >
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-950">{parada.titulo}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                        {parada.descripcion}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void routeFromCurrentLocationToStop(parada)}
                      disabled={routingStopId === parada.id}
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-wait disabled:text-slate-400"
                      aria-label={`Como llegar a ${parada.titulo}`}
                    >
                      {routingStopId === parada.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Navigation size={16} />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeMobileSheet === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                <UserRound size={22} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">{user.fullname}</p>
                <p className="truncate text-xs font-bold text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm font-semibold text-slate-500">
              Tu actividad real de rutas se mostrara cuando el historial este conectado.
            </div>
          </div>
        )}
      </BottomSheet>
    </section>
  );
}
