import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// Create the first super admin.
export async function POST(request: Request) {
  try {
    // Check super admin.
    const existingAdmin = await prisma.users.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          error: 'Ya existe un SUPER_ADMIN en el sistema',
          message: 'No se puede crear otro SUPER_ADMIN. Contacta al administrador.',
        },
        { status: 403 },
      );
    }

    // Parse body.
    const body = await request.json();
    const { fullname, email, password, phone, document_number } = body;

    // Basic validation.
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: 'fullname, email y password son requeridos' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 },
      );
    }

    // Check email.
    const emailExists = await prisma.users.findUnique({
      where: { email },
    });

    if (emailExists) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }

    // Hash password.
    const hashedPassword = await hashPassword(password);

    // Create super admin.
    const admin = await prisma.users.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
        phone: phone || null,
        document_number: document_number || null,
        role: 'SUPER_ADMIN',
        is_active: true,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'SUPER_ADMIN creado exitosamente',
        admin,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Bootstrap error:', error);
    return NextResponse.json({ error: 'Error al crear SUPER_ADMIN' }, { status: 500 });
  }
}
