'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTransportSchema } from '@/shared/validators';

export async function createTransportAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.role !== 'SUPER_ADMIN') {
    return { error: 'No tienes permisos para crear vehiculos.' };
  }

  try {
    const data = createTransportSchema.parse({
      plate: formData.get('plate'),
      model: formData.get('model'),
      capacity: formData.get('capacity'),
    });

    await prisma.transports.create({
      data: {
        plate: data.plate.toUpperCase(),
        model: data.model,
        capacity: data.capacity,
        is_active: true,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? 'Datos invalidos.' };
    }

    if (error?.code === 'P2002') {
      return { error: 'Ya existe un vehiculo con esa placa.' };
    }

    console.error('Create transport error:', error);
    return { error: 'No se pudo crear el vehiculo. Intentalo de nuevo.' };
  }

  redirect('/admin/transports');
}
