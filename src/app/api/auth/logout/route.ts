import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function getLogoutRedirectURL(req: Request) {
  const requestURL = new URL(req.url);
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || requestURL.origin;
  const redirectURL = new URL('/login?force=true', origin);

  if (redirectURL.hostname === '0.0.0.0') {
    redirectURL.hostname = 'localhost';
  }

  return redirectURL;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    // Eliminar cookies de autenticación
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('auth-token');

    return NextResponse.redirect(getLogoutRedirectURL(req), { status: 303 });
  } catch (error) {
    console.error('API Logout Error:', error);
    return NextResponse.json({ error: 'Error logging out' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
