'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Clock3,
  Gauge,
  Heart,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
  Search,
  Sparkles,
} from 'lucide-react';
import { UserRouteMap } from './UserRouteMap';
import type { MapPoi, SearchRouteResult } from './UserRouteMapClient';

type UserRouteSearchProps = {
  visiblePanels: Record<RoutePanelKey, boolean>;
  onTogglePanel: (panel: RoutePanelKey) => void;
};

type GeocodedPlace = {
  name: string;
  lat: number;
  lng: number;
};

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

export type RoutePanelKey = 'search' | 'route' | 'metrics' | 'timeline';

const medellinViewbox = '-75.7000,6.3600,-75.4800,6.1500';
const routeModes = ['Rapida', 'Con lugares cercanos'] as const;

const favoriteStorageKey = 'yallego.favoritePlaces';

const readStoredFavorites = () => {
  if (typeof window === 'undefined') return [];

  const stored = window.localStorage.getItem(favoriteStorageKey);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as MapPoi[];
  } catch {
    return [];
  }
};

const formatDistance = (distanceKm: number) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(distanceKm);

const formatDuration = (durationMinutes: number) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(durationMinutes);

const categoryFromTags = (tags: Record<string, string>) => {
  if (tags.tourism) return 'Turismo';
  if (tags.shop) return 'Compras';
  if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food') return 'Restaurante';
  if (tags.amenity === 'cafe') return 'Cafe';
  if (tags.amenity) return 'Servicio';
  return 'Lugar';
};

