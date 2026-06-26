'use client';

import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import '@/lib/maps/leaflet-config';
import { medellinBounds } from '@/lib/maps/medellin-bounds';
import type { UserRoute } from '../data/user-dashboard.data';

type UserRouteMapClientProps = {
  routes: UserRoute[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
};

type PopularPoint = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  distance: string;
  status: string;
  closesAt: string;
  priceLevel: string;
  score: number;
  reviews: number;
  accent: string;
  initials: string;
  imageTone: string;
  description: string;
};

const popularPoints: PopularPoint[] = [
  {
    id: 'tesoro',
    name: 'El Tesoro',
    category: 'Centro comercial',
    lat: 6.1973,
    lng: -75.5596,
    distance: '0.7 km',
    status: 'Abierto',
    closesAt: '9:00pm',
    priceLevel: '$$$',
    score: 96,
    reviews: 184,
    accent: '#22d3ee',
    initials: 'ET',
    imageTone: 'linear-gradient(135deg, #bae6fd, #38bdf8 52%, #0f172a)',
    description: 'Punto popular para compras, comida y conexiones hacia el suroriente.',
  },
  {
    id: 'botero',
    name: 'Plaza Botero',
    category: 'Cultura',
    lat: 6.2525,
    lng: -75.5682,
    distance: '0.5 km',
    status: 'Popular ahora',
    closesAt: 'Libre',
    priceLevel: '$',
    score: 100,
    reviews: 312,
    accent: '#f59e0b',
    initials: 'PB',
    imageTone: 'linear-gradient(135deg, #fde68a, #f59e0b 50%, #1e293b)',
    description: 'Zona iconica del centro con alto flujo peatonal y acceso al Metro.',
  },
  {
    id: 'explora',
    name: 'Parque Explora',
    category: 'Plan familiar',
    lat: 6.2704,
    lng: -75.5659,
    distance: '0.4 km',
    status: 'Abierto',
    closesAt: '6:00pm',
    priceLevel: '$$',
    score: 88,
    reviews: 149,
    accent: '#a78bfa',
    initials: 'EX',
    imageTone: 'linear-gradient(135deg, #ddd6fe, #8b5cf6 54%, #111827)',
    description: 'Museo interactivo, acuario y punto fuerte cerca de Universidad.',
  },
  {
    id: 'provenza',
    name: 'Provenza',
    category: 'Gastronomia',
    lat: 6.2089,
    lng: -75.5671,
    distance: '0.3 km',
    status: 'Alta demanda',
    closesAt: '2:00am',
    priceLevel: '$$$$',
    score: 92,
    reviews: 221,
    accent: '#fb7185',
    initials: 'PV',
    imageTone: 'linear-gradient(135deg, #fecdd3, #fb7185 52%, #18181b)',
    description: 'Distrito nocturno con restaurantes, cafes y alta actividad turistica.',
  },
  {
    id: 'estadio',
    name: 'Atanasio Girardot',
    category: 'Deporte',
    lat: 6.2562,
    lng: -75.5902,
    distance: '0.6 km',
    status: 'Evento cercano',
    closesAt: '10:00pm',
    priceLevel: '$$',
    score: 84,
    reviews: 96,
    accent: '#34d399',
    initials: 'AG',
    imageTone: 'linear-gradient(135deg, #bbf7d0, #22c55e 50%, #0f172a)',
    description: 'Complejo deportivo conectado con rutas urbanas y estacion Metro Estadio.',
  },
];

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
        border: 2px solid rgba(148,163,184,0.6);
        background: ${color};
        box-shadow: 0 0 18px 4px rgba(56,189,248,0.28);
      "></span>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });

const createPopularIcon = (point: PopularPoint) =>
  L.divIcon({
    className: 'popular-leaflet-icon',
    html: `
      <span title="${point.name}" class="popular-marker-shell">
        <span class="popular-marker" style="--marker-color: ${point.accent};">
          ${point.initials}
        </span>
        <span class="popular-marker-score">
          ${point.score}
        </span>
      </span>
    `,
    iconSize: [54, 72],
    iconAnchor: [27, 36],
    popupAnchor: [0, -28],
  });

