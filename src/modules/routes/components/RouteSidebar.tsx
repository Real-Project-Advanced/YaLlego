'use client';

import { mockRoutes } from '@/lib/maps/mock-routes';
import RouteCard from './RouteCard';

export default function RouteSidebar() {
  return (
    <aside className="w-80 overflow-y-auto border-l bg-white p-4">
      <h2 className="mb-4 text-xl font-bold">Available routes</h2>

      <div className="space-y-4">
        {mockRoutes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </aside>
  );
}
