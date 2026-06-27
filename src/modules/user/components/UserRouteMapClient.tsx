'use client';

import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import '@/lib/maps/leaflet-config';
import { medellinBounds } from '@/lib/maps/medellin-bounds';
import { useLiveBuses } from '@/hooks/useLiveBuses';
import type { UserRoute } from '../data/user-dashboard.data';

type UserRouteMapClientProps = {
  routes: UserRoute[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
};

export default function UserRouteMapClient({
  routes,
  selectedRouteId,
  onSelectRoute,
}: UserRouteMapClientProps) {
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];
  const buses = useLiveBuses();

  return (
    <MapContainer
      center={[6.2442, -75.5812]}
      zoom={12}
      minZoom={11}
      maxZoom={18}
      maxBounds={medellinBounds}
      maxBoundsViscosity={1.0}
      className="h-full min-h-[360px] w-full"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {routes.map((route) => {
        const isSelected = route.id === selectedRoute.id;

        return (
          <Polyline
            key={route.id}
            positions={route.coordinates ?? []}
            eventHandlers={{ click: () => onSelectRoute(route.id) }}
            pathOptions={{
              color: route.color,
              opacity: isSelected ? 1 : 0.36,
              weight: isSelected ? 7 : 4,
            }}
          />
        );
      })}

      <Marker position={[selectedRoute.startPoint.lat, selectedRoute.startPoint.lng]}>
        <Popup>
          <strong>{selectedRoute.startPoint.name}</strong>
          <br />
          Inicio de ruta
        </Popup>
      </Marker>

      <Marker position={[selectedRoute.endPoint.lat, selectedRoute.endPoint.lng]}>
        <Popup>
          <strong>{selectedRoute.endPoint.name}</strong>
          <br />
          Destino estimado
        </Popup>
      </Marker>

      {buses.map((bus) => (
        <Marker key={bus.id} position={[bus.location.lat, bus.location.lng]}>
          <Popup>
            <strong>{bus.plate}</strong>
            <br />
            {bus.model} &middot; {bus.capacity} asientos
            {bus.routeId !== undefined && (
              <>
                <br />
                Ruta #{bus.routeId}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
