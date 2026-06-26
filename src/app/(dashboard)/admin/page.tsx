import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminNavbar } from '@/components/layouts/AdminNavbar';

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

        {/* Quick Stats */}
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

        {/* Options menu */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Manage users */}
          <div className="rounded-lg bg-white p-5 shadow-md transition hover:shadow-lg sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-950 mb-2">👥 Manage Users</h2>
                <p className="text-slate-600 text-sm">
                  Create, edit, and manage system users (SUPER_ADMIN, DRIVER, USER)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
              >
                View Users
              </Link>
              <Link
                href="/admin/users/create"
                className="block w-full text-center border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm"
              >
                Create User
              </Link>
            </div>
          </div>

          {/* Manage drivers */}
          <div className="rounded-lg bg-white p-5 shadow-md transition hover:shadow-lg sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-950 mb-2">🚗 Manage Drivers</h2>
                <p className="text-slate-600 text-sm">
                  Register new drivers, update licenses, and assign vehicles
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/driver"
                className="block w-full text-center bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
              >
                View Drivers
              </Link>
              <Link
                href="/admin/driver/create"
                className="block w-full text-center border border-green-600 text-green-600 py-2 rounded-lg font-semibold hover:bg-green-50 transition text-sm"
              >
                Create Driver
              </Link>
            </div>
          </div>

          {/* Manage routes */}
          <div className="rounded-lg bg-white p-5 shadow-md transition hover:shadow-lg sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-950 mb-2">🗺️ Manage Routes</h2>
                <p className="text-slate-600 text-sm">
                  Create, update, and monitor all system routes
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/routes"
                className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
              >
                View Routes
              </Link>
              <Link
                href="/admin/routes/create"
                className="block w-full text-center border border-purple-600 text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-50 transition text-sm"
              >
                Create Route
              </Link>
            </div>
          </div>

          {/* Reports and analytics */}
          <div className="rounded-lg bg-white p-5 shadow-md transition hover:shadow-lg sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-950 mb-2">📊 Reports and Analytics</h2>
                <p className="text-slate-600 text-sm">
                  View system usage reports and route analytics
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/reports"
                className="block w-full text-center bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
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
