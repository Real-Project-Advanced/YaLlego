'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createDriverAccountSchema } from '@/shared/validators';

export async function createDriverAccountAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.role !== 'SUPER_ADMIN') {
    return { error: 'No tienes permisos para crear conductores.' };
  }

  try {
    const data = createDriverAccountSchema.parse({
      fullname: formData.get('fullname'),
      email: formData.get('email'),
      password: formData.get('password'),
      phone: formData.get('phone') || undefined,
      document_number: formData.get('document_number') || undefined,
      transport_id: formData.get('transport_id') || undefined,
      license_type: formData.get('license_type'),
      experience_years: formData.get('experience_years'),
      license_expiration: formData.get('license_expiration'),
    });

    const hashedPassword = await hashPassword(data.password);
    const licenseExpiration = new Date(`${data.license_expiration}T00:00:00`);

    await prisma.users.create({
      data: {
        fullname: data.fullname,
        email: data.email,
        password: hashedPassword,
        phone: data.phone || undefined,
        document_number: data.document_number || undefined,
        role: 'DRIVER',
        is_active: true,
        drivers_drivers_user_idTousers: {
          create: {
            transport_id: data.transport_id,
            license_type: data.license_type,
            experience_years: data.experience_years,
            license_expiration: licenseExpiration,
            created_by: currentUser.id,
          },
        },
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? 'Datos invalidos.' };
    }

    if (error?.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : '';
      if (target.includes('email')) return { error: 'Ya existe una cuenta con ese correo.' };
      if (target.includes('user_id'))
        return { error: 'Ese usuario ya esta registrado como conductor.' };
      return { error: 'Ya existe un registro con esos datos.' };
    }

    console.error('Create driver account error:', error);
    return { error: 'No se pudo crear el conductor. Intentalo de nuevo.' };
  }

  redirect('/admin/drivers');
}
