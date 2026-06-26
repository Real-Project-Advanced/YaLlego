import { prisma } from '@/lib/prisma';
import { User, UserRole } from '@/shared/types';

/**
 * UserRepository: Capa de acceso a datos para usuarios
 */
export class UserRepository {
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.users.findUnique({
      where: { email },
    }) as Promise<User | null>;
  }

  /**
   * Find a user by ID
   */
  async findById(id: number): Promise<User | null> {
    return prisma.users.findUnique({
      where: { id },
    }) as Promise<User | null>;
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAll(): Promise<User[]> {
    return prisma.users.findMany() as Promise<User[]>;
  }

  /**
   * Obtiene usuarios por rol
   */
  async findByRole(role: UserRole): Promise<User[]> {
    return prisma.users.findMany({
      where: { role: role as UserRole },
    }) as Promise<User[]>;
  }

  /**
   * Crea un nuevo usuario
   */
  async create(data: {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    document_number?: string;
    role: UserRole;
    is_active?: boolean;
  }): Promise<User> {
    return prisma.users.create({
      data: {
        fullname: data.fullname,
        email: data.email,
        password: data.password,
        phone: data.phone,
        document_number: data.document_number,
        role: data.role as UserRole,
        is_active: data.is_active ?? true,
      },
    }) as Promise<User>;
  }

  /**
   * Actualiza un usuario
   */
  async update(
    id: number,
    data: Partial<{
      fullname: string;
      email: string;
      password: string;
      phone: string;
      document_number: string;
      role: UserRole;
      is_active: boolean;
    }>,
  ): Promise<User> {
    return prisma.users.update({
      where: { id },
      data: {
        ...data,
        role: data.role ? (data.role as UserRole) : undefined,
      },
    }) as Promise<User>;
  }

  /**
   * Elimina un usuario
   */
  async delete(id: number): Promise<void> {
    await prisma.users.delete({
      where: { id },
    });
  }

  /**
   * Verifica si existe un SUPER_ADMIN
   */
  async hasSuperAdmin(): Promise<boolean> {
    const admin = await prisma.users.findFirst({
      where: { role: 'SUPER_ADMIN' as UserRole },
    });
    return !!admin;
  }
}

// Instancia del repositorio
export const userRepository = new UserRepository();
