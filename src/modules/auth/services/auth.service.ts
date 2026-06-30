import { UserPayload, UserRole, OperationResult } from '@/shared/types';
import { ERROR_MESSAGES } from '@/shared/constants';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { userRepository } from '../repositories/user.repository';
import { LoginInput, RegisterInput } from '@/shared/validators';

// Auth business logic.
export class AuthService {
  // User login.
  async login(input: LoginInput): Promise<OperationResult<{ user: UserPayload }>> {
    try {
      // Find user.
      const user = await userRepository.findByEmail(input.email);

      if (!user) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS,
        };
      }

      if (!user.is_active) {
        return {
          success: false,
          error: ERROR_MESSAGES.USER_INACTIVE,
        };
      }

      // Check password.
      const isValidPassword = await verifyPassword(input.password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS,
        };
      }

      // Build payload.
      const userPayload: UserPayload = {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role as UserRole,
      };

      return {
        success: true,
        data: { user: userPayload },
      };
    } catch (error) {
      console.error('Auth Service - Login error:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // User register.
  async register(input: RegisterInput): Promise<OperationResult<{ user: UserPayload }>> {
    try {
      // Check email.
      const existingUser = await userRepository.findByEmail(input.email);
      if (existingUser) {
        return {
          success: false,
          error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        };
      }

      // Hash password.
      const hashedPassword = await hashPassword(input.password);

      // Create user.
      const user = await userRepository.create({
        fullname: input.name,
        email: input.email,
        password: hashedPassword,
        role: UserRole.USER,
      });

      // Build payload.
      const userPayload: UserPayload = {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role as UserRole,
      };

      return {
        success: true,
        data: { user: userPayload },
      };
    } catch (error) {
      console.error('Auth Service - Register error:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Create super admin.
  async createSuperAdmin(input: {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    document_number?: string;
  }): Promise<OperationResult<UserPayload>> {
    try {
      // Check super admin.
      const hasSuperAdmin = await userRepository.hasSuperAdmin();
      if (hasSuperAdmin) {
        return {
          success: false,
          error: 'Ya existe un SUPER_ADMIN en el sistema',
        };
      }

      // Check email.
      const existingUser = await userRepository.findByEmail(input.email);
      if (existingUser) {
        return {
          success: false,
          error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        };
      }

      // Hash password.
      const hashedPassword = await hashPassword(input.password);

      // Create super admin.
      const user = await userRepository.create({
        fullname: input.fullname,
        email: input.email,
        password: hashedPassword,
        phone: input.phone,
        document_number: input.document_number,
        role: UserRole.SUPER_ADMIN,
        is_active: true,
      });

      const userPayload: UserPayload = {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role as UserRole,
      };

      return {
        success: true,
        data: userPayload,
      };
    } catch (error) {
      console.error('Auth Service - Create Super Admin error:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

// Service instance.
export const authService = new AuthService();
