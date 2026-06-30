import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Form, FormButton, FormField } from '@/components/common/Form';
import { AdminNavbar } from '@/components/layouts/AdminNavbar';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createRouteAction } from '@/modules/admin/actions/route.actions';

export default async function CreateRoutePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  const transports = await prisma.transports.findMany({
    where: { is_active: true },
    orderBy: { plate: 'asc' },
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
        <AdminNavbar title="Crear ruta" />

        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[clamp(2rem,6vw,2.5rem)] font-black leading-tight text-slate-950">
              Crear ruta
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Registra origen, destino y el vehiculo que cubrira la ruta.
            </p>
          </div>
          <Link
            href="/admin/routes"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Volver
          </Link>
        </section>

        <section className="mt-6 rounded-lg bg-white p-5 shadow ring-1 ring-slate-200 sm:p-6">
          <Form action={createRouteAction} className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">Datos de la ruta</h2>
              <p className="mt-1 text-sm text-slate-600">
                Debe existir al menos un vehiculo activo para asignarlo.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Origen"
                name="origin"
                placeholder="Ej. Terminal del Norte"
                autoComplete="off"
                required
              />
              <FormField
                label="Destino"
                name="destination"
                placeholder="Ej. Universidad de Antioquia"
                autoComplete="off"
                required
              />
              <div className="w-full text-left md:col-span-2">
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                  htmlFor="transport_id"
                >
                  Vehiculo <span className="text-red-500">*</span>
                </label>
                <select
                  id="transport_id"
                  name="transport_id"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="" disabled>
                    Selecciona un vehiculo
                  </option>
                  {transports.map((transport) => (
                    <option key={transport.id} value={transport.id}>
                      {transport.plate} - {transport.model} ({transport.capacity} pasajeros)
                    </option>
                  ))}
                </select>
                {transports.length === 0 ? (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    No hay vehiculos activos. Crea un vehiculo antes de registrar rutas.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/admin/routes"
                className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Cancelar
              </Link>
              <FormButton className="bg-orange-600 hover:bg-orange-700 sm:w-auto">
                Crear ruta
              </FormButton>
            </div>
          </Form>
        </section>
      </div>
    </main>
  );
}
