'use client';

import dynamic from 'next/dynamic';
import type { MapPoi, SearchRouteResult } from './UserRouteMapClient';

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
  pois: MapPoi[];
  favoritePoiIds: string[];
  onToggleFavoritePoi: (poi: MapPoi) => void;
};

export function UserRouteMap(props: UserRouteMapProps) {
  return <UserRouteMapClient {...props} />;
}
