import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import type { UserRoute } from '../data/user-dashboard.data';

type UserFavoritesPanelProps = {
  routes: UserRoute[];
};

export function UserFavoritesPanel({ routes }: UserFavoritesPanelProps) {
  return (
    <section id="favoritas" className="bg-white">
      <h2 className="text-xl font-black text-slate-950">{routes.length} rutas guardadas</h2>

      <div className="mt-4 space-y-3">
        {routes.map((route, index) => (
          <Link
            key={route.id}
            href={`/user/routes/${route.id}`}
            className="block rounded-lg border border-slate-200 bg-white p-3 transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            <div className="flex items-start gap-3">
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-black text-slate-950 ${
                  index % 2 === 0 ? 'bg-violet-300' : 'bg-emerald-400'
                }`}
              >
                {route.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join('')
                  .toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-black text-slate-950">{route.name}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {route.startPoint.name} a {route.endPoint.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                  <span>{route.duration} min</span>
                  <span>{route.price}</span>
                </div>
              </div>
              <MoreVertical size={17} className="mt-1 shrink-0 text-slate-500" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
