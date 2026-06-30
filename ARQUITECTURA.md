# Arquitectura Modular por Capas - LlegoYa

## 📋 Estructura General

El proyecto está organizado en capas bien definidas para facilitar el mantenimiento, testing y escalabilidad:

```
src/
├── backend/              # Lógica empresarial y acceso a datos
│   ├── api/              # Controladores/endpoints de API
│   ├── services/         # Lógica empresarial
│   ├── repositories/     # Acceso a base de datos (DAO pattern)
│   ├── middleware/       # Middlewares (autenticación, validación)
│   ├── utils/            # Utilidades backend (crypto, jwt)
│   └── types/            # Tipos específicos del backend
│
├── frontend/             # Interfaz de usuario
│   ├── pages/            # Páginas Next.js
│   ├── components/       # Componentes React reutilizables
│   │   ├── common/       # Componentes básicos
│   │   ├── layouts/      # Layouts de página
│   │   └── features/     # Componentes de características
│   ├── actions/          # Server Actions
│   ├── hooks/            # Custom React Hooks
│   ├── context/          # Context API
│   └── utils/            # Utilidades frontend
│
├── shared/               # Código compartido entre backend y frontend
│   ├── types/            # Tipos TypeScript
│   ├── constants/        # Constantes globales
│   ├── validators/       # Esquemas Zod
│   └── utils/            # Funciones compartidas
│
├── lib/                  # Configuraciones globales
│   ├── auth.ts           # Gestión de cookies y sesiones
│   ├── prisma.ts         # Instancia de Prisma
│   └── env.ts            # Variables de entorno
│
├── app/                  # App Directory de Next.js
│   ├── layout.tsx        # Layout raíz
│   ├── page.tsx          # Página principal
│   └── api/              # API routes que orquestan el backend
│
└── generated/            # Código generado (Prisma, etc.)
```

## 🎯 Capas Explicadas

### 1. **Shared Layer** (`src/shared/`)

Código reutilizable entre backend y frontend.

- **types/**: Interfaces TypeScript compartidas
  - `User`, `UserRole`, `UserPayload`
  - `ApiResponse`, `OperationResult`
  - Enums y tipos comunes

- **validators/**: Esquemas Zod para validación
  - `loginSchema`, `registerSchema`
  - `createSuperAdminSchema`
  - Reutilizables en Server Actions y API

- **constants/**: Valores constantes
  - `JWT_SECRET`, `BCRYPT_ROUNDS`
  - Mensajes de error/éxito
  - Configuraciones globales

### 2. **Backend Layer** (`src/backend/`)

Lógica empresarial, acceso a datos y utilidades.

#### **Repositories** (`backend/repositories/`)

Patrón DAO - Acceso exclusivo a base de datos

```typescript
// UserRepository.ts
class UserRepository {
  async findByEmail(email: string): Promise<User | null>;
  async findById(id: number): Promise<User | null>;
  async create(data: CreateUserData): Promise<User>;
  async update(id: number, data: UpdateUserData): Promise<User>;
}
```

#### **Services** (`backend/services/`)

Lógica empresarial e implementación

```typescript
// AuthService.ts
class AuthService {
  async login(input: LoginInput): Promise<OperationResult>;
  async register(input: RegisterInput): Promise<OperationResult>;
  async createSuperAdmin(input): Promise<OperationResult>;
}
```

#### **Utils** (`backend/utils/`)

Funciones de utilidad para operaciones comunes

- `password.ts`: Hash y verificación de contraseñas
- `jwt.ts`: Generación y verificación de tokens

### 3. **Frontend Layer** (`src/frontend/`)

Interfaz de usuario y lógica del cliente.

#### **Server Actions** (`frontend/actions/`)

Funciones que se ejecutan en el servidor pero son invocadas desde el cliente

```typescript
// auth.actions.ts
export async function loginAction(formData: FormData);

// register.actions.ts
export async function registerAction(formData: FormData);

// bootstrap.actions.ts
export async function createSuperAdminAction(formData: FormData);
```

#### **Components** (`frontend/components/`)

Componentes React reutilizables

- `common/`: Componentes base (Header, Form, FormField)
- `layouts/`: Layouts (AuthLayout)
- `features/`: Componentes de características específicas

#### **Pages** (`frontend/pages/` y `app/`)

Páginas Next.js que usan componentes y Server Actions

### 4. **Configuration Layer** (`src/lib/`)

Configuraciones globales del proyecto

- `auth.ts`: Gestión de cookies JWT
- `prisma.ts`: Cliente de base de datos
- `env.ts`: Variables de entorno

## 🔄 Flujo de Datos

### Login Flow

```
LoginPage (app/auth/login/page.tsx)
    ↓
Form Component (frontend/components/common/Form)
    ↓
loginAction (frontend/actions/auth.actions.ts)
    ↓
AuthService.login() (backend/services/auth.service.ts)
    ↓
UserRepository.findByEmail() (backend/repositories/user.repository.ts)
    ↓
Database (Prisma)
```

## 🔑 Beneficios de esta Arquitectura

✅ **Separación de Responsabilidades**: Cada capa tiene una responsabilidad clara
✅ **Reutilización**: Compartir tipos, validadores y lógica entre backend y frontend
✅ **Testabilidad**: Cada módulo puede testearse independientemente
✅ **Mantenibilidad**: Fácil encontrar y modificar código
✅ **Escalabilidad**: Agregar nuevas features sin afectar el código existente
✅ **Type-Safe**: Tipos compartidos aseguran consistencia

## 📦 Patrones Implementados

- **Repository Pattern**: Abstracción de acceso a datos
- **Service Pattern**: Lógica empresarial centralizada
- **Server Actions**: Reducir ejecución en cliente
- **Component Composition**: Componentes pequeños y reutilizables
- **Type-First**: TypeScript y tipos compartidos

## 🚀 Próximas Mejoras

- [ ] Crear más services (UserService, DriverService, etc.)
- [ ] Implementar error handling middleware
- [ ] Agregar logging centralizado
- [ ] Crear tests unitarios para services
- [ ] Implementar API routes que orquesten los services
- [ ] Agregar validación en middleware
- [ ] Crear custom hooks para estado global
