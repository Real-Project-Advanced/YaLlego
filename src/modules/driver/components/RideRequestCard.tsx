'use client';

import { Check, MapPin, X } from 'lucide-react';
import type { RideRequest } from '../hooks/useRideRequests';

type RideRequestCardProps = {
  request: RideRequest;
  nearestStopName: string;
  distanceKm: number;
  etaMinutes: number;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
};

export function RideRequestCard({
  request,
  nearestStopName,
  distanceKm,
  etaMinutes,
  onAccept,
  onReject,
}: RideRequestCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-slate-950">
            {request.user_name || `Usuario ${request.user_id ?? ''}`.trim() || 'Usuario'}
          </h3>
          <p className="mt-2 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-600">
            <MapPin size={15} className="mt-0.5 shrink-0 text-[#0369a1]" />
            {nearestStopName}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(distanceKm)} km · ~
            {etaMinutes} min hasta la parada
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAccept(request.id)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#047857] text-sm font-black text-white transition hover:bg-emerald-800"
        >
          <Check size={17} />
          Aceptar
        </button>
        <button
          type="button"
          onClick={() => onReject(request.id)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#dc2626] text-sm font-black text-white transition hover:bg-red-700"
        >
          <X size={17} />
          Rechazar
        </button>
      </div>
    </article>
  );
}
