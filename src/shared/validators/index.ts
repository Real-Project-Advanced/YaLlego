import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Registration schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Create SUPER_ADMIN schema
export const createSuperAdminSchema = z.object({
  fullname: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  document_number: z.string().optional(),
});

export type CreateSuperAdminInput = z.infer<typeof createSuperAdminSchema>;

// Create driver schema
export const createDriverSchema = z.object({
  user_id: z.number().positive(),
  license_type: z.string().min(1),
  experience_years: z.number().nonnegative(),
  license_expiration: z.string().datetime(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;

// Create transport schema
export const createTransportSchema = z.object({
  plate: z.string().min(1),
  model: z.string().min(1),
  capacity: z.number().positive(),
});

export type CreateTransportInput = z.infer<typeof createTransportSchema>;

// Create route schema
export const createRouteSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  transport_id: z.number().positive(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
