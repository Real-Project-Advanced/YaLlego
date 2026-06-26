# LlegoYa

LlegoYa is a full-stack urban mobility platform for Medellín. The project aims to help public transportation users find routes, track buses, and receive smart travel recommendations through a modern web experience with interactive maps, role-based authentication, and an AI assistant specialized in urban mobility.

The platform is designed as a scalable foundation for a smart mobility ecosystem, where passengers can explore routes and receive recommendations, drivers can share operational information, and administrators can manage routes, buses, and drivers from a centralized system.

---

# Project Goal

The main goal of LlegoYa is to reduce uncertainty when traveling across the city by centralizing information about routes, buses, users, and transportation operations.

The long-term vision includes:

- Route search and comparison.
- Interactive maps with routes and buses.
- AI-powered chatbot for mobility questions in Medellín.
- Management of users, drivers, buses, and routes.
- Dedicated dashboards for passengers, drivers, and administrators.
- A scalable architecture prepared for real-time data, analytics, and future integrations.

---

# Current Status

The repository currently contains a web-based MVP built with Next.js and TypeScript.

Implemented features include:

- Landing page and authentication flow.
- User registration, login, logout, and token refresh.
- JWT authentication using secure `httpOnly` cookies.
- Role-based redirection to User, Driver, or Admin dashboards.
- User dashboard with route search, favorites, news, and chatbot.
- Initial administration views for dashboards, routes, drivers, and super administrators.
- Interactive maps using Leaflet with simulated routes and buses across Medellín.
- AI service connected to Ollama for mobility-related questions.
- Prisma data model for users, drivers, vehicles, and routes.
- Database integrations prepared for PostgreSQL (Supabase) and MongoDB.

Some features described throughout the documentation represent the product vision and roadmap, and may not yet be fully implemented in the current version.

---

# User Roles

LlegoYa supports three main user roles:

- **USER** – Public transportation passengers. They can search routes, use the AI chatbot, manage favorites, and review travel history.
- **DRIVER** – Drivers who can view assigned routes and share operational status or location.
- **SUPER_ADMIN** – Administrators responsible for managing routes, drivers, buses, and operational information.

---

# Technology Stack

| Category          | Technology                                        |
| ----------------- | ------------------------------------------------- |
| Framework         | Next.js 16 (App Router)                           |
| Language          | TypeScript                                        |
| UI                | React 19, Tailwind CSS 4, Radix UI, Lucide React  |
| Maps              | Leaflet, React Leaflet                            |
| Database          | PostgreSQL with Prisma 7 and `@prisma/adapter-pg` |
| External Services | Supabase Client, MongoDB Client                   |
| Authentication    | JWT (`jose`), `httpOnly` cookies, `bcryptjs`      |
| AI                | Ollama (local AI service)                         |
| Code Quality      | ESLint, Prettier, Husky, lint-staged              |

---

# Project Structure

```text
.
├── documentation/          # Product documentation (ES/EN)
├── prisma/                 # Prisma schema and database configuration
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js routes, layouts, and API routes
│   ├── components/         # Reusable UI components
│   ├── generated/          # Generated Prisma Client
│   ├── lib/                # Authentication, maps, clients, and utilities
│   ├── modules/            # Domain modules (auth, routes, user, shared)
│   ├── shared/             # Shared types, validators, and constants
│   └── types/              # Global TypeScript types
├── ARQUITECTURA.md         # Architecture notes
├── TOKENS.md               # Authentication and token documentation
└── package.json
```

---

# Main Modules

## Authentication

The authentication module is mainly located in:

- `src/modules/auth`
- `src/lib/auth.ts`
- `src/middleware.ts`
- `src/app/api/auth`

Features include:

- User registration and login
- Password hashing
- Access and refresh tokens
- Secure `httpOnly` cookies
- Route protection middleware
- Role-based redirection after login

---

## Users

The user module is located in `src/modules/user` and includes:

- User dashboard
- Route search
- Favorite routes
- News section
- AI chatbot

---

## Routes and Maps

Located in:

- `src/modules/routes`
- `src/lib/maps`

It uses Leaflet to display:

- Medellín city map
- Simulated transportation routes
- Simulated buses
- Geographic boundaries

---

## Artificial Intelligence

The AI service is located in:

`src/modules/shared/services/ai.service.ts`

It connects to Ollama using a system prompt focused exclusively on urban mobility in the Aburrá Valley.

Related environment variables:

- `OLLAMA_ENDPOINT`
- `OLLAMA_MODEL`

---

## Data Model

The main relational schema is defined in:

`prisma/schema.prisma`

Current entities include:

- `users`
- `drivers`
- `transports`
- `routes`
- `user_role`

---

# Requirements

Before running the project, make sure you have:

- Node.js compatible with Next.js 16
- npm
- PostgreSQL configured through `DATABASE_URL`
- Ollama installed and running (optional, required for the AI chatbot)
- MongoDB (optional, for logging and future AI features)
- Supabase credentials (optional)

---

# Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

JWT_SECRET="replace-with-a-secure-secret"
JWT_REFRESH_SECRET="replace-with-a-secure-refresh-secret"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

OLLAMA_ENDPOINT="http://127.0.0.1:11434/api"
OLLAMA_MODEL="smartops-bot"

MONGODB_URI="mongodb+srv://USER:PASSWORD@HOST/DATABASE"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

For local development, the most important variables are:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

MongoDB, Supabase, and Ollama are only required if you want to test those specific features.

---

# Installation

Install dependencies:

```bash
npm install
```

Generate the Prisma Client:

```bash
npm run db:generate
```

Synchronize the database schema:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
```

The application will usually be available at:

```text
http://localhost:3000
```

---

# Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run db:generate  # Generate Prisma Client
npm run db:push      # Synchronize Prisma schema
```

---

# Main Routes

| Route               | Description               |
| ------------------- | ------------------------- |
| `/`                 | Landing page              |
| `/login`            | Login page                |
| `/register`         | User registration         |
| `/user`             | User dashboard            |
| `/driver`           | Driver dashboard          |
| `/admin`            | Admin dashboard           |
| `/admin/routes`     | Route management          |
| `/admin/driver`     | Driver management         |
| `/admin/superadmin` | Super administrator panel |
| `/api/auth/*`       | Authentication endpoints  |
| `/api/chat`         | AI chatbot endpoint       |

---

# Development Guidelines

- Use strict TypeScript and avoid `any`.
- Keep UI, business logic, data access, and types separated by module.
- Prefer reusable components inside `src/components` or the corresponding module.
- Store shared validation logic in `src/shared/validators`.
- Run linting and formatting before opening a Pull Request.
- Never commit real secrets or sensitive environment variables.
- Contribute through Pull Requests targeting protected branches.

---

# Product Documentation

Functional and organizational documentation is available in the `documentation/` directory.

Spanish:

- `documentation/ES/PRODUCT_VISION.md`
- `documentation/ES/PROJECT-OVERVIEW.md`
- `documentation/ES/USER_ROLES.md`
- `documentation/ES/SPRINT_PLANNING.md`
- `documentation/ES/RESPONSABILITIES.md`

English versions are also available in:

```text
documentation/EN/
```

---

# Roadmap

Planned future features include:

- Real-time GPS tracking for buses and drivers.
- Complete management of routes, vehicles, and assignments.
- Persistent route history and favorite routes.
- Smart service disruption alerts.
- Data-driven travel recommendations.
- RAG integration to provide up-to-date operational information.
- Analytics dashboards for transportation companies and administrators.
- Mobile application.

---

# License

This project is private and intended for academic and professional use by the LlegoYa development team, unless a different license is specified in the repository.

```

```
