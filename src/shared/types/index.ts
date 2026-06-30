// User roles.
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DRIVER = 'DRIVER',
  USER = 'USER',
}

// Auth user.
export interface UserPayload {
  id: number;
  email: string;
  fullname: string;
  role: UserRole;
}

// Database user.
export interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
  phone?: string;
  document_number?: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Driver.
export interface Driver {
  id: number;
  user_id: number;
  transport_id?: number;
  license_type: string;
  experience_years: number;
  license_expiration: Date;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

// Transport.
export interface Transport {
  id: number;
  plate: string;
  model: string;
  capacity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Route.
export interface Route {
  id: number;
  origin: string;
  destination: string;
  transport_id: number;
  created_at: Date;
  updated_at: Date;
}

// API response.
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Operation result.
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
