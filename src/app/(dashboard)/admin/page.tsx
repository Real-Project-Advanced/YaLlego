import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminNavbar } from '@/components/layouts/AdminNavbar';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  const [userCount, driverCount, vehicleCount, routeCount] = await Promise.all([
    prisma.users.count(),
    prisma.drivers.count(),
    prisma.transports.count(),
    prisma.routes.count(),
  ]);

  const stats = [
    { title: 'Users', value: userCount, borderClassName: 'border-blue-500' },
    { title: 'Drivers', value: driverCount, borderClassName: 'border-green-500' },
    { title: 'Vehicles', value: vehicleCount, borderClassName: 'border-purple-500' },
    { title: 'Routes', value: routeCount, borderClassName: 'border-orange-500' },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <AdminNavbar />

        <div className="mt-6 mb-8">
          <h1 className="mb-2 text-[clamp(2rem,6vw,2.5rem)] font-black leading-tight text-slate-950">
            Admin Panel
          </h1>
          <p className="text-slate-600">
            Welcome, <span className="font-bold">{user.fullname}</span>
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`rounded-lg border-l-4 bg-white p-5 shadow sm:p-6 ${stat.borderClassName}`}
            >
              <p className="mb-1 text-sm font-semibold text-slate-600">{stat.title}</p>
              <p className="text-3xl font-black text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="rounded-lg bg-white p-5 shadow-md transition hover:shadow-lg sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="min-w-0">
                <h2 className="mb-2 text-xl font-bold text-slate-950">Manage Vehicles</h2>
                <p className="text-sm text-slate-600">
                  Register vehicles, update capacity, and manage status
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/transports"
                className="block w-full rounded-lg bg-purple-600 py-2 text-center text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                View Vehicles
              </Link>
              <Link
                href="/admin/transports/create"
                className="block w-full rounded-lg border border-purple-600 py-2 text-center text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
              >
                Create Vehicle
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-md transition hover:shadow-lg sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="min-w-0">
                <h2 className="mb-2 text-xl font-bold text-slate-950">Manage Drivers</h2>
                <p className="text-sm text-slate-600">
                  Register new drivers, update licenses, and assign vehicles
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/drivers"
                className="block w-full rounded-lg bg-green-600 py-2 text-center text-sm font-semibold text-white transition hover:bg-green-700"
              >
                View Drivers
              </Link>
              <Link
                href="/admin/drivers/create"
                className="block w-full rounded-lg border border-green-600 py-2 text-center text-sm font-semibold text-green-600 transition hover:bg-green-50"
              >
                Create Driver
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-md transition hover:shadow-lg sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="min-w-0">
                <h2 className="mb-2 text-xl font-bold text-slate-950">Manage Routes</h2>
                <p className="text-sm text-slate-600">
                  Create, update, and monitor all system routes
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/routes"
                className="block w-full rounded-lg bg-orange-600 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                View Routes
              </Link>
              <Link
                href="/admin/routes/create"
                className="block w-full rounded-lg border border-orange-600 py-2 text-center text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
              >
                Create Route
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-md transition hover:shadow-lg sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="min-w-0">
                <h2 className="mb-2 text-xl font-bold text-slate-950">Reports and Analytics</h2>
                <p className="text-sm text-slate-600">
                  View system usage reports and route analytics
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/reports"
                className="block w-full rounded-lg bg-slate-950 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
