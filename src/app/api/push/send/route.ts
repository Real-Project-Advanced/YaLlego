import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type PushRequest = {
  recipientUserId?: string;
  rideRequestId?: string;
  driverId?: string;
  title?: string;
  body?: string;
};

type PushTokenRow = {
  token: string;
};

const getFirebaseServerKey = () =>
  process.env.FCM_SERVER_KEY ?? process.env.FIREBASE_SERVER_KEY ?? '';

async function sendFirebasePush(tokens: string[], title: string, body: string) {
  const serverKey = getFirebaseServerKey();
  if (!serverKey || tokens.length === 0) return { sent: 0, configured: Boolean(serverKey) };

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${serverKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registration_ids: tokens,
      notification: { title, body },
      data: { title, body },
    }),
  });

  if (!response.ok) {
    throw new Error(`FCM responded with ${response.status}`);
  }

  return { sent: tokens.length, configured: true };
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as PushRequest;
    const title = payload.title?.trim();
    const body = payload.body?.trim();

    if (!title || !body) {
      return NextResponse.json({ error: 'Missing push title or body' }, { status: 400 });
    }

    await supabase.from('push_notifications').insert({
      ride_request_id: payload.rideRequestId || null,
      driver_id: payload.driverId || null,
      title,
      body,
      created_at: new Date().toISOString(),
    });

    if (!payload.recipientUserId) {
      return NextResponse.json({ queued: true, sent: 0, pushConfigured: false });
    }

    const { data: tokenRows } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', payload.recipientUserId);
    const tokens = ((tokenRows ?? []) as PushTokenRow[]).map((row) => row.token).filter(Boolean);
    const pushResult = await sendFirebasePush(tokens, title, body);

    return NextResponse.json({ queued: true, ...pushResult });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Push notification failed',
      },
      { status: 500 },
    );
  }
}
