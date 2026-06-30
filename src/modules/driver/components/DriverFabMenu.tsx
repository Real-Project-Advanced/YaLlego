'use client';

import { Bell, BusFront, Gauge, Plus, UserRound } from 'lucide-react';

export type DriverSheetKey = 'start' | 'requests' | 'data' | 'profile';

type DriverFabMenuProps = {
  activeItem: DriverSheetKey | null;
  isActiveRoute: boolean;
  isOpen: boolean;
  pendingRequests: number;
  onSelect: (item: DriverSheetKey) => void;
  onToggle: () => void;
};

const items: Array<{
  key: DriverSheetKey;
  label: string;
  icon: typeof BusFront;
  color: string;
  activeColor?: string;
}> = [
  { key: 'start', label: 'Iniciar Ruta', icon: BusFront, color: '#047857', activeColor: '#dc2626' },
  { key: 'requests', label: 'Solicitudes', icon: Bell, color: '#dc2626' },
  { key: 'data', label: 'Datos', icon: Gauge, color: '#0369a1' },
  { key: 'profile', label: 'Perfil', icon: UserRound, color: '#1a1a2e' },
];

export function DriverFabMenu({
  activeItem,
  isActiveRoute,
  isOpen,
  pendingRequests,
  onSelect,
  onToggle,
}: DriverFabMenuProps) {
  return (
    <div
      className="pointer-events-none fixed right-4 z-[1450] flex flex-col items-end transition-[bottom] duration-300 md:hidden"
      style={{ bottom: activeItem ? 'calc(min(58vh, 430px) + 18px)' : '1.25rem' }}
    >
      <div
        className={`${isOpen ? 'mb-3 grid' : 'hidden'} grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-900/12 backdrop-blur-xl transition duration-200 [@media(min-height:640px)]:flex [@media(min-height:640px)]:flex-col-reverse [@media(min-height:640px)]:rounded-full ${
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-4 scale-95 opacity-0'
        }`}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;
          const color = item.key === 'start' && isActiveRoute ? item.activeColor : item.color;
          const label = item.key === 'start' && isActiveRoute ? 'Detener Ruta' : item.label;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`pointer-events-auto relative grid size-12 place-items-center rounded-full border text-white shadow-lg transition duration-200 ${
                isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'
              } ${isActive ? 'border-white ring-2 ring-slate-950/20' : 'border-white/70'}`}
              style={{
                backgroundColor: color,
                transitionDelay: isOpen ? `${index * 30}ms` : '0ms',
              }}
              tabIndex={isOpen ? 0 : -1}
              aria-label={label}
              aria-pressed={isActive}
            >
              <Icon size={20} />
              {item.key === 'requests' && pendingRequests > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-black text-[#dc2626] shadow">
                  {pendingRequests}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="pointer-events-auto grid size-14 place-items-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-slate-900/16 transition"
        aria-label={isOpen ? 'Cerrar menu de conductor' : 'Abrir menu de conductor'}
        aria-expanded={isOpen}
      >
        <Plus size={26} className={`transition duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
