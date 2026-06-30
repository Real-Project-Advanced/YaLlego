'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';
import { logoutAction } from '@/modules/auth/actions/auth.actions';

type HeaderMenuProps = {
  isAuthenticated: boolean;
  userName?: string;
  isSuperAdmin?: boolean;
};

const guestLinks = [
  { href: '/', label: 'Home', variant: 'ghost' },
  { href: '/register', label: 'Register', variant: 'ghost' },
  { href: '/login', label: 'Login', variant: 'primary' },
] as const;

export function HeaderMenu({ isAuthenticated, userName, isSuperAdmin }: HeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dashboardHref = isSuperAdmin ? '/admin' : '/user';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 sm:hidden"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="hidden items-center gap-2 sm:flex">
        {isAuthenticated ? (
          <>
            <Link
              href={dashboardHref}
              className="rounded-lg px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              Dashboard
            </Link>
            <span className="max-w-xs truncate text-sm text-slate-600">
              Hi, {userName}
              {isSuperAdmin ? (
                <span className="ml-2 inline-block rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                  ADMIN
                </span>
              ) : null}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </>
        ) : (
          guestLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.variant === 'primary'
                  ? 'rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800'
                  : 'rounded-lg px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700'
              }
            >
              {link.label}
            </Link>
          ))
        )}
      </div>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl sm:hidden">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 text-sm font-semibold text-slate-600">Hi, {userName}</div>
              <Link
                href={dashboardHref}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="mt-1 flex w-full items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-left text-sm font-bold text-white transition hover:bg-red-700"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </form>
            </>
          ) : (
            guestLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={
                  link.variant === 'primary'
                    ? 'mt-1 block rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-800'
                    : 'block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700'
                }
              >
                {link.label}
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
