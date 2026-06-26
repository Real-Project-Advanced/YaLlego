'use client';

import Link from 'next/link';
import { Eye, EyeOff, Gauge, Layers3, Navigation } from 'lucide-react';
import { useState } from 'react';
import type { UserPayload } from '@/lib/auth';
import { UserFloatingDock } from './UserFloatingDock';
import { RoutePanelKey, UserRouteSearch } from './UserRouteSearch';

type UserDashboardProps = {
  user: UserPayload;
};

const routePanelButtons: Array<{
  key: RoutePanelKey;
  label: string;
  ariaLabel: string;
  icon: typeof Eye;
}> = [
  { key: 'search', label: '', ariaLabel: 'Buscador', icon: Eye },
  { key: 'route', label: 'Ruta', ariaLabel: 'Ruta', icon: Navigation },
  { key: 'metrics', label: 'Datos', ariaLabel: 'Datos', icon: Gauge },
  { key: 'timeline', label: 'Paradas', ariaLabel: 'Paradas', icon: Layers3 },
];

export function UserDashboard({ user }: UserDashboardProps) {
  const [visiblePanels, setVisiblePanels] = useState<Record<RoutePanelKey, boolean>>({
    search: true,
    route: false,
    metrics: true,
    timeline: false,
  });

  const toggleRoutePanel = (panel: RoutePanelKey) => {
    setVisiblePanels((current) => ({ ...current, [panel]: !current[panel] }));
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/82 backdrop-blur-2xl">
        <div className="mx-auto flex h-[88px] w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/user" className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-lg bg-slate-950 text-lg font-black text-white shadow-xl shadow-slate-950/10">
              LY
            </span>
            <div>
              <p className="text-lg font-black leading-5 text-slate-950">LlegoYa</p>
            </div>
          </Link>

          <nav
            className="hidden flex-wrap items-center justify-end gap-2 md:flex"
            aria-label="Controles de vista de rutas"
          >
            {routePanelButtons.map((item) => {
              const Icon = item.icon;
              const isVisible = visiblePanels[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleRoutePanel(item.key)}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-950/10 transition sm:px-5 ${
                    isVisible
                      ? 'bg-slate-950 text-white'
                      : 'border border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:text-cyan-700'
                  }`}
                  aria-pressed={isVisible}
                  aria-label={`Mostrar u ocultar ${item.ariaLabel}`}
                >
                  <Icon size={15} />
                  {item.label && <span className="hidden sm:inline">{item.label}</span>}
                  {item.key !== 'search' && (isVisible ? <Eye size={14} /> : <EyeOff size={14} />)}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="relative">
        <div className="flex min-h-[calc(100vh-88px)] flex-col lg:flex-row">
          <div className="w-full lg:flex-1">
            <UserRouteSearch visiblePanels={visiblePanels} onTogglePanel={toggleRoutePanel} />
          </div>
        </div>
      </div>

      <UserFloatingDock user={user} />
    </main>
  );
}
