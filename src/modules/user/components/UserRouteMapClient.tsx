'use client';

import {
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Heart,
  Home,
  Info,
  Landmark,
  MapPin,
  Navigation,
  Route,
  Utensils,
} from 'lucide-react';
import L from 'leaflet';
import { useState, type PointerEvent } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import '@/lib/maps/leaflet-config';
import { medellinBounds } from '@/lib/maps/medellin-bounds';
import {
  getStopLogoOption,
  stopLogoOptions,
  type Parada,
  type SearchRouteResult,
  type StopLogoId,
} from './UserRouteMapShared';

type UserRouteMapClientProps = {
  routes: SearchRouteResult[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  paradas: Parada[];
  onToggleFavoriteParada: (parada: Parada) => void;
  onRouteFromCurrentLocation: (parada: Parada) => void;
  routingStopId?: string;
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
        border-radius:9999px;
        border: 3px solid rgba(255,255,255,0.98);
        background: ${color};
        box-shadow: 0 0 24px 6px rgba(56,189,248,0.35);
        font-weight: bold;
        font-size: 20px;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.4);
      ">${label.charAt(0)}</span>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });

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
          <span class="stop-marker-symbol">${fallbackLabel || logoOption.label[0]}</span>
        </span>
        ${parada.esFavorito ? '<span class="stop-marker-favorite">♥</span>' : ''}
      </span>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 44],
    popupAnchor: [0, -38],
  });
};

export default function UserRouteMapClient({
  routes,
  selectedRouteId,
  onSelectRoute,
  paradas,
  onToggleFavoriteParada,
  onRouteFromCurrentLocation,
  routingStopId,
}: UserRouteMapClientProps) {
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];
  const [activeStop, setActiveStop] = useState<Parada | null>(null);
  const [popupOffset, setPopupOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPopup, setIsDraggingPopup] = useState(false);

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
    <div className="relative z-0 h-full min-h-[360px] overflow-hidden bg-slate-100">
      <MapContainer
        center={[6.2442, -75.5812]}
        zoom={12}
        minZoom={11}
        maxZoom={18}
        maxBounds={medellinBounds}
        maxBoundsViscosity={1.0}
        className="relative z-0 h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {routes.map((route) => {
          const isSelected = route.id === selectedRoute?.id;

          return (
            <Polyline
              key={route.id}
              positions={route.coordinates}
              eventHandlers={{ click: () => onSelectRoute(route.id) }}
              pathOptions={{
                color: '#2563eb',
                opacity: isSelected ? 0.95 : 0.28,
                weight: isSelected ? 7 : 4,
                dashArray: isSelected ? undefined : '14,10',
                lineCap: 'round',
                lineJoin: 'round',
                className: 'route-glow',
              }}
            />
          );
        })}

        {selectedRoute && (
          <>
            <Marker
              position={[selectedRoute.startPoint.lat, selectedRoute.startPoint.lng]}
              icon={createPointIcon('rgba(34,211,238,0.98)', 'Origen')}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <strong>{selectedRoute.startPoint.name}</strong>
                  <p>Origen</p>
                </div>
              </Popup>
            </Marker>

            <Marker
              position={[selectedRoute.endPoint.lat, selectedRoute.endPoint.lng]}
              icon={createPointIcon('rgba(244,63,94,0.95)', 'Destino')}
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
                  className="w-[300px] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-slate-950/20"
                  style={{
                    transform: `translate(${popupOffset.x}px, ${popupOffset.y}px)`,
                  }}
                >
                  <div
                    className="cursor-grab touch-none border-b border-slate-200 bg-slate-950 p-4 text-white active:cursor-grabbing"
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
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0)_26%,rgba(255,255,255,0.45))]" />

      <style jsx global>{`
        .route-glow {
          filter: drop-shadow(0 0 14px rgba(14, 165, 233, 0.32));
        }

        .custom-leaflet-icon,
        .stop-leaflet-icon {
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
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 9999px;
          border: 3px solid #ffffff;
          overflow: hidden;
          background: var(--stop-logo-bg, #ffffff);
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          box-shadow:
            0 16px 34px rgba(15, 23, 42, 0.22),
            0 0 0 7px rgba(255, 255, 255, 0.52);
        }

        .stop-marker-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stop-marker-symbol {
          display: none;
        }

        .stop-marker-active {
          box-shadow:
            0 18px 38px rgba(15, 23, 42, 0.24),
            0 0 0 8px rgba(34, 211, 238, 0.24),
            0 0 0 12px rgba(255, 255, 255, 0.62);
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
          background: #f8fafc;
          z-index: 0;
        }
      `}</style>
    </div>
  );
}
