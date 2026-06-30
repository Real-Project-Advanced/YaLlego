'use client';

import { Plus } from 'lucide-react';

export type FabMenuItem<T extends string> = {
  key: T;
  label: string;
  icon: typeof Plus;
};

type FabMenuProps<T extends string> = {
  items: FabMenuItem<T>[];
  isOpen: boolean;
  isRaised?: boolean;
  activeItem?: T | null;
  onToggle: () => void;
  onSelect: (item: T) => void;
};

export function FabMenu<T extends string>({
  items,
  isOpen,
  isRaised = false,
  activeItem,
  onToggle,
  onSelect,
}: FabMenuProps<T>) {
  return (
    <div
      className="pointer-events-none fixed right-4 z-[1450] flex flex-col items-end transition-[bottom] duration-300 md:hidden"
      style={{ bottom: isRaised ? 'calc(min(58vh, 430px) + 18px)' : '1.25rem' }}
    >
      <div
        className={`mb-3 grid max-h-[calc(100dvh-8.5rem)] grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-900/12 backdrop-blur-xl transition duration-200 [@media(min-height:640px)]:flex [@media(min-height:640px)]:flex-col-reverse [@media(min-height:640px)]:rounded-full ${
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-4 scale-95 opacity-0'
        }`}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`pointer-events-auto grid size-12 origin-bottom place-items-center rounded-full border transition duration-200 ${
                isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'
              } ${
                isActive
                  ? 'border-cyan-400 bg-cyan-50 text-cyan-700 shadow-lg shadow-cyan-500/15'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-700'
              }`}
              style={{ transitionDelay: isOpen ? `${index * 30}ms` : '0ms' }}
              tabIndex={isOpen ? 0 : -1}
              aria-hidden={!isOpen}
              aria-label={item.label}
              aria-pressed={isActive}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`pointer-events-auto grid size-14 place-items-center rounded-full border bg-white text-slate-800 shadow-2xl shadow-slate-900/16 transition ${
          isOpen ? 'border-cyan-300 text-cyan-700' : 'border-slate-200'
        }`}
        aria-label={isOpen ? 'Cerrar menu de acciones' : 'Abrir menu de acciones'}
        aria-expanded={isOpen}
      >
        <Plus size={26} className={`transition duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
