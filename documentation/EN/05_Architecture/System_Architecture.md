# System Architecture

## Overview

LlegoYa follows a modular full-stack architecture using Next.js App Router. The application separates the user interface, business logic, authentication, AI services, and database access into independent layers, allowing the platform to be scalable and maintainable.

## Component Diagram

```mermaid
flowchart TD

A[User]

A --> B[Next.js Frontend]

B --> C[API Routes]

C --> D[Authentication Service]

C --> E[Route Service]

C --> F[AI Service]

D --> G[JWT Authentication]

E --> H[Prisma ORM]

H --> I[(PostgreSQL)]

F --> J[Ollama]

F --> K[(MongoDB)]
```

---

## Authentication Flow

```mermaid
sequenceDiagram

User->>Frontend: Login

Frontend->>API: POST /api/auth/login

API->>Authentication Service: Validate credentials

Authentication Service->>PostgreSQL: Verify user

PostgreSQL-->>Authentication Service: User data

Authentication Service-->>API: Generate JWT

API-->>Frontend: Authentication cookies

Frontend->>API: Protected request

API->>JWT: Validate token

JWT-->>API: Authorized

API-->>Frontend: Response
```

---

## AI Assistant Flow

```mermaid
flowchart LR

User

-->

Chat Interface

-->

API Chat

-->

AI Service

-->

Ollama

-->

Response

-->

MongoDB Logs
```

---

## Main Components

| Component              | Responsibility                               |
| ---------------------- | -------------------------------------------- |
| Frontend               | User interface and interactive maps          |
| API Routes             | Handle HTTP requests                         |
| Authentication Service | Login, registration, token management        |
| Route Service          | Transport route management                   |
| AI Service             | AI-powered mobility recommendations          |
| Prisma ORM             | Database access layer                        |
| PostgreSQL             | Stores users, drivers, transports and routes |
| MongoDB                | Stores AI interaction logs                   |
