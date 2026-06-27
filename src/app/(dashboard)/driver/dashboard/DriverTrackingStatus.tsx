'use client';

import { useDriverTracking } from '@/hooks/useDriverTracking';

export default function DriverTrackingStatus() {
  useDriverTracking();

  return <p className="text-slate-600">Tu ubicación se está compartiendo en tiempo real.</p>;
}
