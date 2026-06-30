'use client';

import { BusFront } from 'lucide-react';

type DriverBannerProps = {
  driverCode: string;
  routeName: string;
  isActive: boolean;
};

export function DriverBanner({ driverCode, routeName, isActive }: DriverBannerProps) {
  return (
    <section className="absolute left-1/2 top-4 z-[1200] w-[min(calc(100vw-24px),720px)] -translate-x-1/2 rounded-lg border border-white/80 bg-white/94 px-4 py-3 shadow-2xl shadow-slate-950/14 backdrop-blur-2xl">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#1a1a2e] text-white">
            <BusFront size={22} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950 sm:text-base">
              [{driverCode}] {routeName}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${
            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <span
            className={`size-2 rounded-full ${isActive ? 'animate-pulse bg-emerald-600' : 'bg-slate-400'}`}
          />
          {isActive ? 'En ruta' : 'En espera'}
        </span>
      </div>
    </section>
  );
}
