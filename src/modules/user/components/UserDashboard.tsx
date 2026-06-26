import Link from 'next/link';
import { Heart, History, MessageCircle, UserRound } from 'lucide-react';
import type { UserPayload } from '@/lib/auth';
import { favoriteRoutes, userRoutes } from '../data/user-dashboard.data';
import { UserFloatingDock } from './UserFloatingDock';
import { UserRouteSearch } from './UserRouteSearch';

type UserDashboardProps = {
  user: UserPayload;
};

export function UserDashboard({ user }: UserDashboardProps) {
  const nextRoute = userRoutes[0];

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/82 backdrop-blur-2xl">
        <div className="mx-auto flex h-[88px] w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/user" className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-lg bg-slate-950 text-lg font-black text-white shadow-xl shadow-slate-950/10">
              N
            </span>
            <div>
              <p className="text-lg font-black leading-5 text-slate-950">Nexthus</p>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-700">
                Movilidad viva
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                Proxima ruta
              </p>
              <p className="mt-1 text-sm font-black text-slate-950">
                {nextRoute.name} · {nextRoute.duration} min
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                Favoritas
              </p>
              <p className="mt-1 text-sm font-black text-slate-950">
                {favoriteRoutes.length} rutas guardadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/user/chat"
              className="grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700"
              aria-label="Abrir chat"
            >
              <MessageCircle size={19} />
            </Link>
            <Link
              href="/user/favorites"
              className="grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-700"
              aria-label="Abrir favoritos"
            >
              <Heart size={19} />
            </Link>
            <Link
              href="/user/history"
              className="grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
              aria-label="Abrir historial"
            >
              <History size={19} />
            </Link>
            <span className="grid size-11 place-items-center rounded-lg bg-slate-950 text-white shadow-xl shadow-slate-950/10">
              <UserRound size={19} />
            </span>
          </div>
        </div>
      </header>

      <UserRouteSearch routes={userRoutes} />
      <UserFloatingDock user={user} />
    </main>
  );
}
