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

export default async function AdminTransportsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  const transports = await prisma.transports.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: {
          drivers: true,
          routes: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <AdminNavbar title="Vehiculos" />

        <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[clamp(2rem,6vw,2.5rem)] font-black leading-tight text-slate-950">
              Vehiculos
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Flota registrada para asignar conductores y rutas.
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
              href="/admin/transports/create"
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"
            >
              Crear vehiculo
            </Link>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-lg bg-white shadow ring-1 ring-slate-200">
          {transports.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">Todavia no hay vehiculos registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Vehiculo</th>
                    <th className="px-4 py-3">Capacidad</th>
                    <th className="px-4 py-3">Asignaciones</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Creado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transports.map((transport) => (
                    <tr key={transport.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">{transport.plate}</p>
                        <p className="text-slate-600">{transport.model}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{transport.capacity} pasajeros</td>
                      <td className="px-4 py-4 text-slate-700">
                        <p>{transport._count.drivers} conductores</p>
                        <p className="text-xs text-slate-500">{transport._count.routes} rutas</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            transport.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {transport.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(transport.created_at)}
                      </td>
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
