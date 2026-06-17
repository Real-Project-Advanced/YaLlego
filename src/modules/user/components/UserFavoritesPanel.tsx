import Link from 'next/link';
import { Heart, MapPinned } from 'lucide-react';
import type { UserRoute } from '../data/user-dashboard.data';

type UserFavoritesPanelProps = {
  routes: UserRoute[];
};

export function UserFavoritesPanel({ routes }: UserFavoritesPanelProps) {
  return (
    <section id="favoritas" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-700">Favoritas</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Rutas guardadas</h2>
        </div>
        <span className="grid size-10 place-items-center rounded-lg bg-rose-50 text-rose-600">
          <Heart size={20} />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {routes.map((route) => (
          <Link
            key={route.id}
            href={`/user/routes/${route.id}`}
            className="block rounded-lg border border-slate-200 p-3 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
                <MapPinned size={17} />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-slate-950">{route.name}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {route.startPoint.name} a {route.endPoint.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                  <span>{route.duration} min</span>
                  <span>{route.price}</span>
                  <span>{route.frequency}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
