'use client';

import { MapContainer, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import '@/lib/maps/leaflet-config';
import { medellinBounds } from '@/lib/maps/medellin-bounds';
import { mockRoutes } from '@/lib/maps/mock-routes';
import { useLiveBuses } from '@/hooks/useLiveBuses';

import RoutePolyline from './RoutePolyline';
import BusMarker from './BusMarker';
import RouteSidebar from './RouteSidebar';

export default function MapView() {
  const buses = useLiveBuses();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="flex-1 h-full min-h-0">
        <MapContainer
          center={[6.2442, -75.5812]}
          zoom={13}
          minZoom={11}
          maxZoom={18}
          maxBounds={medellinBounds}
          maxBoundsViscosity={1.0}
          style={{
            height: '100%',
            width: '100%',
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mockRoutes.map((route) => (
            <RoutePolyline key={route.id} route={route} />
          ))}

          {buses.map((bus) => (
            <BusMarker key={bus.id} bus={bus} />
          ))}
        </MapContainer>
      </div>

      <RouteSidebar />
    </div>
  );
}
