'use client';

import type { FormEvent, PointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  Clock3,
  Gauge,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Plus,
  Route,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { UserRouteMap } from './UserRouteMap';
import {
  getStopLogoOption,
  stopLogoOptions,
  type Parada,
  type SearchRouteResult,
  type StopLogoId,
} from './UserRouteMapShared';

type UserRouteSearchProps = {
  visiblePanels: Record<RoutePanelKey, boolean>;
  onTogglePanel: (panel: RoutePanelKey) => void;
};

type GeocodedPlace = {
  name: string;
  lat: number;
  lng: number;
};

export type RoutePanelKey = 'search' | 'route' | 'metrics' | 'timeline';

type FloatingPanelKey = RoutePanelKey;

const medellinViewbox = '-75.7000,6.3600,-75.4800,6.1500';

const favoriteStorageKey = 'yallego.favoritePlaces';
const publicStopsStorageKey = 'yallego.publicStops';

type StoredStop = Partial<Parada> & {
  name?: string;
  lat?: number;
  lng?: number;
  detail?: string;
  category?: string;
  logoText?: string;
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

async function geocodePlace(value: string): Promise<GeocodedPlace> {
  const query = value.toLowerCase().includes('medellin') ? value : `${value}, Medellin, Colombia`;
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    limit: '1',
    viewbox: medellinViewbox,
    bounded: '1',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  if (!response.ok) throw new Error('No pude consultar el origen o destino.');

  const results = (await response.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;

  const place = results[0];
  if (!place) throw new Error(`No encontre "${value}" dentro de Medellin.`);

  return {
    name: place.display_name.split(',').slice(0, 2).join(', '),
    lat: Number(place.lat),
    lng: Number(place.lon),
  };
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

export function UserRouteSearch({ visiblePanels }: UserRouteSearchProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState<SearchRouteResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [newStop, setNewStop] = useState({
    titulo: '',
    descripcion: '',
    logoId: 'home' as StopLogoId,
    informacionAdicional: '',
    direccion: '',
  });
  const [isCreatingStop, setIsCreatingStop] = useState(false);
  const [routingStopId, setRoutingStopId] = useState('');
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

  const favoriteStops = useMemo(() => paradas.filter((parada) => parada.esFavorito), [paradas]);
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];

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
    }, 0);

    return () => window.clearTimeout(loadTimer);
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
      const publicStop: Parada = {
        id: `public-${Date.now()}`,
        latitud: place.lat,
        longitud: place.lng,
        logoId: newStop.logoId,
        titulo: cleanTitle,
        descripcion: cleanDescription,
        esFavorito: false,
        informacionAdicional: newStop.informacionAdicional.trim() || `Direccion: ${place.name}`,
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

  const getCurrentLocationPlace = useCallback(
    () =>
      new Promise<GeocodedPlace>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Tu navegador no permite usar ubicacion actual.'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              name: 'Mi ubicacion actual',
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            reject(new Error('No pude obtener tu ubicacion. Revisa los permisos del navegador.'));
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }),
    [],
  );

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

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no permite usar ubicacion actual.');
      return;
    }

    setError('');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin(
          `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        );
        setIsLocating(false);
      },
      () => {
        setError('No pude obtener tu ubicacion. Puedes escribir una direccion manualmente.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
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
      const [originPlace, destinationPlace] = await Promise.all([
        geocodePlace(cleanOrigin),
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
    } catch (searchError) {
      setRoutes([]);
      setSelectedRouteId('');
      setError(searchError instanceof Error ? searchError.message : 'No pude buscar esa ruta.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section
      id="rutas"
      className="isolate relative min-h-[calc(100vh-88px)] overflow-hidden border-y border-slate-200 bg-white"
    >
      <div className="absolute inset-0 z-0">
        <UserRouteMap
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          paradas={paradas}
          onToggleFavoriteParada={toggleFavoriteParada}
          onRouteFromCurrentLocation={routeFromCurrentLocationToStop}
          routingStopId={routingStopId}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(255,255,255,0.72),rgba(255,255,255,0.2)_23%,rgba(255,255,255,0)_46%),linear-gradient(0deg,rgba(255,255,255,0.62),rgba(255,255,255,0)_34%)]" />

      {visiblePanels.search && (
        <aside
          className="absolute left-0 top-16 z-[1100] flex max-h-[calc(100%-64px)] w-[min(410px,calc(100vw-24px))] flex-col rounded-r-lg border border-l-0 border-slate-200 bg-white/96 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:top-20 lg:top-24"
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

          <form onSubmit={handleSearch} className="mt-4">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="space-y-2">
                <label className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-700 shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
                  <span className="size-3 rounded-full bg-cyan-500" />
                  <input
                    value={origin}
                    onChange={(event) => setOrigin(event.target.value)}
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
          className="absolute right-4 top-24 z-[1100] w-[min(340px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white/92 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:right-6 lg:top-28 xl:right-[470px]"
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
          className="absolute bottom-5 left-1/2 z-[1100] w-[min(320px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white/92 p-4 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-2xl lg:bottom-6"
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
          className="absolute bottom-4 left-4 z-[1100] max-h-[calc(100%-120px)] w-[min(420px,calc(100vw-32px))] overflow-y-auto rounded-lg border border-slate-200 bg-white/94 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:left-6 lg:bottom-6"
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
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Logo</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {stopLogoOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = newStop.logoId === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setNewStop((current) => ({ ...current, logoId: option.id }))}
                      className={`grid h-14 place-items-center rounded-lg border text-slate-950 transition ${
                        isSelected
                          ? 'border-slate-950 ring-2 ring-cyan-200'
                          : 'border-slate-200 hover:border-cyan-300'
                      }`}
                      style={{ backgroundColor: option.color }}
                      aria-label={`Usar logo ${option.label}`}
                      title={option.label}
                    >
                      <Icon size={22} />
                    </button>
                  );
                })}
              </div>
            </div>
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
            <input
              value={newStop.direccion}
              onChange={(event) =>
                setNewStop((current) => ({ ...current, direccion: event.target.value }))
              }
              placeholder="Direccion del sitio"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
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
    </section>
  );
}
