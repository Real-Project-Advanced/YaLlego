import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Form, FormButton, FormField } from '@/components/common/Form';
import { AdminNavbar } from '@/components/layouts/AdminNavbar';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createDriverAccountAction } from '@/modules/admin/actions/driver.actions';

export default async function CreateDriverPage() {
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
        <AdminNavbar title="Crear conductor" />

        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[clamp(2rem,6vw,2.5rem)] font-black leading-tight text-slate-950">
              Crear conductor
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Crea una cuenta con rol DRIVER y registra sus datos de licencia.
            </p>
          </div>
          <Link
            href="/admin/drivers"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Volver
          </Link>
        </section>

        <section className="mt-6 rounded-lg bg-white p-5 shadow ring-1 ring-slate-200 sm:p-6">
          <Form action={createDriverAccountAction} className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">Cuenta de acceso</h2>
              <p className="mt-1 text-sm text-slate-600">
                Estos datos se usaran para que el conductor inicie sesion en /driver.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Nombre completo"
                name="fullname"
                placeholder="Nombre del conductor"
                autoComplete="name"
                required
                validate="name"
              />
              <FormField
                label="Correo electronico"
                name="email"
                type="email"
                placeholder="conductor@email.com"
                autoComplete="email"
                required
                validate="email"
              />
              <FormField
                label="Contrasena inicial"
                name="password"
                type="password"
                placeholder="Minimo 8 caracteres"
                autoComplete="new-password"
                required
                validate="registerPassword"
              />
              <FormField
                label="Telefono"
                name="phone"
                type="tel"
                placeholder="Opcional"
                autoComplete="tel"
              />
              <FormField
                label="Documento"
                name="document_number"
                placeholder="Opcional"
                autoComplete="off"
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-black text-slate-950">Datos de conductor</h2>
              <p className="mt-1 text-sm text-slate-600">
                Informacion requerida por la tabla drivers.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="w-full text-left">
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                  htmlFor="license_type"
                >
                  Tipo de licencia <span className="text-red-500">*</span>
                </label>
                <input
                  id="license_type"
                  name="license_type"
                  required
                  placeholder="Ej. C1, C2, C3"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder-slate-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="w-full text-left">
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                  htmlFor="experience_years"
                >
                  Anos de experiencia <span className="text-red-500">*</span>
                </label>
                <input
                  id="experience_years"
                  name="experience_years"
                  type="number"
                  min="0"
                  step="1"
                  required
                  defaultValue="0"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="w-full text-left">
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                  htmlFor="license_expiration"
                >
                  Vencimiento de licencia <span className="text-red-500">*</span>
                </label>
                <input
                  id="license_expiration"
                  name="license_expiration"
                  type="date"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="w-full text-left">
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                  htmlFor="transport_id"
                >
                  Vehiculo asignado
                </label>
                <select
                  id="transport_id"
                  name="transport_id"
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Sin vehiculo por ahora</option>
                  {transports.map((transport) => (
                    <option key={transport.id} value={transport.id}>
                      {transport.plate} - {transport.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/admin/drivers"
                className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Cancelar
              </Link>
              <FormButton className="bg-green-600 hover:bg-green-700 sm:w-auto">
                Crear conductor
              </FormButton>
            </div>
          </Form>
        </section>
      </div>
    </main>
  );
}
