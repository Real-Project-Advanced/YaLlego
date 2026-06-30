'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  isMissingSupabaseTableError,
  readLocalRideRequests,
  updateLocalRideRequestStatus,
} from '@/modules/shared/services/localRealtimeFallback';

export type UserRideRequest = {
  id: string;
  route_name?: string | null;
  driver_code?: string | null;
  nearest_stop?: string | null;
  stop_name?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | string;
  created_at?: string | null;
  updated_at?: string | null;
};

export function useRideRequestStatus(requestId: string | null) {
  const [request, setRequest] = useState<UserRideRequest | null>(null);
  const [error, setError] = useState('');

  const loadRequest = useCallback(async () => {
    if (!requestId) {
      setRequest(null);
      return;
    }

    const { data, error: requestError } = await supabase
      .from('ride_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) {
      if (isMissingSupabaseTableError(requestError.message)) {
        setRequest(
          (readLocalRideRequests().find((item) => item.id === requestId) as UserRideRequest) ??
            null,
        );
        setError('');
        return;
      }

      setError(requestError.message);
      return;
    }

    setRequest(data as UserRideRequest);
    setError('');
  }, [requestId]);

  const completeRequest = useCallback(async () => {
    if (!requestId) return false;

    const { error: updateError } = await supabase
      .from('ride_requests')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) {
      if (!isMissingSupabaseTableError(updateError.message)) {
        setError(updateError.message);
        return false;
      }
    }

    updateLocalRideRequestStatus(requestId, 'completed');
    setRequest((current) => (current ? { ...current, status: 'completed' } : current));
    return true;
  }, [requestId]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadRequest();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadRequest]);

  useEffect(() => {
    if (!requestId) return;

    const channel = supabase
      .channel(`user-ride-request-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ride_requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          setRequest(payload.new as UserRideRequest);
        },
      )
      .subscribe();
    const syncLocalRequest = () => {
      setRequest(
        (readLocalRideRequests().find((item) => item.id === requestId) as UserRideRequest) ?? null,
      );
    };
    const interval = window.setInterval(syncLocalRequest, 1500);

    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [requestId]);

  return { completeRequest, error, request };
}
