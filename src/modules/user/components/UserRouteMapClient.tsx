'use client';

import { Heart, Info, Navigation, Route } from 'lucide-react';
import L from 'leaflet';
import { useEffect, useMemo, useState, type PointerEvent } from 'react';
import { MapContainer, Marker, Pane, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { medellinBounds } from '@/lib/maps/medellin-bounds';
import { createBusMarkerIcon } from '@/modules/driver/components';
import {
  getStopLogoOption,
  type ActiveDriverLocation,
  type Parada,
  type SearchRouteResult,
} from './UserRouteMapShared';
import type { DriverLocation } from '../hooks/useDriverLocations';

type UserRouteMapClientProps = {
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

const createPointIcon = (color: string, label: string) =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <span title="${label}" style="
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:48px;
        height:48px;
        border-radius:18px 18px 18px 4px;
        border: 3px solid rgba(255,255,255,0.98);
        background: ${color};
        box-shadow: 0 18px 34px rgba(15,23,42,0.28), 0 0 0 7px rgba(255,255,255,0.55);
        font-weight: bold;
        font-size: 20px;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.4);
        transform: rotate(-45deg);
      "><span style="transform: rotate(45deg); display:inline-block;">
        ${label.charAt(0)}
      </span></span>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });

const isSameMapPoint = (
  first?: SearchRouteResult['startPoint'] | null,
  second?: SearchRouteResult['startPoint'] | null,
) =>
  Boolean(
    first &&
    second &&
    Math.abs(first.lat - second.lat) < 0.00005 &&
    Math.abs(first.lng - second.lng) < 0.00005,
  );

