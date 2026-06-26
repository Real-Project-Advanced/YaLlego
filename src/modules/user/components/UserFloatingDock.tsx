'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Bell,
  Bot,
  Clock3,
  Heart,
  History,
  MapPinned,
  PanelRightClose,
  UserRound,
} from 'lucide-react';
import type { UserPayload } from '@/lib/auth';
import { favoriteRoutes, mobilityNews, userRoutes } from '../data/user-dashboard.data';
import { UserChatbotPanel } from './UserChatbotPanel';
import { UserFavoritesPanel } from './UserFavoritesPanel';
import { UserNewsPanel } from './UserNewsPanel';

type UserFloatingDockProps = {
  user: UserPayload;
};

type DockPanel = 'chat' | 'favorites' | 'history' | 'news' | 'profile';

const dockItems: Array<{ key: DockPanel; label: string; icon: typeof Bot }> = [
  { key: 'chat', label: 'Chat', icon: Bot },
  { key: 'favorites', label: 'Favoritos', icon: Heart },
  { key: 'history', label: 'Historial', icon: History },
  { key: 'news', label: 'Alertas', icon: Bell },
  { key: 'profile', label: 'Perfil', icon: UserRound },
];

export function UserFloatingDock({ user }: UserFloatingDockProps) {
  const [openPanels, setOpenPanels] = useState<Record<DockPanel, boolean>>({
    chat: false,
    favorites: true,
    history: false,
    news: false,
    profile: false,
  });

  const togglePanel = (panel: DockPanel) => {
    setOpenPanels((current) => ({ ...current, [panel]: !current[panel] }));
  };

  return (
    <div className="pointer-events-none fixed inset-y-[104px] right-4 z-30 flex items-start gap-3 sm:right-6">
      <nav className="pointer-events-auto flex flex-col gap-2 rounded-full border border-slate-200 bg-white/88 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openPanels[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => togglePanel(item.key)}
              aria-label={item.label}
              aria-pressed={isOpen}
              className={`group relative grid size-12 place-items-center rounded-full transition ${
                isOpen
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-cyan-700 hover:ring-cyan-300'
              }`}
            >
              <Icon size={20} />
              <span className="pointer-events-none absolute right-14 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-xl group-hover:block">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="pointer-events-auto flex max-h-full w-[min(392px,calc(100vw-92px))] flex-col gap-3 overflow-y-auto pr-1">
        {openPanels.chat && (
          <DockPanelShell title="Chat inteligente" onClose={() => togglePanel('chat')}>
            <UserChatbotPanel />
          </DockPanelShell>
        )}

        {openPanels.favorites && (
          <DockPanelShell title="Rutas favoritas" onClose={() => togglePanel('favorites')}>
            <UserFavoritesPanel routes={favoriteRoutes} />
          </DockPanelShell>
        )}

        {openPanels.history && (
          <DockPanelShell title="Historial" onClose={() => togglePanel('history')}>
            <section className="p-4">
              <div className="space-y-3">
                {userRoutes.map((route, index) => (
                  <Link
                    key={route.id}
                    href={`/user/routes/${route.id}`}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                      <MapPinned size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Busqueda {index + 1}
                      </span>
                      <span className="mt-1 block truncate text-sm font-black text-slate-950">
                        {route.startPoint.name} a {route.endPoint.name}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Clock3 size={14} />
                        {route.duration} min · {route.price}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href="/user/history"
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white transition hover:bg-cyan-700"
              >
                Ver historial completo
              </Link>
            </section>
          </DockPanelShell>
        )}

        {openPanels.news && (
          <DockPanelShell title="Alertas urbanas" onClose={() => togglePanel('news')}>
            <UserNewsPanel news={mobilityNews} />
          </DockPanelShell>
        )}

        {openPanels.profile && (
          <DockPanelShell title="Perfil activo" onClose={() => togglePanel('profile')}>
            <section className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-lg bg-slate-950 text-white">
                  <UserRound size={22} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{user.fullname}</p>
                  <p className="truncate text-xs font-bold text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-cyan-50 p-3 ring-1 ring-cyan-100">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                    Promedio
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">34 min</p>
                </div>
                <div className="rounded-lg bg-rose-50 p-3 ring-1 ring-rose-100">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">
                    Favoritas
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{favoriteRoutes.length}</p>
                </div>
              </div>
            </section>
          </DockPanelShell>
        )}
      </div>
    </div>
  );
}

function DockPanelShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">{title}</p>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label={`Cerrar ${title}`}
        >
          <PanelRightClose size={17} />
        </button>
      </div>
      {children}
    </div>
  );
}
