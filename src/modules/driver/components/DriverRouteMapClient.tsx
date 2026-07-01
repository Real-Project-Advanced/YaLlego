'use client';

import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Pane, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { medellinBounds } from '@/lib/maps/medellin-bounds';
import type { DriverPosition } from '../hooks/useDriverTracking';
import { createBusMarkerIcon } from './DriverMarker';
import type { AcceptedPickup, DriverRoute } from './DriverDashboard';

type DriverRouteMapClientProps = {
  acceptedPickups: AcceptedPickup[];
  currentPosition: DriverPosition | null;
  driverCode: string;
  isRouteActive: boolean;
  route: DriverRoute;
};

type NavigationRouteResponse = {
  coordinates?: unknown;
};

type CachedRoadRoute = {
  routeQuery: string;
  coordinates: [number, number][] | null;
};

type RoutePhase = 'outbound' | 'returning';

type TileProvider = 'osm' | 'carto';

const tileLayers: Record<TileProvider, { attribution: string; subdomains: string; url: string }> = {
  osm: {
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  carto: {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  },
};

const isLatLng = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length >= 2 &&
  typeof value[0] === 'number' &&
  typeof value[1] === 'number' &&
  Number.isFinite(value[0]) &&
  Number.isFinite(value[1]);

const isLatLngList = (value: unknown): value is [number, number][] =>
  Array.isArray(value) && value.length > 1 && value.every(isLatLng);

const distanceInKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const radiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return radiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const createDriverPositionIcon = () =>
  L.divIcon({
    className: 'driver-position-marker-icon',
    html: `
      <div style="position: relative; width: 44px; height: 54px;">
        <span style="
          position: absolute;
          left: 50%;
          top: -20px;
          transform: translateX(-50%);
          white-space: nowrap;
          border-radius: 999px;
          border: 2px solid white;
          background: #0369a1;
          padding: 3px 8px;
          color: white;
          font-size: 10px;
          font-weight: 950;
          line-height: 1;
          box-shadow: 0 10px 20px rgba(15,23,42,0.24);
        ">Estoy aqui</span>
        <div style="
          width: 38px; height: 38px;
          display: grid; place-items: center;
          border-radius: 50%;
          border: 4px solid white;
          background: #0369a1;
          color: white;
          font-size: 16px;
          box-shadow: 0 0 0 8px rgba(3,105,161,0.18), 0 12px 26px rgba(15,23,42,0.28);
        ">✦</div>
      </div>
    `,
    iconSize: [44, 54],
    iconAnchor: [19, 32],
    popupAnchor: [0, -18],
  });

const createPickupMarkerIcon = () =>
  L.divIcon({
    className: 'user-request-marker-icon',
    html: `
      <div style="position: relative; width: 54px; height: 58px;">
        <span style="
          position: absolute;
          left: 50%;
          top: -22px;
          transform: translateX(-50%);
          white-space: nowrap;
          border-radius: 999px;
          border: 2px solid white;
          background: #be123c;
          padding: 3px 8px;
          color: white;
          font-size: 10px;
          font-weight: 950;
          line-height: 1;
          box-shadow: 0 10px 20px rgba(15,23,42,0.24);
        ">Usuario a recoger</span>
        <div style="
          width: 42px; height: 42px;
          display: grid; place-items: center;
          border-radius: 50%;
          border: 3px solid white;
          background: #be123c;
          color: white;
          font-size: 20px;
          box-shadow: 0 12px 26px rgba(15,23,42,0.28);
        ">👤</div>
      </div>
    `,
    iconSize: [54, 58],
    iconAnchor: [21, 34],
    popupAnchor: [0, -28],
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

export default function DriverRouteMapClient({
  acceptedPickups,
  currentPosition,
  driverCode,
  isRouteActive,
  route,
}: DriverRouteMapClientProps) {
  const [cachedRoadRoute, setCachedRoadRoute] = useState<CachedRoadRoute | null>(null);
  const [routePhase, setRoutePhase] = useState<RoutePhase>('outbound');
  const [tileProvider, setTileProvider] = useState<TileProvider>('osm');
  const fallbackCenter: [number, number] = route.coordinates[0] ?? [6.2442, -75.5812];
  const tileLayer = tileLayers[tileProvider];
  const routeOrigin = route.coordinates[0] ?? null;
  const routeDestination = route.coordinates[route.coordinates.length - 1] ?? null;
  const routeTarget = routePhase === 'returning' ? routeOrigin : routeDestination;
  const currentLat = currentPosition ? currentPosition.lat.toFixed(5) : '';
  const currentLng = currentPosition ? currentPosition.lng.toFixed(5) : '';
  const routeQuery = useMemo(() => {
    if (!isRouteActive || !currentLat || !currentLng || !routeTarget) return null;

    const params = new URLSearchParams({
      originLat: currentLat,
      originLng: currentLng,
      destinationLat: String(routeTarget[0]),
      destinationLng: String(routeTarget[1]),
    });
    if (routePhase === 'returning') {
      params.set('returning', '1');
    }

    return `/api/navigation/route?${params.toString()}`;
  }, [currentLat, currentLng, isRouteActive, routePhase, routeTarget]);
  const roadCoordinates =
    cachedRoadRoute?.routeQuery === routeQuery ? cachedRoadRoute.coordinates : null;
  const routePositions = isRouteActive && currentPosition ? (roadCoordinates ?? []) : [];

  useEffect(() => {
    if (!isRouteActive) {
      const resetTimer = window.setTimeout(() => setRoutePhase('outbound'), 0);
      return () => window.clearTimeout(resetTimer);
    }

    if (!currentPosition || !routeDestination) return;

    const distanceToDestination = distanceInKm(currentPosition, {
      lat: routeDestination[0],
      lng: routeDestination[1],
    });

    if (routePhase === 'outbound' && distanceToDestination <= 0.08) {
      const returnTimer = window.setTimeout(() => {
        setRoutePhase('returning');
        setCachedRoadRoute(null);
      }, 0);
      return () => window.clearTimeout(returnTimer);
    }
  }, [currentPosition, isRouteActive, routeDestination, routePhase]);

  useEffect(() => {
    if (!routeQuery) return;

    const controller = new AbortController();
    const currentRouteQuery = routeQuery;

    async function loadRoadRoute() {
      try {
        const response = await fetch(currentRouteQuery, { signal: controller.signal });
        if (!response.ok) {
          setCachedRoadRoute({ routeQuery: currentRouteQuery, coordinates: null });
          return;
        }

        const payload = (await response.json()) as NavigationRouteResponse;
        setCachedRoadRoute({
          routeQuery: currentRouteQuery,
          coordinates: isLatLngList(payload.coordinates) ? payload.coordinates : null,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setCachedRoadRoute({ routeQuery: currentRouteQuery, coordinates: null });
      }
    }

    void loadRoadRoute();

    return () => controller.abort();
  }, [routeQuery]);

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
        zoomControl={false}
      >
        <MapSizeInvalidator />
        <TileLayer
          key={tileProvider}
          attribution={tileLayer.attribution}
          eventHandlers={{
            tileerror: () => setTileProvider((current) => (current === 'osm' ? 'carto' : current)),
          }}
          subdomains={tileLayer.subdomains}
          url={tileLayer.url}
        />
        <Pane name="driver-route-line-pane" style={{ zIndex: 420 }} />
        <Pane name="driver-position-pane" style={{ zIndex: 760 }} />
        <Pane name="driver-pickup-pane" style={{ zIndex: 780 }} />

        {routePositions.length > 1 && (
          <Polyline
            pane="driver-route-line-pane"
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
              pane="driver-position-pane"
              position={[currentPosition.lat, currentPosition.lng]}
              icon={createDriverPositionIcon()}
            >
              <Popup>Tu posicion actual</Popup>
            </Marker>
            {isRouteActive && (
              <Marker
                pane="driver-position-pane"
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
            pane="driver-pickup-pane"
            position={[pickup.lat, pickup.lng]}
            icon={createPickupMarkerIcon()}
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
        .driver-position-marker-icon,
        .driver-route-target-marker-icon {
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
