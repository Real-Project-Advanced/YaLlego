import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

const secret = new TextEncoder().encode(JWT_SECRET);
const refreshSecret = new TextEncoder().encode(JWT_REFRESH_SECRET);

export interface UserPayload {
  id: number;
  email: string;
  fullname: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function generateAccessToken(payload: UserPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(secret);
}

export async function generateRefreshToken(payload: UserPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .sign(refreshSecret);
}

export async function generateTokens(payload: UserPayload): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}

export async function verifyAccessToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, refreshSecret);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function generateToken(payload: UserPayload): Promise<string> {
  // Legacy alias.
  return generateAccessToken(payload);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  // Legacy alias.
  return verifyAccessToken(token);
}

// Store auth cookies.
export async function setAuthCookies(tokens: TokenPair): Promise<void> {
  const cookieStore = await cookies();

  // Short-lived token.
  cookieStore.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  });

  // Long-lived token.
  cookieStore.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Store legacy cookie.
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('refreshToken')?.value;
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value;
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('auth-token');
}

export async function clearAuthCookie(): Promise<void> {
  await clearAuthCookies();
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const token = await getAccessToken();
  if (!token) return null;
  return verifyAccessToken(token);
}

// Refresh tokens.
export async function refreshUserTokens(): Promise<TokenPair | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) return null;

  const newTokens = await generateTokens(payload);
  await setAuthCookies(newTokens);

  return newTokens;
}
