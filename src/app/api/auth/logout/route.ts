import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    // Eliminar cookies de autenticación
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('auth-token');

    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error('API Logout Error:', error);
    return NextResponse.json({ error: 'Error logging out' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
