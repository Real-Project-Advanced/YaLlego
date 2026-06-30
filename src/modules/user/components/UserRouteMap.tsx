'use client';

import dynamic from 'next/dynamic';
import type { ActiveDriverLocation, Parada, SearchRouteResult } from './UserRouteMapShared';
import type { DriverLocation } from '../hooks/useDriverLocations';

const UserRouteMapClient = dynamic(() => import('./UserRouteMapClient'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[360px] place-items-center bg-slate-100 text-sm font-semibold text-slate-500">
      Loading Medellin map...
    </div>
  ),
});

type UserRouteMapProps = {
  routes: SearchRouteResult[];
  selectedRouteId: string;
  currentLocation?: SearchRouteResult['startPoint'] | null;
  onSelectRoute: (routeId: string) => void;
  paradas: Parada[];
  onToggleFavoriteParada: (parada: Parada) => void;
  onRouteFromCurrentLocation: (parada: Parada) => void;
  activeDrivers?: ActiveDriverLocation[];
  onSelectDriver?: (driver: ActiveDriverLocation) => void;
  onRequestDriver?: (driver: ActiveDriverLocation) => void;
  onFavoriteDriverRoute?: (driver: ActiveDriverLocation) => void;
  driverLocations?: DriverLocation[];
  onSendRideRequest?: (driver: DriverLocation) => void;
  onSaveFavorite?: (driver: DriverLocation) => void;
  requestedDriverCode?: string;
  isSendingRequest?: boolean;
  routingStopId?: string;
  selectedDriverCode?: string;
  showRouteLines?: boolean;
};

export function UserRouteMap(props: UserRouteMapProps) {
  return <UserRouteMapClient {...props} />;
}
