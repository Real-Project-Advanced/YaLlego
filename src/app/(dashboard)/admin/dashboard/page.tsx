import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminNavbar } from '@/components/layouts/AdminNavbar';

export default async function AdminDashboard() {
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

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <AdminNavbar />

        <div className="mt-6 mb-8">
          <h1 className="text-4xl font-black text-slate-950 mb-2">Panel Administrativo</h1>
          <p className="text-slate-600">
            Bienvenido, <span className="font-bold">{user.fullname}</span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Usuarios', value: userCount, color: 'blue' },
            { title: 'Conductores', value: driverCount, color: 'green' },
            { title: 'Vehículos', value: vehicleCount, color: 'purple' },
            { title: 'Rutas', value: routeCount, color: 'orange' },
          ].map((stat) => (
            <div
              key={stat.title}
              className={`bg-white rounded-lg shadow p-6 border-l-4 border-${stat.color}-500`}
            >
              <p className="text-slate-600 text-sm font-semibold mb-1">{stat.title}</p>
              <p className="text-3xl font-black text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Menu de Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gestionar Usuarios */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950 mb-2">👥 Gestionar Usuarios</h2>
                <p className="text-slate-600 text-sm">
                  Crea, edita y administra usuarios del sistema (SUPER_ADMIN, DRIVER, USER)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
              >
                Ver Usuarios
              </Link>
              <Link
                href="/admin/users/create"
                className="block w-full text-center border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm"
              >
                Crear Usuario
              </Link>
            </div>
          </div>

          {/* Gestionar Conductores */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950 mb-2">🚗 Gestionar Conductores</h2>
                <p className="text-slate-600 text-sm">
                  Registra nuevos conductores, actualiza licencias y asigna vehículos
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/drivers"
                className="block w-full text-center bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
              >
                Ver Conductores
              </Link>
              <Link
                href="/admin/drivers/create"
                className="block w-full text-center border border-green-600 text-green-600 py-2 rounded-lg font-semibold hover:bg-green-50 transition text-sm"
              >
                Registrar Conductor
              </Link>
            </div>
          </div>

          {/* Gestionar Vehículos */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950 mb-2">🚌 Gestionar Vehículos</h2>
                <p className="text-slate-600 text-sm">
                  Registra vehículos, actualiza capacidades y controla su estado
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/transports"
                className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
              >
                Ver Vehículos
              </Link>
              <Link
                href="/admin/transports/create"
                className="block w-full text-center border border-purple-600 text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-50 transition text-sm"
              >
                Registrar Vehículo
              </Link>
            </div>
          </div>

          {/* Gestionar Rutas */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950 mb-2">🗺️ Gestionar Rutas</h2>
                <p className="text-slate-600 text-sm">
                  Crea nuevas rutas, asigna vehículos y gestiona destinos
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/routes"
                className="block w-full text-center bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
              >
                Ver Rutas
              </Link>
              <Link
                href="/admin/routes/create"
                className="block w-full text-center border border-orange-600 text-orange-600 py-2 rounded-lg font-semibold hover:bg-orange-50 transition text-sm"
              >
                Crear Ruta
              </Link>
            </div>
          </div>
        </div>

        {/* Información Importante */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">ℹ️ Información Importante</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Como SUPER_ADMIN tienes acceso a todas las funciones del sistema</li>
            <li>✓ Puedes crear y gestionar usuarios con diferentes roles</li>
            <li>✓ Es recomendable crear conductores primero antes de asignarlos a vehículos</li>
            <li>✓ Las rutas requieren vehículos registrados</li>
            <li>✓ Todos los cambios se registran y pueden auditarse</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
