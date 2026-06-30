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