export default function UserRouteMapClient({
  routes,
  selectedRouteId,
  onSelectRoute,
}: UserRouteMapClientProps) {
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden bg-slate-100">
      <MapContainer
        center={[6.2442, -75.5812]}
        zoom={12}
        minZoom={11}
        maxZoom={18}
        maxBounds={medellinBounds}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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

        <Marker
          position={[selectedRoute.startPoint.lat, selectedRoute.startPoint.lng]}
          icon={createPointIcon('rgba(34,211,238,0.98)', 'Inicio de ruta')}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <strong>{selectedRoute.startPoint.name}</strong>
              <p>Inicio de ruta</p>
            </div>
          </Popup>
        </Marker>

        <Marker
          position={[selectedRoute.endPoint.lat, selectedRoute.endPoint.lng]}
          icon={createPointIcon('rgba(168,85,247,0.95)', 'Destino estimado')}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <strong>{selectedRoute.endPoint.name}</strong>
              <p>Destino estimado</p>
            </div>
          </Popup>
        </Marker>

        {popularPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createPopularIcon(point)}
            eventHandlers={{
              mouseover: (event) => event.target.openPopup(),
              click: (event) => event.target.openPopup(),
            }}
          >
            <Popup className="popular-point-popup" closeButton={false} minWidth={390}>
              <article className="w-[390px] overflow-hidden rounded-[24px] border border-white/10 bg-[#17171d] p-3 text-white shadow-2xl shadow-slate-950/40">
                <div className="flex gap-3">
                  <div
                    className="relative h-[122px] w-[126px] shrink-0 overflow-hidden rounded-[18px]"
                    style={{ background: point.imageTone }}
                  >
                    <div className="absolute inset-x-4 bottom-4 h-10 rounded-xl bg-white/20 backdrop-blur-sm" />
                    <div className="absolute left-4 top-4 grid size-12 place-items-center rounded-full bg-white text-sm font-black text-slate-950 shadow-xl">
                      {point.initials}
                    </div>
                    <div className="absolute bottom-4 right-4 grid size-8 place-items-center rounded-full bg-slate-950/80 text-xs font-black text-white">
                      {point.score}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 py-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-white">{point.name}</p>
                        <p className="mt-1 text-xs font-bold text-neutral-400">{point.category}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-950">
                        {point.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {['#60a5fa', '#34d399', '#fb7185'].map((color) => (
                          <span
                            key={color}
                            className="size-6 rounded-full border-2 border-[#17171d]"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-neutral-300">
                        {point.reviews} reviews
                      </span>
                      <span className="ml-auto text-xs font-black text-sky-200">★★★★★</span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-black text-white">
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center">
                        {point.distance}
                      </span>
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center">
                        {point.closesAt}
                      </span>
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center">
                        {point.priceLevel}
                      </span>
                    </div>

                    <p className="popular-point-description mt-3 text-xs font-medium leading-5 text-neutral-300">
                      {point.description}
                    </p>
                  </div>
                </div>

                <a
                  href={`/user/history?point=${point.id}`}
                  className="mt-3 flex h-11 items-center justify-center rounded-[14px] border border-white/15 bg-white/5 text-sm font-black text-white transition hover:border-cyan-300 hover:bg-cyan-400 hover:text-slate-950"
                >
                  Mas detalles
                </a>
              </article>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0)_26%,rgba(255,255,255,0.45))]" />

      <style jsx global>{`
        .route-glow {
          filter: drop-shadow(0 0 14px rgba(14, 165, 233, 0.32));
        }

        .custom-leaflet-icon {
          background: transparent !important;
          border: none !important;
        }

        .popular-leaflet-icon {
          background: transparent !important;
          border: none !important;
        }

        .popular-marker-shell {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .popular-marker {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 9999px;
          border: 3px solid #ffffff;
          background: var(--marker-color);
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          box-shadow:
            0 16px 34px rgba(15, 23, 42, 0.18),
            0 0 0 7px rgba(255, 255, 255, 0.46);
        }

        .popular-marker-score {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 42px;
          height: 24px;
          border-radius: 9999px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: rgba(255, 255, 255, 0.94);
          color: #0f172a;
          font-size: 11px;
          font-weight: 900;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.16);
        }

        .popular-point-popup .leaflet-popup-content-wrapper,
        .popular-point-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
          border-radius: 18px;
          background: transparent;
          box-shadow: none;
        }

        .popular-point-popup .leaflet-popup-tip-container {
          display: none;
        }

        .popular-point-description {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .leaflet-container {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
}
