import Link from 'next/link';
import { Header } from '@/components/common/Header';

const routes = [
  {
    group: 'Public',
    items: [
      { name: 'Home', path: '/', description: 'Main landing page' },
      { name: 'Login', path: '/login', description: 'Platform access' },
      { name: 'Register', path: '/register', description: 'Account creation' },
    ],
  },
  {
    group: 'Administration (Dashboard)',
    items: [
      {
        name: 'Admin Panel',
        path: '/admin',
        description:
          'Main administration dashboard. Sign in with: Probanding@prueba.com and pwd: 123456789',
      },
      { name: 'Admin Overview', path: '/admin/dashboard', description: 'Metrics and status' },
      { name: 'Driver Management', path: '/admin/driver', description: 'Manage staff' },
      { name: 'Route Management', path: '/admin/routes', description: 'Trip configuration' },
      { name: 'Super Admin', path: '/admin/superadmin', description: 'Global settings' },
    ],
  },
  {
    group: 'Driver',
    items: [
      {
        name: 'Driver Dashboard',
        path: '/driver/dashboard',
        description: 'Driver view',
      },
      { name: 'Service Status', path: '/driver/status', description: 'Current status and shift' },
    ],
  },
  {
    group: 'User',
    items: [
      { name: 'User Dashboard', path: '/user', description: 'Personal panel' },
      {
        name: 'AI Assistant (Chat)',
        path: '/user/chat',
        description: 'Smart route questions',
      },
      { name: 'Favorites', path: '/user/favorites', description: 'Saved places' },
      { name: 'History', path: '/user/history', description: 'Previous trips' },
    ],
  },
];

export default function TempDashboard() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-600">
            Temporary Development Access
          </span>
          <h1 className="mb-4 text-[clamp(2rem,7vw,3rem)] font-black leading-tight text-slate-900">
            Project Route Map
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            This view is temporary and helps navigate every system module while user flows are
            completed.
          </p>
        </div>

        <div className="space-y-16">
          {routes.map((section) => (
            <section key={section.group}>
              <div className="mb-8 flex items-center gap-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 sm:text-xl">
                  {section.group}
                </h2>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((route) => (
                  <div
                    key={route.path}
                    className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-xl sm:p-6"
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {route.name}
                        </h3>
                        <p className="mt-1 truncate font-mono text-xs text-slate-400">
                          {route.path}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500 mb-8 flex-1">{route.description}</p>
                      <Link
                        href={route.path}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all group-hover:bg-blue-700 active:scale-95"
                      >
                        Go to route
                        <svg
                          className="ml-2 h-4 w-4"
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

        <div className="mt-16 rounded-xl border border-blue-100 bg-blue-50 p-5 text-center sm:mt-20 sm:p-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-700">
            Developer Note
          </p>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-600">
            This MVP helps test the application and prepare the Vercel launch. This temporary
            navigation page can be removed when the final flows are complete.
          </p>
        </div>
      </div>
    </main>
  );
}
