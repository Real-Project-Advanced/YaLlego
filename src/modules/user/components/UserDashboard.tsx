import Link from 'next/link';
import {
  Bell,
  Clock3,
  Compass,
  Heart,
  MessageCircle,
  Search,
  UserRound,
  LogOut,
} from 'lucide-react';
import type { UserPayload } from '@/lib/auth';
import { AppLogo } from '@/components/common/AppLogo';
import { logoutAction } from '@/modules/auth/actions/auth.actions';
import { favoriteRoutes, mobilityNews, userRoutes } from '../data/user-dashboard.data';
import { UserChatbotPanel } from './UserChatbotPanel';
import { UserFavoritesPanel } from './UserFavoritesPanel';
import { UserNewsPanel } from './UserNewsPanel';
import { UserRouteSearch } from './UserRouteSearch';

type UserDashboardProps = {
  user: UserPayload;
};

const navItems = [
  { href: '#routes', label: 'Routes', icon: Search },
  { href: '#chatbot', label: 'Chatbot', icon: MessageCircle },
  { href: '#novedades', label: 'Updates', icon: Bell },
  { href: '#favoritas', label: 'Favorites', icon: Heart },
];

export function UserDashboard({ user }: UserDashboardProps) {
  const nextRoute = userRoutes[0];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/user" className="flex min-w-0 items-center gap-3">
            <AppLogo subtitle="Movilidad personal" iconClassName="size-11 bg-slate-950" />
          </Link>

          <nav className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:justify-end lg:overflow-visible lg:px-0 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <Icon size={16} />
                  {item.label}
                </a>
              );
            })}

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
              >
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex max-w-full items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                  <Compass size={16} />
                  <span className="truncate">Medellin in urban time</span>
                </div>
                <h1 className="mt-4 max-w-3xl text-[clamp(2rem,6vw,2.5rem)] font-black leading-tight text-slate-950">
                  Hi, {user.fullname}. Plan, compare, and save your frequent routes.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Search trips, review the map, chat with the assistant, and stay updated on changes
                  that affect your ride.
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:w-auto lg:min-w-[260px]">
                <div className="rounded-lg bg-slate-950 p-4 text-white">
                  <p className="text-xs font-bold uppercase text-slate-300">Next route</p>
                  <p className="mt-2 text-2xl font-black">{nextRoute.duration} min</p>
                  <p className="mt-1 text-xs font-semibold text-slate-300">{nextRoute.name}</p>
                </div>
                <div className="rounded-lg bg-emerald-600 p-4 text-white">
                  <p className="text-xs font-bold uppercase text-emerald-100">Favorites</p>
                  <p className="mt-2 text-2xl font-black">{favoriteRoutes.length}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-100">Saved routes</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <UserRound size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">{user.email}</p>
                <p className="text-xs font-bold uppercase text-slate-500">Active USER profile</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <Clock3 size={18} className="text-slate-500" />
                <p className="mt-2 text-lg font-black text-slate-950">34 min</p>
                <p className="text-xs font-bold text-slate-500">Average today</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <Heart size={18} className="text-slate-500" />
                <p className="mt-2 text-lg font-black text-slate-950">2 routes</p>
                <p className="text-xs font-bold text-slate-500">Quick access</p>
              </div>
            </div>
          </aside>
        </section>

        <div className="mt-5">
          <UserRouteSearch routes={userRoutes} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <UserChatbotPanel />
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-1">
            <UserNewsPanel news={mobilityNews} />
            <UserFavoritesPanel routes={favoriteRoutes} />
          </div>
        </div>
      </div>
    </main>
  );
}
