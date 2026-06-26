import Link from 'next/link';
import { AppLogo } from '@/components/common/AppLogo';

interface AdminNavbarProps {
  title?: string;
}

export function AdminNavbar({ title = 'LlegoYa' }: AdminNavbarProps) {
  return (
    <header className="flex flex-col gap-4 rounded-b-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <Link href="/admin" className="flex min-w-0 items-center gap-3 hover:text-blue-700">
          <AppLogo iconClassName="size-9" textClassName="text-xl" />
          {title !== 'LlegoYa' ? (
            <span className="truncate text-xl font-black text-slate-950">{title}</span>
          ) : null}
        </Link>
      </div>

      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
        >
          Logout
        </button>
      </form>
    </header>
  );
}
