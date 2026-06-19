'use client';

import { useMemo, useState } from 'react';
import { Clock, Heart, MapPin, Route, Search, SlidersHorizontal, Star } from 'lucide-react';
import type { UserRoute } from '../data/user-dashboard.data';
import { UserRouteMap } from './UserRouteMap';

type UserRouteSearchProps = {
  routes: UserRoute[];
};

const routeModes = ['Todas', 'Sin transbordo', 'Menor tiempo', 'Metro'] as const;

export function UserRouteSearch({ routes }: UserRouteSearchProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<(typeof routeModes)[number]>('Todas');
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id ?? '');

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

  return (
    <section id="rutas" className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">Busqueda de rutas</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Encuentra tu mejor trayecto
              </h2>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <Route size={20} />
            </span>
          </div>

          <label className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-600 focus-within:bg-white">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Origen, destino o tipo de ruta"
              className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal size={18} className="shrink-0 text-slate-400" />
            {routeModes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`h-9 shrink-0 rounded-lg px-3 text-xs font-black transition ${
                  mode === item
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {visibleRoutes.map((route) => {
            const isSelected = route.id === selectedRoute.id;

            return (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRouteId(route.id)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-950">{route.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-500">
                      <MapPin size={15} />
                      {route.startPoint.name} a {route.endPoint.name}
                    </p>
                  </div>
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: route.color }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <span className="rounded-lg bg-white px-2 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                    {route.duration} min
                  </span>
                  <span className="rounded-lg bg-white px-2 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                    {route.price}
                  </span>
                  <span className="rounded-lg bg-white px-2 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                    {route.transfers} trans.
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {route.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Mapa de Medellin</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{selectedRoute.name}</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">
              <Clock size={14} className="mx-auto mb-1" />
              {selectedRoute.duration} min
            </span>
            <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">
              <Star size={14} className="mx-auto mb-1" />
              {selectedRoute.status}
            </span>
            <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">
              <Heart size={14} className="mx-auto mb-1" />
              {selectedRoute.frequency}
            </span>
          </div>
        </div>

        <div className="h-[420px]">
          <UserRouteMap
            routes={visibleRoutes}
            selectedRouteId={selectedRoute.id}
            onSelectRoute={setSelectedRouteId}
          />
        </div>
      </div>
    </section>
  );
}
