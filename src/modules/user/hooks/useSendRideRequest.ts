'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserPayload } from '@/lib/auth';
import type {
  ActiveDriverLocation,
  Parada,
  SearchRouteResult,
} from '../components/UserRouteMapShared';
import {
  createLocalRideRequest,
  isMissingSupabaseTableError,
} from '@/modules/shared/services/localRealtimeFallback';

type SendRideRequestInput = {
  driver: ActiveDriverLocation;
  nearestStop: Parada | null;
  route: SearchRouteResult;
  user: UserPayload;
};

const getDriverIdFromCode = (driverCode: string) => {
  const driverId = Number(driverCode.replace(/\D/g, ''));

  return Number.isFinite(driverId) && driverId > 0 ? driverId : null;
};

export function useSendRideRequest() {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const sendRideRequest = useCallback(
    async ({ driver, nearestStop, route, user }: SendRideRequestInput) => {
      const driverId = driver.driverId ?? getDriverIdFromCode(driver.driverCode);

      if (!driverId) {
        setError('No pude identificar el conductor seleccionado.');
        return null;
      }

      setError('');
      setIsSending(true);

      const { data, error: requestError } = await supabase
        .from('ride_requests')
        .insert({
          driver_id: String(driverId),
          driver_code: driver.driverCode,
          route_name: driver.routeName,
          user_id: String(user.id),
          user_name: user.fullname,
          user_lat: route.startPoint.lat,
          user_lng: route.startPoint.lng,
          nearest_stop: nearestStop?.titulo ?? route.startPoint.name,
          stop_name: nearestStop?.titulo ?? route.startPoint.name,
          stop_lat: nearestStop?.latitud ?? route.startPoint.lat,
          stop_lng: nearestStop?.longitud ?? route.startPoint.lng,
          destination_name: route.endPoint.name,
          destination_lat: route.endPoint.lat,
          destination_lng: route.endPoint.lng,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      setIsSending(false);

      if (requestError) {
        if (isMissingSupabaseTableError(requestError.message)) {
          const localRequest = createLocalRideRequest({
            driver_id: String(driverId),
            driver_code: driver.driverCode,
            route_name: driver.routeName,
            user_id: String(user.id),
            user_name: user.fullname,
            user_lat: route.startPoint.lat,
            user_lng: route.startPoint.lng,
            nearest_stop: nearestStop?.titulo ?? route.startPoint.name,
            stop_name: nearestStop?.titulo ?? route.startPoint.name,
            stop_lat: nearestStop?.latitud ?? route.startPoint.lat,
            stop_lng: nearestStop?.longitud ?? route.startPoint.lng,
            destination_name: route.endPoint.name,
            destination_lat: route.endPoint.lat,
            destination_lng: route.endPoint.lng,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          setRequestId(localRequest.id);
          setError('');
          return localRequest.id;
        }

        setError(requestError.message);
        return null;
      }

      const nextRequestId = String(data?.id ?? '');
      setRequestId(nextRequestId);

      await supabase.from('push_notifications').insert({
        ride_request_id: nextRequestId,
        driver_id: String(driverId),
        title: 'Nueva solicitud de bus',
        body: `${user.fullname} solicita tu bus en ${nearestStop?.titulo ?? route.startPoint.name}.`,
        created_at: new Date().toISOString(),
      });

      return nextRequestId;
    },
    [],
  );

  return { error, isSending, requestId, sendRideRequest };
}
