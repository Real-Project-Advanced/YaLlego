'use client';

import { useMemo, useState } from 'react';
import {
  Clock3,
  Eye,
  EyeOff,
  Gauge,
  Heart,
  Layers3,
  MapPin,
  Navigation,
  Route,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import type { UserRoute } from '../data/user-dashboard.data';
import { UserRouteMap } from './UserRouteMap';

type UserRouteSearchProps = {
  routes: UserRoute[];
};

type PanelKey = 'search' | 'route' | 'metrics' | 'timeline';

const routeModes = ['Todas', 'Sin transbordo', 'Menor tiempo', 'Metro'] as const;

const panelButtons: Array<{ key: PanelKey; label: string; icon: typeof Search }> = [
  { key: 'search', label: 'Buscar', icon: Search },
  { key: 'route', label: 'Ruta', icon: Navigation },
  { key: 'metrics', label: 'Datos', icon: Gauge },
  { key: 'timeline', label: 'Paradas', icon: Layers3 },
];

export function UserRouteSearch({ routes }: UserRouteSearchProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<(typeof routeModes)[number]>('Todas');
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id ?? '');
  const [visiblePanels, setVisiblePanels] = useState<Record<PanelKey, boolean>>({
    search: true,
    route: true,
    metrics: true,
    timeline: true,
  });

  const filteredRoutes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return routes.filter((route) => {
      const matchesQuery =
        !normalizedQuery ||
        route.name.toLowerCase().includes(normalizedQuery) ||
        route.startPoint.name.toLowerCase().includes(normalizedQuery) ||
        route.endPoint.name.toLowerCase().includes(normalizedQuery) ||
        route.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      const matchesMode =
        mode === 'Todas' ||
        (mode === 'Sin transbordo' && route.transfers === 0) ||
        (mode === 'Menor tiempo' && route.duration <= 28) ||
        (mode === 'Metro' && route.tags.includes('Metro'));

      return matchesQuery && matchesMode;
    });
  }, [mode, query, routes]);

  const visibleRoutes = filteredRoutes.length > 0 ? filteredRoutes : routes;
  const selectedRoute =
    visibleRoutes.find((route) => route.id === selectedRouteId) ?? visibleRoutes[0];

  const togglePanel = (panel: PanelKey) => {
    setVisiblePanels((current) => ({ ...current, [panel]: !current[panel] }));
  };

  return (
    <section
      id="rutas"
      className="relative min-h-[calc(100vh-88px)] overflow-hidden border-y border-slate-200 bg-white"
    >
      <div className="absolute inset-0">
        <UserRouteMap
          routes={visibleRoutes}
          selectedRouteId={selectedRoute.id}
          onSelectRoute={setSelectedRouteId}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(255,255,255,0.38)_31%,rgba(255,255,255,0)_52%),linear-gradient(0deg,rgba(255,255,255,0.92),rgba(255,255,255,0)_30%)]" />

      <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex flex-wrap items-center justify-center gap-2 sm:inset-x-6 lg:top-6">
        <div className="pointer-events-auto flex flex-wrap justify-center gap-2 rounded-full border border-slate-200 bg-white/85 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          {panelButtons.map((item) => {
            const Icon = item.icon;
            const isVisible = visiblePanels[item.key];

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => togglePanel(item.key)}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-black uppercase tracking-[0.18em] transition ${
                  isVisible
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                    : 'border border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:text-cyan-700'
                }`}
                aria-pressed={isVisible}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{item.label}</span>
                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {visiblePanels.search && (
        <aside className="absolute left-4 top-24 z-10 w-[min(360px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white/88 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:left-6 lg:top-28">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-700">
                Busqueda de rutas
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">
                Elige tu trayecto
              </h2>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
              <SlidersHorizontal size={18} />
            </span>
          </div>

          <label className="mt-4 flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-700 shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Origen, destino o etiqueta"
              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

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

          <div className="mt-4 max-h-[42vh] space-y-3 overflow-y-auto pr-1">
            {visibleRoutes.map((route) => {
              const isSelected = route.id === selectedRoute.id;

              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-50 shadow-lg shadow-cyan-200/30'
                      : 'border-slate-200 bg-white/90 hover:border-cyan-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                        {route.tags[0]}
                      </p>
                      <h3 className="mt-2 text-base font-black text-slate-950">{route.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {route.startPoint.name} a {route.endPoint.name}
                      </p>
                    </div>
                    <span
                      className="mt-1 size-4 rounded-full border border-white shadow ring-1 ring-slate-200"
                      style={{ backgroundColor: route.color }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
                    <span className="rounded-lg bg-slate-50 px-2 py-2">{route.duration} min</span>
                    <span className="rounded-lg bg-slate-50 px-2 py-2">{route.price}</span>
                    <span className="rounded-lg bg-slate-50 px-2 py-2">
                      {route.transfers} trans.
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {visiblePanels.route && (
        <aside className="absolute right-4 top-24 z-10 w-[min(340px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white/88 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:right-6 lg:top-28 xl:right-[470px]">
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

      {visiblePanels.metrics && (
        <aside className="absolute inset-x-4 bottom-4 z-10 rounded-lg border border-slate-200 bg-white/90 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:inset-x-6 lg:bottom-6 lg:left-auto lg:w-[620px] xl:right-[470px]">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Duracion', value: `${selectedRoute.duration} min`, icon: Clock3 },
              { label: 'Costo', value: selectedRoute.price, icon: Gauge },
              { label: 'Frecuencia', value: selectedRoute.frequency, icon: Sparkles },
              { label: 'Estado', value: selectedRoute.status, icon: Heart },
            ].map((metric) => {
              const Icon = metric.icon;

              return (
                <div
                  key={metric.label}
                  className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"
                >
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    <Icon size={14} />
                    {metric.label}
                  </div>
                  <p className="mt-2 text-lg font-black text-slate-950">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {visiblePanels.timeline && (
        <aside className="absolute bottom-4 left-4 z-10 hidden w-[min(360px,calc(100vw-32px))] rounded-lg border border-slate-200 bg-white/88 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:left-6 lg:bottom-6 lg:block">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
            Paradas clave
          </p>
          <div className="mt-4 space-y-3">
            {selectedRoute.stops?.map((stop) => (
              <div key={stop.id} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cyan-50 text-xs font-black text-cyan-700 ring-1 ring-cyan-100">
                  {stop.sequence}
                </span>
                <p className="text-sm font-black text-slate-800">{stop.name}</p>
              </div>
            ))}
          </div>
        </aside>
      )}
    </section>
  );
}