const createStopIcon = (parada: Parada, isActive: boolean) => {
  const fallbackLabel = parada.titulo
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const logoOption = getStopLogoOption(parada.logoId);

  return L.divIcon({
    className: 'stop-leaflet-icon',
    html: `
      <span title="${parada.titulo}" class="stop-marker-shell">
        <span class="stop-marker ${isActive ? 'stop-marker-active' : ''}" style="--stop-logo-bg: ${logoOption.color};">
          <span class="stop-marker-symbol">${fallbackLabel || logoOption.label.slice(0, 2).toUpperCase()}</span>
        </span>
        ${parada.esFavorito ? '<span class="stop-marker-favorite">♥</span>' : ''}
      </span>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 44],
    popupAnchor: [0, -38],
  });
};

function MapSizeInvalidator() {
  const map = useMap();

  useEffect(() => {
    const invalidateMapSize = () => {
      map.invalidateSize({ animate: false });
    };
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

export default function UserRouteMapClient({
  routes,
  selectedRouteId,
  currentLocation,
  paradas,
  onToggleFavoriteParada,
  onRouteFromCurrentLocation,
  activeDrivers = [],
  onSelectDriver,
  onRequestDriver,
  onFavoriteDriverRoute,
  driverLocations = [],
  requestedDriverCode,
  isSendingRequest = false,
  routingStopId,
  selectedDriverCode,
  showRouteLines = false,
}: UserRouteMapClientProps) {
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];
  const routeStartsAtCurrentLocation = isSameMapPoint(currentLocation, selectedRoute?.startPoint);
  const [activeStop, setActiveStop] = useState<Parada | null>(null);
  const [tileProvider, setTileProvider] = useState<TileProvider>('osm');
  const [popupOffset, setPopupOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPopup, setIsDraggingPopup] = useState(false);
  const tileLayer = tileLayers[tileProvider];
  const visibleDrivers = useMemo(() => {
    const byCode = new Map<string, ActiveDriverLocation>();

    for (const driver of activeDrivers) {
      byCode.set(driver.driverCode, driver);
    }

    for (const driver of driverLocations) {
      if (byCode.has(driver.driver_code)) continue;

      byCode.set(driver.driver_code, {
        driverCode: driver.driver_code,
        driverId: Number(driver.driver_id) || null,
        routeName: driver.route_name,
        lat: driver.lat,
        lng: driver.lng,
        price: 3800,
      });
    }

    return Array.from(byCode.values());
  }, [activeDrivers, driverLocations]);

  const openStopPopup = (parada: Parada, event: L.LeafletMouseEvent) => {
    if (activeStop?.id !== parada.id) {
      setPopupOffset({ x: 0, y: 0 });
    }

    setActiveStop(parada);
    event.target.openPopup();
  };

  const handlePopupDragStart = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
    setIsDraggingPopup(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePopupDragMove = (event: PointerEvent<HTMLElement>) => {
    if (!isDraggingPopup) return;

    event.stopPropagation();
    setPopupOffset((current) => ({
      x: current.x + event.movementX,
      y: current.y + event.movementY,
    }));
  };

  const handlePopupDragEnd = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDraggingPopup(false);
  };

  return (
    <div className="relative z-0 h-full min-h-90 overflow-hidden bg-[#dff7f4]">
      <MapContainer
        center={[6.2442, -75.5812]}
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

        <Pane name="user-route-line-pane" style={{ zIndex: 420 }} />
        <Pane name="user-stop-pane" style={{ zIndex: 520 }} />
        <Pane name="user-bus-pane" style={{ zIndex: 760 }} />

        {selectedRoute && (
          <>
            {showRouteLines && selectedRoute.coordinates.length > 1 && (
              <Polyline
                pane="user-route-line-pane"
                positions={selectedRoute.coordinates}
                pathOptions={{
                  color: '#0891b2',
                  opacity: 0.92,
                  weight: 7,
                  lineCap: 'round',
                  lineJoin: 'round',
                  className: 'route-glow',
                }}
              />
            )}
            <Marker
              pane="user-stop-pane"
              position={[selectedRoute.startPoint.lat, selectedRoute.startPoint.lng]}
              icon={createPointIcon(
                'linear-gradient(135deg,#06b6d4,#0891b2)',
                routeStartsAtCurrentLocation ? 'Mi ubicacion actual' : 'Origen',
              )}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <strong>{selectedRoute.startPoint.name}</strong>
                  <p>{routeStartsAtCurrentLocation ? 'Mi ubicacion actual' : 'Origen'}</p>
                </div>
              </Popup>
            </Marker>

            <Marker
              pane="user-stop-pane"
              position={[selectedRoute.endPoint.lat, selectedRoute.endPoint.lng]}
              icon={createPointIcon('linear-gradient(135deg,#f43f5e,#be123c)', 'Destino')}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <strong>{selectedRoute.endPoint.name}</strong>
                  <p>Destino</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {paradas.map((parada) => {
          const isActive = activeStop?.id === parada.id;
          const LogoIcon = getStopLogoOption(parada.logoId).icon;
          const logoColor = getStopLogoOption(parada.logoId).color;

          return (
            <Marker
              key={parada.id}
              pane="user-stop-pane"
              position={[parada.latitud, parada.longitud]}
              icon={createStopIcon(parada, isActive)}
              eventHandlers={{
                mouseover: (event) => openStopPopup(parada, event),
                click: (event) => openStopPopup(parada, event),
              }}
            >
              <Popup
                className="stop-popup"
                closeButton={false}
                minWidth={300}
                eventHandlers={{
                  add: () => setActiveStop(parada),
                  remove: () => {
                    setActiveStop((current) => (current?.id === parada.id ? null : current));
                  },
                }}
              >
                <article
                  className="w-90 overflow-hidden rounded-lg border border-cyan-100 bg-white text-slate-950 shadow-2xl shadow-cyan-950/20"
                  style={{
                    transform: `translate(${popupOffset.x}px, ${popupOffset.y}px)`,
                  }}
                >
                  <div
                    className="cursor-grab touch-none border-b border-cyan-900/20 bg-[linear-gradient(135deg,#0f172a,#0e7490)] p-4 text-white active:cursor-grabbing"
                    onPointerDown={handlePopupDragStart}
                    onPointerMove={handlePopupDragMove}
                    onPointerUp={handlePopupDragEnd}
                    onPointerCancel={handlePopupDragEnd}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-white text-sm font-black text-slate-950 shadow-lg">
                        <span
                          className="grid h-full w-full place-items-center"
                          style={{ backgroundColor: logoColor }}
                        >
                          <LogoIcon size={22} />
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
                          Parada
                        </p>
                        <h3 className="mt-2 text-lg font-black leading-tight">{parada.titulo}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-600">
                      <Info size={16} className="mt-1 shrink-0 text-cyan-700" />
                      {parada.descripcion}
                    </p>
                    {parada.informacionAdicional && (
                      <p className="rounded-lg bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-600">
                        {parada.informacionAdicional}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleFavoriteParada(parada)}
                      className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-black transition ${
                        parada.esFavorito
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-slate-950 text-white hover:bg-cyan-700'
                      }`}
                    >
                      <Heart size={17} fill={parada.esFavorito ? 'currentColor' : 'none'} />
                      {parada.esFavorito ? 'Quitar favorito' : 'Guardar a Favoritos'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRouteFromCurrentLocation(parada)}
                      disabled={routingStopId === parada.id}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-800 transition hover:border-cyan-400 hover:bg-cyan-50 disabled:cursor-wait disabled:text-slate-400"
                    >
                      {routingStopId === parada.id ? <Route size={17} /> : <Navigation size={17} />}
                      {routingStopId === parada.id ? 'Calculando ruta' : 'Como llegar'}
                    </button>
                  </div>
                </article>
              </Popup>
            </Marker>
          );
        })}

        {visibleDrivers.map((driver) => {
          const isSelected = selectedDriverCode === driver.driverCode;
          const isRequested = requestedDriverCode === driver.driverCode;
          const eta = driver.estimatedDuration ?? selectedRoute?.duration ?? 8;
          const price = driver.price ?? 3800;

          return (
            <Marker
              key={driver.driverCode}
              pane="user-bus-pane"
              position={[driver.lat, driver.lng]}
              icon={createBusMarkerIcon(
                driver.driverCode,
                driver.isHighlighted || isSelected,
                'EL BUS',
              )}
              eventHandlers={{
                click: () => onSelectDriver?.(driver),
              }}
            >
              <Popup minWidth={260}>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-base text-slate-950">{driver.driverCode}</strong>
                    <p className="mt-1 font-semibold text-slate-600">{driver.routeName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-black text-slate-700">
                    <span className="rounded-lg bg-slate-50 p-2">~{Math.round(eta)} min</span>
                    <span className="rounded-lg bg-slate-50 p-2">
                      ${new Intl.NumberFormat('es-CO').format(price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDriver?.(driver);
                      onRequestDriver?.(driver);
                    }}
                    disabled={isRequested || isSendingRequest}
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-emerald-600 px-3 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {isRequested
                      ? 'Solicitud enviada ✓'
                      : isSendingRequest
                        ? 'Enviando'
                        : 'Solicitar este bus'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDriver?.(driver);
                      onFavoriteDriverRoute?.(driver);
                    }}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 transition hover:border-rose-300 hover:text-rose-700"
                  >
                    <Heart size={15} />
                    Guardar en favoritos
                  </button>
                  {isSelected && (
                    <p className="rounded-lg bg-emerald-50 p-2 text-xs font-bold text-emerald-700">
                      Bus seleccionado
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0)_24%,rgba(8,145,178,0.08))]" />

      <style jsx global>{`
        .route-glow {
          filter: drop-shadow(0 0 16px rgba(8, 145, 178, 0.52))
            drop-shadow(0 8px 12px rgba(15, 23, 42, 0.18));
        }

        .custom-leaflet-icon,
        .stop-leaflet-icon,
        .bus-marker-icon {
          background: transparent !important;
          border: none !important;
        }

        .stop-marker-shell {
          position: relative;
          display: inline-grid;
          place-items: center;
        }

        .stop-marker {
          display: grid;
          width: 46px;
          height: 46px;
          place-items: center;
          border-radius: 17px 17px 17px 5px;
          border: 3px solid #ffffff;
          overflow: hidden;
          background: var(--stop-logo-bg, #ffffff);
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          transform: rotate(-45deg);
          box-shadow:
            0 18px 34px rgba(15, 23, 42, 0.26),
            0 0 0 7px rgba(255, 255, 255, 0.5);
        }

        .stop-marker-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stop-marker-symbol {
          display: block;
          transform: rotate(45deg);
          letter-spacing: 0;
        }

        .stop-marker-active {
          box-shadow:
            0 20px 42px rgba(15, 23, 42, 0.3),
            0 0 0 8px rgba(34, 211, 238, 0.32),
            0 0 0 13px rgba(255, 255, 255, 0.65);
        }

        .stop-marker-favorite {
          position: absolute;
          right: -5px;
          top: -7px;
          display: grid;
          width: 20px;
          height: 20px;
          place-items: center;
          border-radius: 9999px;
          background: #e11d48;
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
          box-shadow: 0 8px 18px rgba(225, 29, 72, 0.32);
        }

        .stop-popup .leaflet-popup-content-wrapper,
        .stop-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
          border-radius: 8px;
          background: transparent;
          box-shadow: none;
        }

        .stop-popup .leaflet-popup-tip-container {
          display: none;
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
