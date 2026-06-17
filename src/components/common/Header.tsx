import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { logoutAction } from '@/modules/auth/actions/auth.actions';

export async function Header() {
  const user = await getCurrentUser();

  const dashboardLink =
    user?.role === 'SUPER_ADMIN'
      ? '/admin'
      : user?.role === 'DRIVER'
        ? '/driver'
        : user
          ? '/user'
          : '/';

  return (
    <header className="border-b border-blue-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href={dashboardLink} className="flex items-center gap-3" aria-label="Inicio">
          <span className="grid size-10 place-items-center rounded-lg bg-blue-700 text-lg font-black text-white">
            N
          </span>
          <span className="text-lg font-black text-slate-950">Nexthus</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Inicio
          </Link>
          <Link
            href="/temp-dashboard"
            className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
          >
            Temporal 🛠️
          </Link>
          {user ? (
            <>
              <span className="text-sm text-slate-600">
                Hola, {user.fullname}
                {user.role === 'SUPER_ADMIN' && (
                  <span className="ml-2 inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                    ADMIN
                  </span>
                )}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-lg px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Registro
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
