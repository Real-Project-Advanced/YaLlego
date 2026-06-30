'use client';

import Link from 'next/link';
import { BusFront, Heart, Navigation, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SearchRouteResult } from './UserRouteMapShared';

const favoriteRoutesStorageKey = 'yallego.favoriteRoutes';

type FavoriteRoute = SearchRouteResult & {
  driverCode?: string;
  routeName?: string;
  savedAt: string;
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

export function UserSavedPlacesPanel() {
  const [routes, setRoutes] = useState<FavoriteRoute[]>([]);

  useEffect(() => {
    const loadRoutes = () => setRoutes(readStoredFavoriteRoutes());

    loadRoutes();
    window.addEventListener('yallego:favorite-routes-updated', loadRoutes);
    window.addEventListener('storage', loadRoutes);

    return () => {
      window.removeEventListener('yallego:favorite-routes-updated', loadRoutes);
      window.removeEventListener('storage', loadRoutes);
    };
  }, []);

  const removeFavoriteRoute = (route: FavoriteRoute) => {
    const nextRoutes = routes.filter(
      (item) =>
        item.id !== route.id ||
        item.driverCode !== route.driverCode ||
        item.routeName !== route.routeName,
    );

    setRoutes(nextRoutes);
    window.localStorage.setItem(favoriteRoutesStorageKey, JSON.stringify(nextRoutes));
    window.dispatchEvent(new CustomEvent('yallego:favorite-routes-updated'));
  };

  if (routes.length === 0) {
    return (
      <section className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-6">
        <div className="grid gap-3 text-slate-600 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <span className="grid size-12 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
            <Heart size={22} />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-950">Todavia no hay rutas favoritas</h2>
            <p className="mt-1 text-sm font-semibold">
              Toca un bus en el mapa y guarda su ruta para verla aqui.
            </p>
          </div>
          <Link
            href="/user"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-cyan-700"
          >
            <BusFront size={17} />
            Buscar buses
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Rutas</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{routes.length}</p>
        </div>
        <Link
          href="/user"
          className="flex min-h-28 items-center justify-center gap-2 rounded-lg bg-slate-950 p-4 text-sm font-black text-white transition hover:bg-cyan-700"
        >
          <Navigation size={18} />
          Buscar otra ruta
        </Link>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {routes.map((route) => {
          const routeName = route.routeName ?? route.name;

          return (
            <article
              key={`${route.id}-${route.driverCode ?? routeName}`}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-300"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                  <BusFront size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-black leading-tight text-slate-950">
                    {routeName}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    Conductor {route.driverCode ?? 'por asignar'}
                  </p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    $3.800
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFavoriteRoute(route)}
                  className="grid size-10 shrink-0 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                  aria-label={`Quitar ${routeName} de favoritos`}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <Link
                href={`/user?favoriteRoute=${encodeURIComponent(routeName)}`}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white transition hover:bg-cyan-700"
              >
                <BusFront size={17} />
                Buscar buses de esta ruta
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
