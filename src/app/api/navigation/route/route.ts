import { NextRequest, NextResponse } from 'next/server';

const goTrackingBaseURL =
  process.env.NEXT_PUBLIC_GO_TRACKING_URL?.replace(/\/$/, '') || 'http://localhost:8080';

type OsrmResponse = {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: {
      coordinates?: [number, number][];
    };
  }>;
};

type RoutePoint = {
  lat: number;
  lng: number;
};

const parseCoordinate = (value: string | null) => {
  if (!value) return null;

  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

const buildOsrmURL = (points: RoutePoint[], alternatives: boolean) => {
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(';');
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    alternatives: alternatives ? 'true' : 'false',
    steps: 'false',
  });

  return `https://router.project-osrm.org/route/v1/driving/${coordinates}?${params.toString()}`;
};

const buildReturnDetourPoints = (origin: RoutePoint, destination: RoutePoint) => {
  const deltaLat = destination.lat - origin.lat;
  const deltaLng = destination.lng - origin.lng;
  const length = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);

  if (length === 0) return [];

  const perpendicularLat = -deltaLng / length;
  const perpendicularLng = deltaLat / length;
  const midpoint = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };
  const offsets = [0.008, -0.008, 0.0045, -0.0045];

  return offsets.map((offset) => ({
    lat: midpoint.lat + perpendicularLat * offset,
    lng: midpoint.lng + perpendicularLng * offset,
  }));
};

async function fetchOsrmRoute(points: RoutePoint[], alternatives: boolean) {
  const response = await fetch(buildOsrmURL(points, alternatives), { cache: 'no-store' });
  if (!response.ok) return null;

  const payload = (await response.json()) as OsrmResponse;
  return payload.routes?.[0] ?? null;
}

async function getOsrmFallbackRoute(searchParams: URLSearchParams) {
  const preferAlternative = searchParams.get('returning') === '1';
  const originLat = parseCoordinate(searchParams.get('originLat'));
  const originLng = parseCoordinate(searchParams.get('originLng'));
  const destinationLat = parseCoordinate(searchParams.get('destinationLat'));
  const destinationLng = parseCoordinate(searchParams.get('destinationLng'));

  if (
    originLat === null ||
    originLng === null ||
    destinationLat === null ||
    destinationLng === null
  ) {
    return NextResponse.json({ error: 'Missing route coordinates' }, { status: 400 });
  }

  const origin = { lat: originLat, lng: originLng };
  const destination = { lat: destinationLat, lng: destinationLng };
  let route = null;

  if (preferAlternative) {
    for (const detour of buildReturnDetourPoints(origin, destination)) {
      route = await fetchOsrmRoute([origin, detour, destination], false);
      if (route?.geometry?.coordinates?.length) break;
    }
  }

  route = route ?? (await fetchOsrmRoute([origin, destination], preferAlternative));
  const routeCoordinates = route?.geometry?.coordinates;

  if (!route || !routeCoordinates?.length) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }

  return NextResponse.json({
    coordinates: routeCoordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    provider: preferAlternative ? 'osrm-return-detour' : 'osrm',
  });
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('returning') === '1') {
    return getOsrmFallbackRoute(request.nextUrl.searchParams);
  }

  const targetURL = `${goTrackingBaseURL}/navigation/route?${request.nextUrl.searchParams.toString()}`;

  try {
    const response = await fetch(targetURL, { cache: 'no-store' });
    if (!response.ok) {
      return getOsrmFallbackRoute(request.nextUrl.searchParams);
    }

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
      },
    });
  } catch {
    return getOsrmFallbackRoute(request.nextUrl.searchParams);
  }
}
