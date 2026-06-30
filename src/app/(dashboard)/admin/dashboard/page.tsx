import { AdminOverview } from '@/components/features/AdminOverview';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

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

  const stats = [
    { title: 'Users', value: userCount, borderClassName: 'border-blue-500' },
    { title: 'Drivers', value: driverCount, borderClassName: 'border-green-500' },
    { title: 'Vehicles', value: vehicleCount, borderClassName: 'border-purple-500' },
    { title: 'Routes', value: routeCount, borderClassName: 'border-orange-500' },
  ];

  return (
    <AdminOverview
      user={user}
      counts={{
        users: userCount,
        drivers: driverCount,
        vehicles: vehicleCount,
        routes: routeCount,
      }}
    />
  );
}
