'use client';

import React from 'react';
import { MessageCircle, Heart, History, MapPin, LogOut } from 'lucide-react';
import Link from 'next/link';

type NavigationItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
};

const navigationItems: NavigationItem[] = [
  {
    id: 'chat',
    label: 'Chat',
    icon: <MessageCircle className="h-5 w-5" />,
    href: '/user/chat',
  },
  {
    id: 'favorites',
    label: 'Favoritos',
    icon: <Heart className="h-5 w-5" />,
    href: '/user/favorites',
  },
  {
    id: 'history',
    label: 'Historial',
    icon: <History className="h-5 w-5" />,
    href: '/user/history',
  },
  {
    id: 'routes',
    label: 'Rutas',
    icon: <MapPin className="h-5 w-5" />,
    href: '/user/routes',
  },
];

interface MainDashboardLayoutProps {
  children?: React.ReactNode;
}

export default function MainDashboardLayout({ children }: MainDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-neutral-900">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 border-r border-neutral-800 bg-neutral-950">
        <nav className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="border-b border-neutral-800 px-6 py-6">
            <h1 className="text-xl font-bold text-white">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Nexthus
              </span>
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 space-y-2 px-4 py-6">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-4 py-3 text-neutral-400 transition-all duration-200 hover:bg-neutral-800 hover:text-white"
              >
                <span className="transition-colors duration-200 group-hover:text-cyan-400">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div className="border-t border-neutral-800 px-4 py-4">
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-neutral-400 transition-all duration-200 hover:bg-red-950/30 hover:text-red-400">
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden bg-neutral-900">
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="border-b border-neutral-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Explorar</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Encuentra las mejores rutas de transporte
            </p>
          </header>

          {/* Content Container */}
          <div className="flex-1 overflow-auto p-8">
            <div className="h-full rounded-2xl border border-neutral-800 bg-neutral-800/50 shadow-xl">
              {/* Map Placeholder */}
              {children ? (
                <div className="h-full">{children}</div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
                    <p className="text-neutral-400">Aquí va el componente del mapa...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
