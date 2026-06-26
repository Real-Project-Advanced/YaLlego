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
      style={{ bottom: isRaised ? 'calc(min(58vh, 430px) + 20px)' : '1.25rem' }}
    >
      <div className="mb-3 flex flex-col-reverse items-end gap-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`pointer-events-auto flex h-11 origin-bottom-right items-center gap-2 transition duration-200 ${
                isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'
              }`}
              style={{ transitionDelay: isOpen ? `${index * 30}ms` : '0ms' }}
              tabIndex={isOpen ? 0 : -1}
              aria-hidden={!isOpen}
            >
              <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900">
                {item.label}
              </span>
              <span
                className={`grid size-11 place-items-center rounded-full border transition ${
                  isActive
                    ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white'
                    : 'border-slate-200 bg-white text-[#1a1a2e]'
                }`}
              >
                <Icon size={19} />
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="pointer-events-auto grid size-14 place-items-center rounded-full bg-[#1a1a2e] text-white transition"
        aria-label={isOpen ? 'Cerrar menu de acciones' : 'Abrir menu de acciones'}
        aria-expanded={isOpen}
      >
        <Plus size={26} className={`transition duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
