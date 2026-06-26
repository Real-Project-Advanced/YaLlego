'use client';

import dynamic from 'next/dynamic';
import type { UserRoute } from '../data/user-dashboard.data';

const UserRouteMapClient = dynamic(() => import('./UserRouteMapClient'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[360px] place-items-center bg-slate-100 text-sm font-semibold text-slate-500">
      Loading Medellin map...
    </div>
  ),
});

type UserRouteMapProps = {
  routes: UserRoute[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
};

export function UserRouteMap(props: UserRouteMapProps) {
  return <UserRouteMapClient {...props} />;
}
