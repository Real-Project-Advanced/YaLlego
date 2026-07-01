'use client';

import type { PointerEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Bell,
  Bot,
  Heart,
  History,
  LogOut,
  MapPinned,
  PanelRightClose,
  UserRound,
} from 'lucide-react';
import type { UserPayload } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isMissingSupabaseTableError } from '@/modules/shared/services/localRealtimeFallback';
import { UserChatbotPanel } from './UserChatbotPanel';
import type { Parada, SearchRouteResult } from './UserRouteMapShared';

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

const initialPanelPositions: Record<DockPanel, { x: number; y: number }> = {
  chat: { x: 96, y: 118 },
  favorites: { x: 124, y: 146 },
  history: { x: 152, y: 174 },
  news: { x: 180, y: 202 },
  profile: { x: 208, y: 230 },
};

const favoriteStorageKey = 'yallego.favoritePlaces';
const favoriteRoutesStorageKey = 'yallego.favoriteRoutes';

type FavoriteRoute = SearchRouteResult & {
  driverCode?: string;
  routeName?: string;
  savedAt: string;
};

type RideHistoryItem = {
  id: string;
  route_name?: string | null;
  driver_code?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type StoredStop = Partial<Parada> & {
  name?: string;
  lat?: number;
  lng?: number;
  detail?: string;
  category?: string;
};

const normalizeStoredStop = (item: StoredStop): Parada | null => {
  const latitud = item.latitud ?? item.lat;
  const longitud = item.longitud ?? item.lng;
  const titulo = item.titulo ?? item.name;
  const descripcion = item.descripcion ?? item.detail;

  if (!item.id || typeof latitud !== 'number' || typeof longitud !== 'number' || !titulo) {
    return null;
  }

  return {
    id: item.id,
    latitud,
    longitud,
    logoId: item.logoId ?? 'home',
    logoUrl: item.logoUrl ?? '',
    titulo,
    descripcion: descripcion ?? 'Parada guardada.',
    esFavorito: item.esFavorito ?? true,
    informacionAdicional: item.informacionAdicional ?? item.category,
  };
};

const readStoredFavorites = () => {
  if (typeof window === 'undefined') return [];

  const stored = window.localStorage.getItem(favoriteStorageKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as StoredStop[];
    return parsed.map(normalizeStoredStop).filter((item): item is Parada => Boolean(item));
  } catch {
    return [];
  }
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

export function UserFloatingDock({ user }: UserFloatingDockProps) {
  const [openPanels, setOpenPanels] = useState<Record<DockPanel, boolean>>({
    chat: false,
    favorites: false,
    history: false,
    news: false,
    profile: false,
  });
  const [panelPositions, setPanelPositions] = useState(initialPanelPositions);
  const [activeDrag, setActiveDrag] = useState<DockPanel | null>(null);
  const [, setFavoritePois] = useState<Parada[]>([]);
  const [favoriteRoutes, setFavoriteRoutes] = useState<FavoriteRoute[]>([]);
  const [rideHistory, setRideHistory] = useState<RideHistoryItem[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      setFavoritePois(readStoredFavorites());
      setFavoriteRoutes(readStoredFavoriteRoutes());
    };

    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    window.addEventListener('yallego:favorites-updated', loadFavorites);
    window.addEventListener('yallego:favorite-routes-updated', loadFavorites);

    return () => {
      window.removeEventListener('storage', loadFavorites);
      window.removeEventListener('yallego:favorites-updated', loadFavorites);
      window.removeEventListener('yallego:favorite-routes-updated', loadFavorites);
    };
  }, []);

  useEffect(() => {
    let tableExists = true;

    const loadHistory = async () => {
      if (!tableExists) return;

      const { data, error } = await supabase
        .from('ride_requests')
        .select('id, route_name, driver_code, status, created_at')
        .eq('user_id', String(user.id))
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        if (isMissingSupabaseTableError(`${error.code ?? ''} ${error.message}`)) {
          tableExists = false;
          setRideHistory([]);
          return;
        }
        return;
      }

      setRideHistory((data ?? []) as RideHistoryItem[]);
    };

    void loadHistory();

    const channel = supabase
      .channel(`user-history-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ride_requests', filter: `user_id=eq.${user.id}` },
        () => {
          if (tableExists) void loadHistory();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user.id]);

  const togglePanel = (panel: DockPanel) => {
    setOpenPanels((current) => ({ ...current, [panel]: !current[panel] }));
  };

  const movePanel = (panel: DockPanel, deltaX: number, deltaY: number) => {
    setPanelPositions((current) => {
      const panelWidth = Math.min(390, window.innerWidth - 24);
      const panelHeight = 220;
      const maxX = Math.max(12, window.innerWidth - panelWidth - 12);
      const maxY = Math.max(92, window.innerHeight - panelHeight - 12);
      const nextX = Math.min(Math.max(12, current[panel].x + deltaX), maxX);
      const nextY = Math.min(Math.max(92, current[panel].y + deltaY), maxY);

      return { ...current, [panel]: { x: nextX, y: nextY } };
    });
  };

  const handleDragStart = (panel: DockPanel, event: PointerEvent<HTMLDivElement>) => {
    setActiveDrag(panel);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (panel: DockPanel, event: PointerEvent<HTMLDivElement>) => {
    if (activeDrag !== panel) return;
    movePanel(panel, event.movementX, event.movementY);
  };

  const handleDragEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setActiveDrag(null);
  };

  return (
    <>
      {openPanels.chat && (
        <DockPanelShell
          title="Chat inteligente"
          icon={<Bot size={18} />}
          position={panelPositions.chat}
          isDragging={activeDrag === 'chat'}
          onClose={() => togglePanel('chat')}
          onDragStart={(event) => handleDragStart('chat', event)}
          onDragMove={(event) => handleDragMove('chat', event)}
          onDragEnd={handleDragEnd}
        >
          <div className="max-h-[min(560px,calc(100vh-180px))] overflow-y-auto">
            <UserChatbotPanel />
          </div>
        </DockPanelShell>
      )}

      {openPanels.favorites && (
        <DockPanelShell
          title="Rutas favoritas"
          icon={<Heart size={18} />}
          position={panelPositions.favorites}
          isDragging={activeDrag === 'favorites'}
          onClose={() => togglePanel('favorites')}
          onDragStart={(event) => handleDragStart('favorites', event)}
          onDragMove={(event) => handleDragMove('favorites', event)}
          onDragEnd={handleDragEnd}
        >
          {favoriteRoutes.length > 0 ? (
            <FavoritePlacesPanel routes={favoriteRoutes} />
          ) : (
            <EmptyDockState
              icon={<Heart size={22} />}
              title="No tienes rutas guardadas"
              description="Cuando guardes la ruta de un bus desde el mapa, aparecera aqui."
            />
          )}
        </DockPanelShell>
      )}

      {openPanels.history && (
        <DockPanelShell
          title="Historial"
          icon={<History size={18} />}
          position={panelPositions.history}
          isDragging={activeDrag === 'history'}
          onClose={() => togglePanel('history')}
          onDragStart={(event) => handleDragStart('history', event)}
          onDragMove={(event) => handleDragMove('history', event)}
          onDragEnd={handleDragEnd}
        >
          {rideHistory.length > 0 ? (
            <HistoryPanel items={rideHistory} />
          ) : (
            <EmptyDockState
              icon={<MapPinned size={22} />}
              title="Sin solicitudes recientes"
              description="Tus solicitudes de bus se mostraran en esta ventana."
            />
          )}
        </DockPanelShell>
      )}

      {openPanels.news && (
        <DockPanelShell
          title="Alertas urbanas"
          icon={<Bell size={18} />}
          position={panelPositions.news}
          isDragging={activeDrag === 'news'}
          onClose={() => togglePanel('news')}
          onDragStart={(event) => handleDragStart('news', event)}
          onDragMove={(event) => handleDragMove('news', event)}
          onDragEnd={handleDragEnd}
        >
          <EmptyDockState
            icon={<Bell size={22} />}
            title="No hay alertas activas"
            description="Las novedades conectadas al sistema apareceran aqui."
          />
        </DockPanelShell>
      )}

      {openPanels.profile && (
        <DockPanelShell
          title="Perfil activo"
          icon={<UserRound size={18} />}
          position={panelPositions.profile}
          isDragging={activeDrag === 'profile'}
          onClose={() => togglePanel('profile')}
          onDragStart={(event) => handleDragStart('profile', event)}
          onDragMove={(event) => handleDragMove('profile', event)}
          onDragEnd={handleDragEnd}
        >
          <section className="p-4">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                <UserRound size={22} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">{user.fullname}</p>
                <p className="truncate text-xs font-bold text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm font-semibold text-slate-500">
              Tu actividad real de rutas se mostrara cuando el historial este conectado.
            </div>
            <form action="/api/auth/logout" method="post" className="mt-4">
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white transition hover:bg-rose-700"
              >
                <LogOut size={17} />
                Cerrar sesion
              </button>
            </form>
          </section>
        </DockPanelShell>
      )}

      <div className="pointer-events-none fixed bottom-5 right-4 z-[1300] hidden items-end gap-3 md:flex lg:bottom-7">
        <nav className="pointer-events-auto flex flex-col gap-2 rounded-full border border-slate-200 bg-white/92 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
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
      </div>
    </>
  );
}

function DockPanelShell({
  title,
  icon,
  position,
  isDragging,
  onClose,
  onDragStart,
  onDragMove,
  onDragEnd,
  children,
}: {
  title: string;
  icon: ReactNode;
  position: { x: number; y: number };
  isDragging: boolean;
  onClose: () => void;
  onDragStart: (event: PointerEvent<HTMLDivElement>) => void;
  onDragMove: (event: PointerEvent<HTMLDivElement>) => void;
  onDragEnd: (event: PointerEvent<HTMLDivElement>) => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`pointer-events-auto fixed z-[1250] hidden w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-lg border border-slate-200 bg-white/96 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl transition-shadow md:block ${
        isDragging ? 'shadow-cyan-500/20 ring-2 ring-cyan-300' : ''
      }`}
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex h-14 cursor-grab touch-none items-center justify-between border-b border-slate-200 bg-slate-950 px-4 text-white active:cursor-grabbing"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-cyan-200">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black uppercase tracking-[0.22em] text-white">
              {title}
            </p>
            <p className="mt-0.5 text-[11px] font-bold text-slate-300">Arrastra para mover</p>
          </div>
        </div>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label={`Cerrar ${title}`}
        >
          <PanelRightClose size={17} />
        </button>
      </div>
      {children}
    </div>
  );
}

function FavoritePlacesPanel({ routes }: { routes: FavoriteRoute[] }) {
  return (
    <section className="max-h-[min(420px,calc(100vh-190px))] overflow-y-auto p-4">
      <div className="space-y-3">
        {routes.map((route) => (
          <article
            key={`${route.id}-${route.driverCode ?? route.routeName ?? 'route'}`}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                🚌
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-black text-slate-950">
                  {route.routeName ?? route.name}
                </h3>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  $3.800
                </p>
                <a
                  href={`/user?favoriteRoute=${encodeURIComponent(route.routeName ?? route.name)}`}
                  className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-slate-950 px-3 text-xs font-black text-white"
                >
                  Buscar buses de esta ruta
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HistoryPanel({ items }: { items: RideHistoryItem[] }) {
  return (
    <section className="max-h-[min(420px,calc(100vh-190px))] overflow-y-auto p-4">
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-slate-950">
                  {item.route_name ?? 'Ruta solicitada'}
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Conductor {item.driver_code ?? 'sin asignar'}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString('es-CO')
                    : 'Sin fecha'}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-700">
                {item.status ?? 'pending'}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmptyDockState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <section className="p-4">
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
          {icon}
        </span>
        <h3 className="mt-4 text-base font-black text-slate-950">{title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>
      </div>
    </section>
  );
}
