# Project Structure

## Overview

The YaLlego project follows a modular architecture that separates responsibilities into different layers. This organization improves maintainability, scalability, and code readability by grouping related functionality into dedicated directories.

---

# Root Directory

```text
.
├── prisma/
├── public/
├── src/
├── documentation/
├── middleware.ts
├── package.json
├── tsconfig.json
└── next.config.ts
```

| Folder/File      | Description                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `prisma/`        | Database schema, migrations, and seed files.                                               |
| `public/`        | Static assets such as images, icons, and fonts.                                            |
| `src/`           | Main application source code.                                                              |
| `documentation/` | Project documentation, including product, architecture, testing, and sprint documentation. |
| `middleware.ts`  | Route protection and authentication middleware.                                            |
| `package.json`   | Project dependencies and scripts.                                                          |
| `tsconfig.json`  | TypeScript configuration.                                                                  |
| `next.config.ts` | Next.js configuration file.                                                                |

---

# Source Code Structure (`src/`)

```text
src/
├── app/
├── components/
├── hooks/
├── lib/
├── services/
├── types/
└── ...
```

---

## app/

### Purpose

Contains all application pages and routes using the Next.js App Router.

### Responsibilities

- Page routing
- Layout management
- Server Components
- Client Components
- Navigation
- Protected pages

### Example

```text
app/
├── login/
├── register/
├── dashboard/
│   ├── admin/
│   ├── driver/
│   └── user/
├── routes/
├── chat/
└── profile/
```

---

## components/

### Purpose

Stores reusable UI components shared across multiple pages.

### Responsibilities

- Buttons
- Forms
- Cards
- Tables
- Navigation bars
- Dialogs
- Layout components

Using reusable components reduces duplicated code and maintains a consistent user interface.

---

## hooks/

### Purpose

Contains reusable React custom hooks.

### Responsibilities

- State management
- Data fetching
- Authentication logic
- Form handling
- Shared client-side logic

Examples include authentication hooks and API interaction hooks.

---

## lib/

### Purpose

Provides shared utilities and infrastructure used throughout the application.

### Responsibilities

- Prisma Client initialization
- JWT utilities
- Validation helpers
- Utility functions
- Shared constants

This folder centralizes infrastructure code that is used across different modules.

---

## services/

### Purpose

Implements the application's business logic.

### Responsibilities

- Database operations
- Business rules
- Service abstraction
- API communication
- Data processing

The Service Layer separates business logic from the user interface.

---

## types/

### Purpose

Contains shared TypeScript definitions.

### Responsibilities

- Interfaces
- Enums
- DTOs
- Shared types
- Model definitions

Using centralized types improves consistency and type safety across the project.

---

# prisma/

### Purpose

Responsible for database management.

### Responsibilities

- Database schema
- Model definitions
- Database migrations
- Seed scripts

Prisma acts as the ORM responsible for communication with the PostgreSQL database.

---

# public/

### Purpose

Stores static resources served directly by Next.js.

### Examples

- Images
- Logos
- Icons
- Fonts
- Static files

---

# documentation/

### Purpose

Contains all project documentation.

### Structure

```text
documentation/
├── 01_Product/
├── 02_Project_Management/
├── 03_Sprints/
├── 04_Testing/
└── 05_Architecture/
```

Each folder documents a specific aspect of the project, making the documentation organized and easy to maintain.

---

# middleware.ts

### Purpose

Protects application routes and validates user authentication.

### Responsibilities

- Authentication
- Authorization
- Route protection
- Role validation

The middleware executes before protected routes are accessed.

---

# Architectural Layers

The project follows a layered architecture:

```text
Presentation Layer
        │
        ▼
Application Layer
        │
        ▼
Service Layer
        │
        ▼
Data Access Layer
        │
        ▼
Database Layer
```

| Layer                 | Directory        |
| --------------------- | ---------------- |
| Presentation          | `src/app`        |
| UI Components         | `src/components` |
| Client Logic          | `src/hooks`      |
| Shared Infrastructure | `src/lib`        |
| Business Logic        | `src/services`   |
| Type Definitions      | `src/types`      |
| Persistence           | `prisma`         |

---

# Benefits of the Architecture

- Modular organization
- Separation of concerns
- High maintainability
- Scalability
- Code reusability
- Easier testing
- Improved readability
- Simplified collaboration among developers
