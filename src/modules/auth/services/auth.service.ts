import { UserPayload, UserRole, OperationResult } from '@/shared/types';
import { ERROR_MESSAGES } from '@/shared/constants';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { userRepository } from '../repositories/user.repository';
import { LoginInput, RegisterInput } from '@/shared/validators';

/**
 * AuthService: Lógica empresarial de autenticación
 */
export class AuthService {
  /**
   * Login de usuario
   */
  async login(input: LoginInput): Promise<OperationResult<{ user: UserPayload }>> {
    try {
      // Buscar usuario
      const user = await userRepository.findByEmail(input.email);

      if (!user) {
        return {
          success: false,
          error: ERROR_MESSAGES.USER_NOT_FOUND,
        };
      }

      if (!user.is_active) {
        return {
          success: false,
          error: ERROR_MESSAGES.USER_INACTIVE,
        };
      }

      // Verificar contraseña
      const isValidPassword = await verifyPassword(input.password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_PASSWORD,
        };
      }

      // Preparar payload del usuario
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

  /**
   * User registration
   */
  async register(input: RegisterInput): Promise<OperationResult<{ user: UserPayload }>> {
    try {
      // Verificar si el email ya existe
      const existingUser = await userRepository.findByEmail(input.email);
      if (existingUser) {
        return {
          success: false,
          error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        };
      }

      // Hash de contraseña
      const hashedPassword = await hashPassword(input.password);

      // Create user
      const user = await userRepository.create({
        fullname: input.name,
        email: input.email,
        password: hashedPassword,
        role: UserRole.USER,
      });

      // Preparar payload del usuario
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

  /**
   * Create SUPER_ADMIN (Bootstrap)
   */
  async createSuperAdmin(input: {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    document_number?: string;
  }): Promise<OperationResult<UserPayload>> {
    try {
      // Verificar si ya existe un SUPER_ADMIN
      const hasSuperAdmin = await userRepository.hasSuperAdmin();
      if (hasSuperAdmin) {
        return {
          success: false,
          error: 'Ya existe un SUPER_ADMIN en el sistema',
        };
      }

      // Verificar si el email existe
      const existingUser = await userRepository.findByEmail(input.email);
      if (existingUser) {
        return {
          success: false,
          error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        };
      }

      // Hash de contraseña
      const hashedPassword = await hashPassword(input.password);

      // Create SUPER_ADMIN
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

// Instancia del servicio
export const authService = new AuthService();
