'use client';

import type { ReactNode, TouchEvent } from 'react';
import { useState } from 'react';

type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  hideCloseButton?: boolean;
  children: ReactNode;
};

export function BottomSheet({
  open,
  title,
  onClose,
  hideCloseButton = false,
  children,
}: BottomSheetProps) {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragY, setDragY] = useState(0);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartY(event.touches[0]?.clientY ?? null);
    setDragY(0);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartY === null) return;

    const nextDragY = Math.max(0, (event.touches[0]?.clientY ?? touchStartY) - touchStartY);
    setDragY(nextDragY);
  };

  const handleTouchEnd = () => {
    if (dragY > 84) onClose();
    setTouchStartY(null);
    setDragY(0);
  };

  return (
    <section
      className={`fixed inset-x-0 bottom-0 z-[1400] max-h-[58vh] rounded-t-2xl border border-b-0 border-slate-200 bg-white transition-transform duration-300 ease-out md:hidden ${
        open ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ transform: open ? `translateY(${dragY}px)` : undefined }}
      aria-hidden={!open}
    >
      <div
        className="touch-pan-y border-b border-slate-100 px-4 pb-3 pt-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <button
          type="button"
          onClick={onClose}
          className={hideCloseButton ? 'hidden' : 'mx-auto block h-7 w-24 rounded-full'}
          aria-label={`Cerrar ${title}`}
        >
          <span className="mx-auto block h-1.5 w-14 rounded-full bg-slate-300" />
        </button>
        <h2 className="mt-1 text-base font-black text-[#1a1a2e]">{title}</h2>
      </div>

      <div className="max-h-[calc(58vh-72px)] overflow-y-auto px-4 py-4">{children}</div>
    </section>
  );
}
