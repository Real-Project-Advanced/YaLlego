import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BusFront,
  CheckCircle2,
  Clock3,
  IdCard,
  LayoutDashboard,
  MapPinned,
  Route,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { UserPayload } from '@/lib/auth';
import { AdminNavbar } from '@/components/layouts/AdminNavbar';

interface AdminOverviewProps {
  user: UserPayload;
  counts: {
    users: number;
    drivers: number;
    vehicles: number;
    routes: number;
  };
}

interface StatCard {
  title: string;
  value: number;
  caption: string;
  icon: LucideIcon;
  tone: string;
  iconTone: string;
}

interface ModuleCard {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  tone: string;
  meta: string;
}

const stats: StatCard[] = [
  {
    title: 'Usuarios',
    value: 0,
    caption: 'Cuentas registradas',
    icon: Users,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    iconTone: 'bg-emerald-600 text-white',
  },
  {
    title: 'Conductores',
    value: 0,
    caption: 'Perfiles operativos',
    icon: IdCard,
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
    iconTone: 'bg-sky-600 text-white',
  },
  {
    title: 'Vehiculos',
    value: 0,
    caption: 'Flota registrada',
    icon: BusFront,
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
    iconTone: 'bg-amber-500 text-white',
  },
  {
    title: 'Rutas',
    value: 0,
    caption: 'Trayectos configurados',
    icon: Route,
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
    iconTone: 'bg-rose-600 text-white',
  },
];

const modules: ModuleCard[] = [
  {
    title: 'Conductores',
    description: 'Revisa perfiles, licencias, experiencia y asignaciones de la operacion.',
    href: '/admin/driver',
    cta: 'Gestionar',
    icon: IdCard,
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
    meta: 'Control de equipo',
  },
  {
    title: 'Rutas',
    description: 'Supervisa origenes, destinos y relacion de rutas con vehiculos activos.',
    href: '/admin/routes',
    cta: 'Abrir rutas',
    icon: MapPinned,
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
    meta: 'Red de servicio',
  },
  {
    title: 'Super admin',
    description: 'Accede al panel reservado para configuracion y gobierno del sistema.',
    href: '/admin/superadmin',
    cta: 'Entrar',
    icon: ShieldCheck,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    meta: 'Permisos elevados',
  },
  {
    title: 'Dashboard',
    description: 'Vuelve a la vista principal con indicadores generales del sistema.',
    href: '/admin/dashboard',
    cta: 'Ver panel',
    icon: LayoutDashboard,
    tone: 'border-slate-200 bg-slate-100 text-slate-700',
    meta: 'Resumen ejecutivo',
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-CO').format(value);
}

export function AdminOverview({ user, counts }: AdminOverviewProps) {
  const statValues = [counts.users, counts.drivers, counts.vehicles, counts.routes];
  const totalAssets = statValues.reduce((total, value) => total + value, 0);
  const activeVehiclesLabel =
    counts.vehicles === 1 ? 'vehiculo registrado' : 'vehiculos registrados';

  const populatedStats = stats.map((stat, index) => ({
    ...stat,
    value: statValues[index] ?? 0,
  }));

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <AdminNavbar />

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Acceso SUPER_ADMIN
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
                  <Activity className="h-4 w-4" aria-hidden="true" />
                  Sistema operativo
                </span>
              </div>

              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Panel administrativo
                </p>
                <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
                  Control central de Nexthus
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Hola, <span className="font-bold text-slate-900">{user.fullname}</span>. Aqui
                  tienes una vista clara para monitorear usuarios, conductores, flota y rutas sin
                  perder tiempo entre modulos.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/admin/driver"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <IdCard className="h-4 w-4" aria-hidden="true" />
                  Gestionar conductores
                </Link>
                <Link
                  href="/admin/routes"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <Route className="h-4 w-4" aria-hidden="true" />
                  Revisar rutas
                </Link>
              </div>
            </div>

            <aside className="border-t border-slate-200 bg-slate-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
                    <Settings className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 text-xl font-black">Estado general</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Resumen rapido de recursos disponibles para operar la red.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Registros</p>
                    <p className="mt-1 text-3xl font-black">{formatNumber(totalAssets)}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Flota</p>
                    <p className="mt-1 text-3xl font-black">{formatNumber(counts.vehicles)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {formatNumber(counts.vehicles)} {activeVehiclesLabel}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {populatedStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">
                      {formatNumber(stat.value)}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.iconTone}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
                <div
                  className={`mt-5 rounded-lg border px-3 py-2 text-sm font-semibold ${stat.tone}`}
                >
                  {stat.caption}
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Modulos de gestion</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Accesos directos a las areas disponibles del administrador.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {modules.map((module) => {
                const Icon = module.icon;

                return (
                  <Link
                    key={module.title}
                    href={module.href}
                    className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-lg border ${module.tone}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <ArrowUpRight
                        className="h-5 w-5 text-slate-300 transition group-hover:text-emerald-600"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      {module.meta}
                    </p>
                    <h3 className="mt-2 text-xl font-black text-slate-950">{module.title}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                      {module.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                      {module.cta}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-950">Prioridades</h2>
                <p className="mt-1 text-sm text-slate-600">Siguientes pasos sugeridos.</p>
              </div>
              <Clock3 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            </div>

            <div className="mt-5 space-y-3">
              {[
                'Completar modulos de usuarios y vehiculos.',
                'Conectar estados reales de conductores y flota.',
                'Agregar reportes cuando existan eventos de uso.',
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 flex-none text-emerald-600"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
