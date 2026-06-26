// Configuration constants
export const APP_NAME = 'LlegoYa';
export const APP_VERSION = '0.1.0';

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Bcrypt configuration
export const BCRYPT_ROUNDS = 12;

// Common error messages
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_PASSWORD: 'Incorrect password',
  USER_INACTIVE: 'User is inactive',
  EMAIL_ALREADY_EXISTS: 'Email is already registered',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Access denied',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
} as const;

// Common success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Signed in successfully',
  REGISTER_SUCCESS: 'Registered successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  CREATION_SUCCESS: 'Created successfully',
  UPDATE_SUCCESS: 'Updated successfully',
  DELETE_SUCCESS: 'Deleted successfully',
} as const;
