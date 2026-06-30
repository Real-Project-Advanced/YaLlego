'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  isMissingSupabaseTableError,
  readLocalRideRequests,
  updateLocalRideRequestStatus,
} from '@/modules/shared/services/localRealtimeFallback';

export type RideRequest = {
  id: string;
  driver_id?: string | number | null;
  driver_code?: string | null;
  route_name?: string | null;
  user_id?: string | number | null;
  user_name?: string | null;
  user_lat?: number | null;
  user_lng?: number | null;
  stop_name?: string | null;
  stop_lat?: number | null;
  stop_lng?: number | null;
  nearest_stop?: string | null;
  destination_name?: string | null;
  destination_lat?: number | null;
  destination_lng?: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | string;
  created_at?: string | null;
  updated_at?: string | null;
};

type UseRideRequestsOptions = {
  driverId: number;
};

export function useRideRequests({ driverId }: UseRideRequestsOptions) {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [error, setError] = useState('');

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === 'pending'),
    [requests],
  );

  const loadRequests = useCallback(async () => {
    const { data, error: requestError } = await supabase
      .from('ride_requests')
      .select('*')
      .eq('driver_id', String(driverId))
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestError) {
      if (isMissingSupabaseTableError(requestError.message)) {
        setRequests(
          readLocalRideRequests()
            .filter(
              (request) =>
                String(request.driver_id ?? '') === String(driverId) &&
                request.status === 'pending',
            )
            .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''))),
        );
        setError('');
        return;
      }

      setError(requestError.message);
      return;
    }

    setRequests((data ?? []) as RideRequest[]);
    setError('');
  }, [driverId]);

  const updateRequestStatus = useCallback(
    async (requestId: string, status: 'accepted' | 'rejected') => {
      const { error: updateError } = await supabase
        .from('ride_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (updateError) {
        if (!isMissingSupabaseTableError(updateError.message)) {
          setError(updateError.message);
          return false;
        }
      }

      updateLocalRideRequestStatus(requestId, status);
      setRequests((current) =>
        current.map((request) => (request.id === requestId ? { ...request, status } : request)),
      );

      await supabase.from('push_notifications').insert({
        ride_request_id: requestId,
        title: status === 'accepted' ? 'Tu bus viene' : 'Bus no disponible',
        body:
          status === 'accepted'
            ? 'Tu bus viene, espera en tu parada asignada.'
            : 'Bus no disponible, intenta con otro.',
        created_at: new Date().toISOString(),
      });

      return true;
    },
    [],
  );

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadRequests();
    }, 0);
    const interval = window.setInterval(() => {
      void loadRequests();
    }, 1500);

    const channel = supabase
      .channel(`driver-ride-requests-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ride_requests',
          filter: `driver_id=eq.${driverId}`,
        },
        () => {
          void loadRequests();
        },
      )
      .subscribe();

    return () => {
      window.clearTimeout(loadTimer);
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [driverId, loadRequests]);

  return {
    error,
    pendingRequests,
    updateRequestStatus,
  };
}
