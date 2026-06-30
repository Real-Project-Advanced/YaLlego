import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Form, FormButton, FormField } from '@/components/common/Form';
import { AdminNavbar } from '@/components/layouts/AdminNavbar';
import { getCurrentUser } from '@/lib/auth';
import { createTransportAction } from '@/modules/admin/actions/transport.actions';

export default async function CreateTransportPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
        <AdminNavbar title="Crear vehiculo" />

        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[clamp(2rem,6vw,2.5rem)] font-black leading-tight text-slate-950">
              Crear vehiculo
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Registra un vehiculo para luego asignarlo a conductores y rutas.
            </p>
          </div>
          <Link
            href="/admin/transports"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Volver
          </Link>
        </section>

        <section className="mt-6 rounded-lg bg-white p-5 shadow ring-1 ring-slate-200 sm:p-6">
          <Form action={createTransportAction} className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">Datos del vehiculo</h2>
              <p className="mt-1 text-sm text-slate-600">
                La placa debe ser unica dentro del sistema.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Placa"
                name="plate"
                placeholder="ABC123"
                autoComplete="off"
                required
              />
              <FormField
                label="Modelo"
                name="model"
                placeholder="Bus urbano, van, microbus"
                autoComplete="off"
                required
              />
              <div className="w-full text-left">
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                  htmlFor="capacity"
                >
                  Capacidad <span className="text-red-500">*</span>
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Ej. 40"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder-slate-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/admin/transports"
                className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Cancelar
              </Link>
              <FormButton className="bg-purple-600 hover:bg-purple-700 sm:w-auto">
                Crear vehiculo
              </FormButton>
            </div>
          </Form>
        </section>
      </div>
    </main>
  );
}
