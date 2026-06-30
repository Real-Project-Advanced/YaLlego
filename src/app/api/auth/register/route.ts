import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/services/auth.service';
import { setAuthCookies } from '@/lib/auth';
import { registerSchema } from '@/shared/validators';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const result = await authService.register({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.data) {
      // Set auth cookies.
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
      });
    }

    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('API Register Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
