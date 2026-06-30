'use client';

import { BusFront, Square } from 'lucide-react';

type StartRouteButtonProps = {
  isActive: boolean;
  onOpen: () => void;
};

export function StartRouteButton({ isActive, onOpen }: StartRouteButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="absolute bottom-24 left-1/2 z-[1200] inline-flex h-14 -translate-x-1/2 items-center justify-center gap-2 rounded-full px-6 text-sm font-black text-white shadow-2xl shadow-slate-950/22 transition active:scale-95 md:bottom-10"
      style={{ backgroundColor: isActive ? '#dc2626' : '#047857' }}
    >
      {isActive ? <Square size={18} fill="currentColor" /> : <BusFront size={20} />}
      {isActive ? 'Detener Ruta' : 'Iniciar Ruta'}
    </button>
  );
}
