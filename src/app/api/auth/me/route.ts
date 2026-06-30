import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
export const dynamic = 'force-static';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('API Me Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
