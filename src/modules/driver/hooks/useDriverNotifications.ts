'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';

type UseDriverNotificationsOptions = {
  conductorId: number;
  onOpenRequests?: () => void;
};

type PushNotificationsModule = {
  PushNotifications: {
    requestPermissions: () => Promise<unknown>;
    register: () => Promise<void>;
    addListener: (
      eventName: string,
      listenerFunc: (payload: { value?: string }) => void,
    ) => Promise<{ remove: () => Promise<void> }> | { remove: () => Promise<void> };
  };
};

const importPushNotifications = async () => {
  const dynamicImport = new Function('specifier', 'return import(specifier)') as (
    specifier: string,
  ) => Promise<PushNotificationsModule>;

  return dynamicImport('@capacitor/push-notifications');
};

export function useDriverNotifications({
  conductorId,
  onOpenRequests,
}: UseDriverNotificationsOptions) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isMounted = true;
    const cleanups: Array<() => void> = [];

    const setupNotifications = async () => {
      try {
        const { PushNotifications } = await importPushNotifications();

        await PushNotifications.requestPermissions();
        await PushNotifications.register();

        const registration = await PushNotifications.addListener('registration', (token) => {
          if (!token.value) return;

          void supabase.from('push_tokens').upsert({
            user_id: String(conductorId),
            token: token.value,
            platform: Capacitor.getPlatform(),
            updated_at: new Date().toISOString(),
          });
        });

        const received = await PushNotifications.addListener('pushNotificationReceived', () => {
          onOpenRequests?.();
        });

        const action = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          () => {
            onOpenRequests?.();
          },
        );

        if (!isMounted) {
          await registration.remove();
          await received.remove();
          await action.remove();
          return;
        }

        cleanups.push(() => void registration.remove());
        cleanups.push(() => void received.remove());
        cleanups.push(() => void action.remove());
      } catch (error) {
        console.warn('Push notifications are not available yet.', error);
      }
    };

    void setupNotifications();

    return () => {
      isMounted = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [conductorId, onOpenRequests]);
}
