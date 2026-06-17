import Link from 'next/link';
import { Header } from '@/components/common/Header';

const routes = [
  {
    group: 'Público',
    items: [
      { name: 'Inicio', path: '/', description: 'Página de aterrizaje principal' },
      { name: 'Login', path: '/login', description: 'Acceso a la plataforma' },
      { name: 'Registro', path: '/register', description: 'Creación de cuenta' },
    ],
  },
  {
    group: 'Administración (Dashboard)',
    items: [
      {
        name: 'Panel Admin',
        path: '/admin',
        description:
          'Dashboard principal de administración, Ingresa con: Probanding@prueba.com y pwd: 123456789',
      },
      { name: 'Resumen Admin', path: '/admin/dashboard', description: 'Métricas y estados' },
      { name: 'Gestión Conductores', path: '/admin/driver', description: 'Administrar personal' },
      { name: 'Gestión Rutas', path: '/admin/routes', description: 'Configuración de trayectos' },
      { name: 'Super Admin', path: '/admin/superadmin', description: 'Configuraciones globales' },
    ],
  },
  {
    group: 'Conductor',
    items: [
      {
        name: 'Dashboard Conductor',
        path: '/driver/dashboard',
        description: 'Vista del conductor',
      },
      { name: 'Estado de Servicio', path: '/driver/status', description: 'Estado actual y turno' },
    ],
  },
  {
    group: 'Usuario',
    items: [
      { name: 'Dashboard Usuario', path: '/user', description: 'Panel personal' },
      {
        name: 'Asistente AI (Chat)',
        path: '/user/chat',
        description: 'Consulta de rutas inteligentes',
      },
      { name: 'Favoritos', path: '/user/favorites', description: 'Lugares guardados' },
      { name: 'Historial', path: '/user/history', description: 'Viajes anteriores' },
    ],
  },
];

export default function TempDashboard() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-orange-600 uppercase bg-orange-100 rounded-full">
            Acceso Temporal de Desarrollo
          </span>
          <h1 className="text-4xl font-black text-slate-900 sm:text-5xl mb-4">
            Mapa de Rutas del Proyecto A Trabajar
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Esta vista es **temporal** y sirve para facilitar la navegación entre todos los módulos
            del sistema mientras se completan las integraciones de los flujos de usuario.
          </p>
        </div>

        <div className="space-y-16">
          {routes.map((section) => (
            <section key={section.group}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {section.group}
                </h2>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((route) => (
                  <div
                    key={route.path}
                    className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:border-blue-200 hover:-translate-y-1"
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {route.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-1">{route.path}</p>
                      </div>
                      <p className="text-sm text-slate-500 mb-8 flex-1">{route.description}</p>
                      <Link
                        href={route.path}
                        className="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold text-white bg-slate-900 rounded-xl transition-all group-hover:bg-blue-700 active:scale-95"
                      >
                        Ir a la ruta
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 p-8 bg-blue-50 rounded-3xl border border-blue-100 text-center">
          <p className="text-sm font-bold text-blue-700 mb-2 uppercase tracking-wide">
            Nota del Desarrollador
          </p>
          <p className="text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">
            Todo esto es lo que se debe trabajar en el proyecto, un mvp creado para hacer el
            lanzamiento en vercel y test de la aplicación, preferiblemente esto se va a elminar y es
            algo momentaneo para centralizarnos en cada trabajo
          </p>
        </div>
      </div>
    </main>
  );
}
