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

// Driver account schema.
export const createDriverAccountSchema = z.object({
  fullname: z.string().trim().min(2, 'Ingresa el nombre completo del conductor.'),
  email: z.string().trim().min(1, 'El correo es requerido.').email('Ingresa un correo valido.'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres.')
    .regex(hasUppercase, 'Agrega al menos una letra mayuscula.')
    .regex(hasLowercase, 'Agrega al menos una letra minuscula.')
    .regex(hasNumber, 'Agrega al menos un numero.'),
  phone: z.string().trim().optional(),
  document_number: z.string().trim().optional(),
  transport_id: z.coerce
    .number()
    .positive()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  license_type: z.string().trim().min(1, 'Selecciona o escribe el tipo de licencia.'),
  experience_years: z.coerce
    .number()
    .int('Los anos de experiencia deben ser un numero entero.')
    .min(0, 'Los anos de experiencia no pueden ser negativos.'),
  license_expiration: z
    .string()
    .min(1, 'La fecha de vencimiento de la licencia es requerida.')
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)), 'Fecha invalida.'),
});

export type CreateDriverAccountInput = z.infer<typeof createDriverAccountSchema>;

// Transport schema.
export const createTransportSchema = z.object({
  plate: z.string().trim().min(1, 'La placa es requerida.').max(50, 'La placa es muy larga.'),
  model: z.string().trim().min(1, 'El modelo es requerido.').max(100, 'El modelo es muy largo.'),
  capacity: z.coerce
    .number()
    .int('La capacidad debe ser un numero entero.')
    .positive('La capacidad debe ser mayor que cero.'),
});

export type CreateTransportInput = z.infer<typeof createTransportSchema>;

// Route schema.
export const createRouteSchema = z.object({
  origin: z.string().trim().min(1, 'El origen es requerido.'),
  destination: z.string().trim().min(1, 'El destino es requerido.'),
  transport_id: z.coerce.number().positive('Selecciona un vehiculo.'),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
