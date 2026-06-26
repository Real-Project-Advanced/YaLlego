'use client';

import { Heart, Info, MapPin } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import '@/lib/maps/leaflet-config';
import { medellinBounds } from '@/lib/maps/medellin-bounds';

export type SearchRouteResult = {
  id: string;
  name: string;
  startPoint: {
    name: string;
    lat: number;
    lng: number;
  };
  endPoint: {
    name: string;
    lat: number;
    lng: number;
  };
  distance: number;
  duration: number;
  coordinates: [number, number][];
};

export type MapPoi = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  detail: string;
  source?: 'osm' | 'custom';
};

type UserRouteMapClientProps = {
  routes: SearchRouteResult[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  pois: MapPoi[];
  favoritePoiIds: string[];
  onToggleFavoritePoi: (poi: MapPoi) => void;
};

const categoryColors: Record<string, string> = {
  Restaurante: '#fb7185',
  Cafe: '#f59e0b',
  Compras: '#22c55e',
  Turismo: '#8b5cf6',
  Servicio: '#38bdf8',
  Personal: '#0f172a',
  Lugar: '#64748b',
};

const createPointIcon = (color: string, label: string) =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <span title="${label}" style="
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:22px;
        height:22px;
        border-radius:9999px;
        border: 2px solid rgba(255,255,255,0.95);
        background: ${color};
        box-shadow: 0 0 18px 4px rgba(56,189,248,0.28);
      "></span>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });

const createPoiIcon = (poi: MapPoi, isFavorite: boolean) => {
  const color = categoryColors[poi.category] ?? categoryColors.Lugar;
  const markerLabel =
    poi.source === 'custom'
      ? '+'
      : poi.category === 'Turismo'
        ? 'T'
        : poi.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join('')
            .toUpperCase();

  return L.divIcon({
    className: 'poi-leaflet-icon',
    html: `
      <span title="${poi.name}" class="poi-marker-shell">
        <span class="poi-marker" style="--poi-color: ${color};">
          ${markerLabel || 'P'}
        </span>
        ${isFavorite ? '<span class="poi-marker-favorite">♥</span>' : ''}
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
  pois,
  favoritePoiIds,
  onToggleFavoritePoi,
}: UserRouteMapClientProps) {
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];

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

        {pois.map((poi) => {
          const isFavorite = favoritePoiIds.includes(poi.id);

          return (
            <Marker
              key={poi.id}
              position={[poi.lat, poi.lng]}
              icon={createPoiIcon(poi, isFavorite)}
              eventHandlers={{
                mouseover: (event) => event.target.openPopup(),
                click: (event) => event.target.openPopup(),
              }}
            >
              <Popup className="poi-popup" closeButton={false} minWidth={300}>
                <article className="w-[300px] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-slate-950/20">
                  <div className="border-b border-slate-200 bg-slate-950 p-4 text-white">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
                      {poi.source === 'custom' ? 'Punto turistico creado' : poi.category}
                    </p>
                    <h3 className="mt-2 text-lg font-black leading-tight">{poi.name}</h3>
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-600">
                      <Info size={16} className="mt-1 shrink-0 text-cyan-700" />
                      {poi.detail}
                    </p>
                    <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <MapPin size={15} />
                      {poi.lat.toFixed(5)}, {poi.lng.toFixed(5)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onToggleFavoritePoi(poi)}
                      className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-black transition ${
                        isFavorite
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-slate-950 text-white hover:bg-cyan-700'
                      }`}
                    >
                      <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
                      {isFavorite ? 'Quitar de favoritos' : 'Guardar favorito'}
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
        .poi-leaflet-icon {
          background: transparent !important;
          border: none !important;
        }

        .poi-marker-shell {
          position: relative;
          display: inline-grid;
          place-items: center;
        }

        .poi-marker {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 9999px;
          border: 3px solid #ffffff;
          background: var(--poi-color);
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          box-shadow:
            0 16px 34px rgba(15, 23, 42, 0.22),
            0 0 0 7px rgba(255, 255, 255, 0.52);
        }

        .poi-marker-favorite {
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

        .poi-popup .leaflet-popup-content-wrapper,
        .poi-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
          border-radius: 8px;
          background: transparent;
          box-shadow: none;
        }

        .poi-popup .leaflet-popup-tip-container {
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
