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
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur shadow-sm">
      <nav className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href={dashboardLink} className="flex items-center gap-3" aria-label="Inicio">
          <span className="grid size-10 place-items-center rounded-lg bg-blue-700 text-lg font-black text-white">
            LY
          </span>
          <span className="text-lg font-black text-slate-950">LlegoYa</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              {/* Botón dinámico "Ir al Panel" adaptado a su rol */}
              <Link
                href={dashboardLink}
                className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100 mr-2"
              >
                Ir a mi Panel →
              </Link>

              <span className="text-sm text-slate-600 flex items-center gap-1">
                Hola, <strong className="text-slate-900">{user.fullname}</strong>
                {user.role === 'SUPER_ADMIN' && (
                  <span className="ml-2 inline-block bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                    ADMIN
                  </span>
                )}
                {user.role === 'DRIVER' && (
                  <span className="ml-2 inline-block bg-amber-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                    CONDUCTOR
                  </span>
                )}
              </span>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 cursor-pointer"
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
