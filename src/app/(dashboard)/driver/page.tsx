import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DriverDashboard } from '@/modules/driver/components';
import type { DriverProfile, DriverRoute } from '@/modules/driver/components/DriverDashboard';

const fallbackCoordinates: [number, number][] = [
  [6.253, -75.5905],
  [6.2493, -75.586],
  [6.2442, -75.5812],
  [6.2396, -75.575],
  [6.2351, -75.5698],
];

const fallbackRoutes: DriverRoute[] = [
  {
    origin: 'Circular',
    destination: 'Laureles',
    name: 'Circular Laureles',
    coordinates: fallbackCoordinates,
    distanceKm: 4.8,
  },
  {
    origin: 'Terminal Norte',
    destination: 'Parque Berrio',
    name: 'Ruta Centro',
    coordinates: [
      [6.2842, -75.5612],
      [6.2708, -75.567],
      [6.2586, -75.574],
      [6.2442, -75.5812],
    ],
    distanceKm: 5.5,
  },
  {
    origin: 'Parque Poblado',
    destination: 'Parque Lleras',
    name: 'Ruta Poblado',
    coordinates: [
      [6.21, -75.57],
      [6.2078, -75.5683],
      [6.2035, -75.5652],
      [6.2, -75.56],
    ],
    distanceKm: 2.5,
  },
];

const formatDriverCode = (driverId: number) => `C-${String(driverId).padStart(3, '0')}`;

const buildRoute = (origin?: string, destination?: string): DriverRoute => {
  const cleanOrigin = origin || 'Circular';
  const cleanDestination = destination || 'Laureles';

  return {
    origin: cleanOrigin,
    destination: cleanDestination,
    name: `${cleanOrigin} ${cleanDestination}`,
    coordinates: fallbackCoordinates,
    distanceKm: 4.8,
  };
};

export default async function DriverPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'DRIVER') {
    redirect('/');
  }

  const driver = await prisma.drivers.findUnique({
    where: { user_id: user.id },
    include: {
      transports: {
        include: {
          routes: true,
        },
      },
    },
  });

  const routes = await prisma.routes.findMany({
    orderBy: { id: 'asc' },
  });

  const assignedRoute = driver?.transports?.routes[0];
  const initialRoute = assignedRoute
    ? buildRoute(assignedRoute.origin, assignedRoute.destination)
    : routes.length > 0
      ? buildRoute(routes[0].origin, routes[0].destination)
      : fallbackRoutes[0];
  const driverId = driver?.id ?? user.id;
  const profile: DriverProfile = {
    driverId,
    driverCode: formatDriverCode(driverId),
    licenseType: driver?.license_type ?? 'Sin registrar',
    experienceYears: driver?.experience_years ?? 0,
    route: initialRoute,
    availableRoutes: [initialRoute],
    totalAcceptedRequests: 0,
  };

  return <DriverDashboard profile={profile} user={user} />;
}
