import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/services/auth.service';
import { setAuthCookies } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

function getPostLoginPath(role: string) {
  if (role === 'SUPER_ADMIN') return '/admin';
  if (role === 'DRIVER') return '/driver';
  return '/user';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    const result = await authService.login(validatedData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    if (result.data) {
      // Generar tokens y establecer cookies
      const { generateTokens } = await import('@/lib/auth');
      const tokens = await generateTokens({
        id: result.data.user.id,
        email: result.data.user.email,
        fullname: result.data.user.fullname,
        role: result.data.user.role,
      });

      await setAuthCookies(tokens);

      return NextResponse.json({
        success: true,
        user: result.data.user,
        redirectTo: getPostLoginPath(result.data.user.role),
      });
    }

    return NextResponse.json({ error: 'Error signing in' }, { status: 500 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('API Login Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
