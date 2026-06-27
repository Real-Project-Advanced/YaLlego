import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

export async function GET() {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  return NextResponse.json({ token });
}
