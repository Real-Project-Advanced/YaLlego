'use client';

import Link from 'next/link';
import { Heart, MapPin, Navigation } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Parada } from './UserRouteMapClient';

const favoriteStorageKey = 'yallego.favoritePlaces';

type StoredStop = Partial<Parada> & {
  name?: string;
  lat?: number;
  lng?: number;
  detail?: string;
  category?: string;
};

const normalizeStoredStop = (item: StoredStop): Parada | null => {
  const latitud = item.latitud ?? item.lat;
  const longitud = item.longitud ?? item.lng;
  const titulo = item.titulo ?? item.name;
  const descripcion = item.descripcion ?? item.detail;

  if (!item.id || typeof latitud !== 'number' || typeof longitud !== 'number' || !titulo) {
    return null;
  }

  return {
    id: item.id,
    latitud,
    longitud,
    logoUrl: item.logoUrl ?? '',
    titulo,
    descripcion: descripcion ?? 'Parada guardada.',
    esFavorito: item.esFavorito ?? true,
    informacionAdicional: item.informacionAdicional ?? item.category,
  };
};

const readStoredFavorites = () => {
  if (typeof window === 'undefined') return [];

  const stored = window.localStorage.getItem(favoriteStorageKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as StoredStop[];
    return parsed.map(normalizeStoredStop).filter((item): item is Parada => Boolean(item));
  } catch {
    return [];
  }
};

export function UserSavedPlacesPanel() {
  const [favorites, setFavorites] = useState<Parada[]>([]);

  useEffect(() => {
    const loadFavorites = () => setFavorites(readStoredFavorites());

    loadFavorites();
    window.addEventListener('yallego:favorites-updated', loadFavorites);
    window.addEventListener('storage', loadFavorites);

    return () => {
      window.removeEventListener('yallego:favorites-updated', loadFavorites);
      window.removeEventListener('storage', loadFavorites);
    };
  }, []);

  const removeFavorite = (favoriteId: string) => {
    const nextFavorites = favorites.filter((favorite) => favorite.id !== favoriteId);
    setFavorites(nextFavorites);
    window.localStorage.setItem(favoriteStorageKey, JSON.stringify(nextFavorites));
    window.dispatchEvent(new CustomEvent('yallego:favorites-updated'));
  };

  if (favorites.length === 0) {
    return (
      <section className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-6">
        <div className="grid gap-3 text-slate-600 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <span className="grid size-12 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
            <Heart size={22} />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-950">Todavia no hay favoritos</h2>
            <p className="mt-1 text-sm font-semibold">
              Abre el mapa, toca un logo publico y agrega el sitio a favoritos.
            </p>
          </div>
          <Link
            href="/user"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-cyan-700"
          >
            <MapPin size={17} />
            Abrir mapa
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Guardados</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{favorites.length}</p>
        </div>
        <Link
          href="/user"
          className="flex min-h-28 items-center justify-center gap-2 rounded-lg bg-slate-950 p-4 text-sm font-black text-white transition hover:bg-cyan-700"
        >
          <Navigation size={18} />
          Buscar otro lugar
        </Link>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {favorites.map((favorite) => (
          <article
            key={favorite.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-300"
          >
            <div className="flex items-start gap-4">
              <Link
                href={`/user?favorite=${encodeURIComponent(favorite.id)}`}
                className="flex min-w-0 flex-1 items-start gap-4 rounded-lg transition hover:bg-cyan-50"
              >
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-cyan-100 text-sm font-black text-slate-950 ring-4 ring-slate-100">
                  {favorite.logoUrl ? (
                    <Image
                      src={favorite.logoUrl}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    favorite.titulo.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                    Parada
                  </span>
                  <span className="mt-1 block text-lg font-black leading-tight text-slate-950">
                    {favorite.titulo}
                  </span>
                  <span className="mt-2 block text-sm font-semibold leading-6 text-slate-600">
                    {favorite.descripcion}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => removeFavorite(favorite.id)}
                className="grid size-10 shrink-0 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                aria-label={`Quitar ${favorite.titulo} de favoritos`}
              >
                <Heart size={18} fill="currentColor" />
              </button>
            </div>

            <Link
              href={`/user?favorite=${encodeURIComponent(favorite.id)}`}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white transition hover:bg-cyan-700"
            >
              <Navigation size={17} />
              Como llegar
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
