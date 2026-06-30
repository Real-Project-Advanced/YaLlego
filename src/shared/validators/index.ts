import { z } from 'zod';

const hasUppercase = /[A-Z]/;
const hasLowercase = /[a-z]/;
const hasNumber = /[0-9]/;

// Login schema.
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'El correo es requerido.').email('Ingresa un correo valido.'),
  password: z.string().min(1, 'La contrasena es requerida.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register schema.
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ingresa tu nombre completo.'),
  email: z.string().trim().min(1, 'El correo es requerido.').email('Ingresa un correo valido.'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres.')
    .regex(hasUppercase, 'Agrega al menos una letra mayuscula.')
    .regex(hasLowercase, 'Agrega al menos una letra minuscula.')
    .regex(hasNumber, 'Agrega al menos un numero.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Super admin schema.
export const createSuperAdminSchema = z.object({
  fullname: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Contrasena debe tener al menos 8 caracteres'),
  phone: z.string().optional(),
  document_number: z.string().optional(),
});

export type CreateSuperAdminInput = z.infer<typeof createSuperAdminSchema>;

// Driver schema.
export const createDriverSchema = z.object({
  user_id: z.number().positive(),
  license_type: z.string().min(1),
  experience_years: z.number().nonnegative(),
  license_expiration: z.string().datetime(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;

// Transport schema.
export const createTransportSchema = z.object({
  plate: z.string().min(1),
  model: z.string().min(1),
  capacity: z.number().positive(),
});

export type CreateTransportInput = z.infer<typeof createTransportSchema>;

// Route schema.
export const createRouteSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  transport_id: z.number().positive(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
