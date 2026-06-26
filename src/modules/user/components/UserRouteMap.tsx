'use client';

import dynamic from 'next/dynamic';
import type { Parada, SearchRouteResult } from './UserRouteMapShared';

const UserRouteMapClient = dynamic(() => import('./UserRouteMapClient'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[360px] place-items-center bg-slate-100 text-sm font-semibold text-slate-500">
      Cargando mapa de Medellin...
    </div>
  ),
});

type UserRouteMapProps = {
  routes: SearchRouteResult[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  paradas: Parada[];
  onToggleFavoriteParada: (parada: Parada) => void;
  onRouteFromCurrentLocation: (parada: Parada) => void;
  routingStopId?: string;
};

export function UserRouteMap(props: UserRouteMapProps) {
  return <UserRouteMapClient {...props} />;
}
