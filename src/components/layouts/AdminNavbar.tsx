import Link from 'next/link';
import { LogOut, ShieldCheck } from 'lucide-react';
import { AppLogo } from '@/components/common/AppLogo';

interface AdminNavbarProps {
  title?: string;
}

export function AdminNavbar({ title = 'LlegoYa' }: AdminNavbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-3">
          <AppLogo iconClassName="size-10" textClassName="text-xl" />
        </Link>
        <div>
          <Link
            href="/admin"
            className="text-base font-black text-slate-950 transition hover:text-emerald-700"
          >
            {title}
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Administracion
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-wrap justify-end gap-2 text-sm font-bold text-slate-600">
        <Link
          href="/admin/dashboard"
          className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/driver"
          className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
        >
          Conductores
        </Link>
        <Link
          href="/admin/routes"
          className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
        >
          Rutas
        </Link>
      </nav>

      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Cerrar sesion
        </button>
      </form>
    </header>
  );
}
