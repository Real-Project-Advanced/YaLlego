'use client';

import dynamic from 'next/dynamic';
import type { DriverPosition } from '../hooks/useDriverTracking';
import type { AcceptedPickup, DriverRoute } from './DriverDashboard';

const DriverRouteMapClient = dynamic(() => import('./DriverRouteMapClient'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[360px] place-items-center bg-slate-100 text-sm font-semibold text-slate-500">
      Cargando mapa del conductor...
    </div>
  ),
});

type DriverRouteMapProps = {
  acceptedPickups: AcceptedPickup[];
  currentPosition: DriverPosition | null;
  driverCode: string;
  isRouteActive: boolean;
  route: DriverRoute;
};

export function DriverRouteMap(props: DriverRouteMapProps) {
  return <DriverRouteMapClient {...props} />;
}
