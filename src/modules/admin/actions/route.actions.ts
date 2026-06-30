'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createRouteSchema } from '@/shared/validators';

export async function createRouteAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.role !== 'SUPER_ADMIN') {
    return { error: 'No tienes permisos para crear rutas.' };
  }

  try {
    const data = createRouteSchema.parse({
      origin: formData.get('origin'),
      destination: formData.get('destination'),
      transport_id: formData.get('transport_id'),
    });

    await prisma.routes.create({
      data: {
        origin: data.origin,
        destination: data.destination,
        transport_id: data.transport_id,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? 'Datos invalidos.' };
    }

    if (error?.code === 'P2003') {
      return { error: 'El vehiculo seleccionado no existe.' };
    }

    console.error('Create route error:', error);
    return { error: 'No se pudo crear la ruta. Intentalo de nuevo.' };
  }

  redirect('/admin/routes');
}
