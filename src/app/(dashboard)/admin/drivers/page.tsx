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

export default async function AdminDriversPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  const drivers = await prisma.drivers.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      transports: true,
      users_drivers_user_idTousers: {
        select: {
          fullname: true,
          email: true,
          phone: true,
          document_number: true,
          is_active: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <AdminNavbar title="Conductores" />

        <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[clamp(2rem,6vw,2.5rem)] font-black leading-tight text-slate-950">
              Conductores
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Cuentas con rol DRIVER y datos operativos de licencia.
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
              href="/admin/drivers/create"
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              Crear conductor
            </Link>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-lg bg-white shadow ring-1 ring-slate-200">
          {drivers.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">
              Todavia no hay conductores registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-xs font-bold uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Conductor</th>
                    <th className="px-4 py-3">Licencia</th>
                    <th className="px-4 py-3">Vehiculo</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.map((driver) => {
                    const driverUser = driver.users_drivers_user_idTousers;
                    return (
                      <tr key={driver.id} className="align-top">
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-950">{driverUser.fullname}</p>
                          <p className="text-slate-600">{driverUser.email}</p>
                          <p className="text-xs text-slate-500">
                            {driverUser.phone || 'Sin telefono'} -{' '}
                            {driverUser.document_number || 'Sin documento'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          <p className="font-semibold">{driver.license_type}</p>
                          <p>{driver.experience_years} anos de experiencia</p>
                          <p className="text-xs text-slate-500">
                            Vence: {formatDate(driver.license_expiration)}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {driver.transports ? (
                            <>
                              <p className="font-semibold">{driver.transports.plate}</p>
                              <p className="text-xs text-slate-500">{driver.transports.model}</p>
                            </>
                          ) : (
                            <span className="text-slate-500">Sin vehiculo asignado</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              driverUser.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {driverUser.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
