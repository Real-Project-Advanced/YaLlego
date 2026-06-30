import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminNavbar } from '@/components/layouts/AdminNavbar';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(value);
}

export default async function AdminRoutesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  const routes = await prisma.routes.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      transports: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <AdminNavbar title="Rutas" />

        <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[clamp(2rem,6vw,2.5rem)] font-black leading-tight text-slate-950">
              Rutas
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Trayectos registrados con su vehiculo asignado.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Volver
            </Link>
            <Link
              href="/admin/routes/create"
              className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700"
            >
              Crear ruta
            </Link>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-lg bg-white shadow ring-1 ring-slate-200">
          {routes.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">Todavia no hay rutas registradas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Ruta</th>
                    <th className="px-4 py-3">Vehiculo</th>
                    <th className="px-4 py-3">Capacidad</th>
                    <th className="px-4 py-3">Creada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.map((route) => (
                    <tr key={route.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">{route.origin}</p>
                        <p className="text-slate-600">Hasta {route.destination}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <p className="font-semibold">{route.transports.plate}</p>
                        <p className="text-xs text-slate-500">{route.transports.model}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {route.transports.capacity} pasajeros
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(route.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
