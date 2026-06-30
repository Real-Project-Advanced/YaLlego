// App config.
export const APP_NAME = 'NEXTHUS';
export const APP_VERSION = '0.1.0';

// JWT config.
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Bcrypt config.
export const BCRYPT_ROUNDS = 12;

// Error messages.
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'Usuario no encontrado',
  INVALID_PASSWORD: 'Contraseña incorrecta',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  USER_INACTIVE: 'Usuario inactivo',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  VALIDATION_ERROR: 'Error de validación',
} as const;

// Success messages.
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Sesión iniciada correctamente',
  REGISTER_SUCCESS: 'Registro exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  CREATION_SUCCESS: 'Creación exitosa',
  UPDATE_SUCCESS: 'Actualización exitosa',
  DELETE_SUCCESS: 'Eliminación exitosa',
} as const;
