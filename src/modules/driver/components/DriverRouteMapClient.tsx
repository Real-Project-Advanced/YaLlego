'use client';

import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { medellinBounds } from '@/lib/maps/medellin-bounds';
import type { DriverPosition } from '../hooks/useDriverTracking';
import { createBusMarkerIcon } from './DriverMarker';
import type { AcceptedPickup, DriverRoute } from './DriverDashboard';
import { createUserRequestMarkerIcon } from './UserRequestMarker';

type DriverRouteMapClientProps = {
  acceptedPickups: AcceptedPickup[];
  currentPosition: DriverPosition | null;
  driverCode: string;
  isRouteActive: boolean;
  route: DriverRoute;
};

const createDriverPositionIcon = () =>
  L.divIcon({
    className: 'driver-position-marker-icon',
    html: `
      <div style="
        width: 34px; height: 34px;
        display: grid; place-items: center;
        border-radius: 50%;
        border: 4px solid white;
        background: #0369a1;
        color: white;
        font-size: 16px;
        box-shadow: 0 0 0 8px rgba(3,105,161,0.18), 0 12px 26px rgba(15,23,42,0.28);
      ">✦</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });

function MapSizeInvalidator() {
  const map = useMap();

  useEffect(() => {
    const invalidateMapSize = () => map.invalidateSize({ animate: false });
    const container = map.getContainer();
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(invalidateMapSize);
    const timeouts = [80, 250, 600, 1200].map((delay) =>
      window.setTimeout(invalidateMapSize, delay),
    );

    invalidateMapSize();
    resizeObserver?.observe(container);
    window.addEventListener('resize', invalidateMapSize);
    window.addEventListener('orientationchange', invalidateMapSize);

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      resizeObserver?.disconnect();
      window.removeEventListener('resize', invalidateMapSize);
      window.removeEventListener('orientationchange', invalidateMapSize);
    };
  }, [map]);

  return null;
}

function RecenterOnDriver({ position }: { position: DriverPosition | null }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [map, position]);

  return null;
}

export default function DriverRouteMapClient({
  acceptedPickups,
  currentPosition,
  driverCode,
  isRouteActive,
  route,
}: DriverRouteMapClientProps) {
  const fallbackCenter: [number, number] = route.coordinates[0] ?? [6.2442, -75.5812];
  const routePositions = isRouteActive ? route.coordinates : [];

  return (
    <div className="relative z-0 h-full min-h-[360px] overflow-hidden bg-[#dff7f4]">
      <MapContainer
        center={fallbackCenter}
        zoom={12}
        minZoom={11}
        maxZoom={18}
        maxBounds={medellinBounds}
        maxBoundsViscosity={1.0}
        className="relative z-0 h-full w-full"
        scrollWheelZoom={false}
      >
        <MapSizeInvalidator />
        <RecenterOnDriver position={currentPosition} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#047857',
              opacity: 1,
              weight: 8,
              lineCap: 'round',
              lineJoin: 'round',
              className: 'driver-route-glow',
            }}
          />
        )}

        {currentPosition && (
          <>
            <Marker
              position={[currentPosition.lat, currentPosition.lng]}
              icon={createDriverPositionIcon()}
            >
              <Popup>Tu posicion actual</Popup>
            </Marker>
            {isRouteActive && (
              <Marker
                position={[currentPosition.lat, currentPosition.lng]}
                icon={createBusMarkerIcon(driverCode)}
              >
                <Popup>{driverCode} en ruta</Popup>
              </Marker>
            )}
          </>
        )}

        {acceptedPickups.map((pickup) => (
          <Marker
            key={pickup.id}
            position={[pickup.lat, pickup.lng]}
            icon={createUserRequestMarkerIcon()}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <strong>{pickup.userName}</strong>
                <p>{pickup.stopName}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0)_24%,rgba(8,145,178,0.08))]" />

      <style jsx global>{`
        .driver-route-glow {
          filter: drop-shadow(0 0 16px rgba(4, 120, 87, 0.44))
            drop-shadow(0 8px 12px rgba(15, 23, 42, 0.18));
        }

        .bus-marker-icon,
        .user-request-marker-icon,
        .driver-position-marker-icon {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-container {
          background: #dff7f4;
          z-index: 0;
        }

        .leaflet-tile {
          filter: saturate(1.14) contrast(1.04);
        }
      `}</style>
    </div>
  );
}