const detailFromTags = (tags: Record<string, string>) => {
  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ');
  const opening = tags.opening_hours ? `Horario: ${tags.opening_hours}.` : '';
  const address = street ? `Direccion: ${street}.` : '';

  return [address, opening].filter(Boolean).join(' ') || 'Lugar registrado en OpenStreetMap.';
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

async function fetchNearbyPois(
  origin: GeocodedPlace,
  destination: GeocodedPlace,
): Promise<MapPoi[]> {
  const centerLat = (origin.lat + destination.lat) / 2;
  const centerLng = (origin.lng + destination.lng) / 2;
  const query = `
    [out:json][timeout:12];
    (
      node(around:1800,${centerLat},${centerLng})["name"]["amenity"];
      node(around:1800,${centerLat},${centerLng})["name"]["tourism"];
      node(around:1800,${centerLat},${centerLng})["name"]["shop"];
    );
    out center 28;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  if (!response.ok) return [];

  const data = (await response.json()) as { elements?: OverpassElement[] };
  const seen = new Set<string>();

  return (data.elements ?? [])
    .map((item) => {
      const lat = item.lat ?? item.center?.lat;
      const lng = item.lon ?? item.center?.lon;
      const tags = item.tags ?? {};
      const name = tags.name;

      if (!lat || !lng || !name) return null;

      return {
        id: `${item.type}-${item.id}`,
        name,
        category: categoryFromTags(tags),
        lat,
        lng,
        detail: detailFromTags(tags),
      } satisfies MapPoi;
    })
    .filter((poi): poi is MapPoi => {
      if (!poi || seen.has(poi.id)) return false;
      seen.add(poi.id);
      return true;
    });
}

export function UserRouteSearch({ visiblePanels }: UserRouteSearchProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<(typeof routeModes)[number]>('Rapida');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState<SearchRouteResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [pois, setPois] = useState<MapPoi[]>([]);
  const [favoritePois, setFavoritePois] = useState<MapPoi[]>(readStoredFavorites);

  const favoritePoiIds = useMemo(() => favoritePois.map((poi) => poi.id), [favoritePois]);
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];

  const saveFavorites = (nextFavorites: MapPoi[]) => {
    setFavoritePois(nextFavorites);
    window.localStorage.setItem(favoriteStorageKey, JSON.stringify(nextFavorites));
    window.dispatchEvent(new CustomEvent('yallego:favorites-updated'));
  };

  const toggleFavoritePoi = (poi: MapPoi) => {
    const exists = favoritePois.some((item) => item.id === poi.id);
    const nextFavorites = exists
      ? favoritePois.filter((item) => item.id !== poi.id)
      : [poi, ...favoritePois].slice(0, 30);

    saveFavorites(nextFavorites);
  };

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

      if (mode === 'Con lugares cercanos') {
        setPois(await fetchNearbyPois(originPlace, destinationPlace));
      } else {
        setPois([]);
      }
    } catch (searchError) {
      setRoutes([]);
      setSelectedRouteId('');
      setPois([]);
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
          pois={pois}
          favoritePoiIds={favoritePoiIds}
          onToggleFavoritePoi={toggleFavoritePoi}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(255,255,255,0.72),rgba(255,255,255,0.2)_23%,rgba(255,255,255,0)_46%),linear-gradient(0deg,rgba(255,255,255,0.62),rgba(255,255,255,0)_34%)]" />

      {visiblePanels.search && (
        <aside className="absolute left-0 top-16 z-[1100] flex max-h-[calc(100%-64px)] w-[min(410px,calc(100vw-24px))] flex-col rounded-r-lg border border-l-0 border-slate-200 bg-white/96 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:top-20 lg:top-24">
          <div className="flex items-start justify-between gap-3">
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

          <div className="mt-3 flex flex-wrap gap-2">
            {routeModes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                  mode === item
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
              Resultado
            </p>
            {favoritePois.length > 0 && (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black text-rose-700">
                {favoritePois.length} favoritos
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

            {mode === 'Con lugares cercanos' && pois.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Lugares en el mapa
                </p>
                {pois.slice(0, 5).map((poi) => {
                  const isFavorite = favoritePoiIds.includes(poi.id);

                  return (
                    <button
                      key={poi.id}
                      type="button"
                      onClick={() => toggleFavoritePoi(poi)}
                      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                        <MapPin size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-slate-950">
                          {poi.name}
                        </span>
                        <span className="block text-xs font-bold text-slate-500">
                          {poi.category}
                        </span>
                      </span>
                      <Heart
                        size={17}
                        className={isFavorite ? 'text-rose-600' : 'text-slate-400'}
                        fill={isFavorite ? 'currentColor' : 'none'}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      )}

      {visiblePanels.route && selectedRoute && (
        <aside className="absolute right-4 top-24 z-[1100] w-[min(340px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white/92 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:right-6 lg:top-28 xl:right-[470px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
                Ruta activa
              </p>
              <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">
                {selectedRoute.name}
              </h3>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
              <Navigation size={20} />
            </span>
          </div>
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
        </aside>
      )}

      {visiblePanels.metrics && selectedRoute && (
        <aside className="absolute bottom-5 left-1/2 z-[1100] w-[min(320px,calc(100vw-32px))] -translate-x-1/2 rounded-lg border border-slate-200 bg-white/92 p-4 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-2xl lg:bottom-6">
          <div className="grid gap-3">
            {[
              {
                label: 'Distancia',
                value: `${formatDistance(selectedRoute.distance)} km`,
                icon: Gauge,
              },
              {
                label: 'Duracion',
                value: `${formatDuration(selectedRoute.duration)} min`,
                icon: Clock3,
              },
              { label: 'Lugares', value: `${pois.length}`, icon: Sparkles },
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

      {visiblePanels.timeline && selectedRoute && (
        <aside className="absolute bottom-4 left-4 z-[1100] hidden w-[min(360px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white/88 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:left-6 lg:bottom-6 lg:block">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Trayecto</p>
          <div className="mt-4 space-y-3">
            {[
              { label: selectedRoute.startPoint.name, color: 'text-cyan-700' },
              { label: selectedRoute.endPoint.name, color: 'text-rose-700' },
            ].map((stop, index) => (
              <div key={stop.label} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cyan-50 text-xs font-black text-cyan-700 ring-1 ring-cyan-100">
                  {index + 1}
                </span>
                <p className={`text-sm font-black ${stop.color}`}>{stop.label}</p>
              </div>
            ))}
          </div>
        </aside>
      )}
    </section>
  );
}
