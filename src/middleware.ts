import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

const secret = new TextEncoder().encode(JWT_SECRET);
const refreshSecret = new TextEncoder().encode(JWT_REFRESH_SECRET);

type UserPayload = {
  id: number;
  email: string;
  fullname: string;
  role: string;
};

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

async function verifyToken(token: string, tokenSecret: Uint8Array) {
  try {
    const { payload } = await jose.jwtVerify(token, tokenSecret);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

async function generateToken(payload: UserPayload, tokenSecret: Uint8Array, expiresIn: string) {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(tokenSecret);
}

function getPostLoginPath(role: string) {
  if (role === 'SUPER_ADMIN') return '/admin';
  if (role === 'DRIVER') return '/driver';
  return '/user';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/login', '/register', '/bootstrap', '/status', '/temp-dashboard'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  let user = accessToken ? await verifyToken(accessToken, secret) : null;

  if (isPublicRoute) {
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL(getPostLoginPath(user.role), request.url));
    }

    return NextResponse.next();
  }
  if (isPublicRoute) {
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL(getPostLoginPath(user.role), request.url));
    }
    return NextResponse.next();
  }
  if (!user) {
    user = refreshToken ? await verifyToken(refreshToken, refreshSecret) : null;

    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    const [newAccessToken, newRefreshToken] = await Promise.all([
      generateToken(user, secret, ACCESS_TOKEN_EXPIRES_IN),
      generateToken(user, refreshSecret, REFRESH_TOKEN_EXPIRES_IN),
    ]);

    response.cookies.set('accessToken', newAccessToken, {
      ...authCookieOptions,
      maxAge: 60 * 15,
    });
    response.cookies.set('refreshToken', newRefreshToken, {
      ...authCookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
