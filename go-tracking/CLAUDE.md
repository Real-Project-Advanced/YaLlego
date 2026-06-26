# Go Real-Time Bus Tracking Microservice — CLAUDE.md

## Project Context

This is a **Go microservice** that provides real-time bus tracking for **LlegoYa (YaLlego)**, an urban mobility platform for Medellín, Colombia. It is part of a larger project built with Next.js, and lives inside the monorepo at `go-tracking/`.

- **Repo:** `github.com/Real-Project-Advanced/YaLlego`, branch `dev-samuel`
- **My role:** I (Samuel) am responsible ONLY for this Go microservice. The Next.js frontend and backend are handled by teammates.
- **This is a school project** for the "Tech & Business Showcase" at RIWI (Ruta Avanzada program). The evaluators will look at code quality, integration between stacks, documentation in English, Git commits, and Docker deployment.

## What This Service Does

1. **Receives GPS coordinates** from drivers via WebSocket
2. **Stores locations in memory** (not in the database — too many writes)
3. **Broadcasts locations** in real-time to passengers viewing the map via WebSocket
4. **Validates JWT tokens** so only authenticated drivers can send locations
5. **Reads from PostgreSQL** (Supabase) to validate driver/transport/route relationships

## Architecture

```
Driver App (frontend)
    │
    ▼ WebSocket (send GPS coords)
┌─────────────────────┐
│   Go Tracking       │
│   Service (:8080)   │──── reads from ──── Supabase PostgreSQL
│                     │
└─────────────────────┘
    │
    ▼ WebSocket (broadcast locations)
Passenger App (frontend map with Leaflet)
```

## Database — Supabase PostgreSQL

The Go service connects READ-ONLY to the existing Supabase PostgreSQL. It does NOT write to the database. Tables:

### users
| Column          | Type            | Nullable |
|-----------------|-----------------|----------|
| id              | integer (PK)    | NO       |
| fullname        | varchar(255)    | NO       |
| email           | varchar(255)    | NO       |
| password        | text            | NO       |
| phone           | varchar(50)     | YES      |
| document_number | varchar(100)    | YES      |
| role            | user_role enum  | NO       |
| is_active       | boolean         | NO       |
| created_at      | timestamp       | NO       |
| updated_at      | timestamp       | NO       |

**Enum `user_role`:** `SUPER_ADMIN`, `DRIVER`, `USER`

### drivers
| Column             | Type         | Nullable |
|--------------------|--------------|----------|
| id                 | integer (PK) | NO       |
| user_id            | integer (FK → users.id, UNIQUE) | NO |
| transport_id       | integer (FK → transports.id) | YES |
| license_type       | varchar(50)  | NO       |
| experience_years   | integer      | NO       |
| license_expiration | timestamp    | NO       |
| created_by         | integer (FK → users.id) | NO |
| created_at         | timestamp    | NO       |
| updated_at         | timestamp    | NO       |

### transports
| Column     | Type              | Nullable |
|------------|-------------------|----------|
| id         | integer (PK)      | NO       |
| plate      | varchar(50) UNIQUE| NO       |
| model      | varchar(100)      | NO       |
| capacity   | integer           | NO       |
| is_active  | boolean           | NO       |
| created_at | timestamp         | NO       |
| updated_at | timestamp         | NO       |

### routes
| Column       | Type         | Nullable |
|--------------|--------------|----------|
| id           | integer (PK) | NO       |
| origin       | text         | NO       |
| destination  | text         | NO       |
| transport_id | integer (FK → transports.id) | NO |
| created_at   | timestamp    | NO       |
| updated_at   | timestamp    | NO       |

**Key relationships:**
- A driver has ONE user (user_id is UNIQUE)
- A driver has ONE transport (nullable — may be unassigned)
- A transport can have MANY drivers and MANY routes
- A route belongs to ONE transport

## Authentication — JWT

The Next.js app generates JWTs using the `jose` library with **HS256**. The Go service must validate these same tokens.

- **Access token secret:** value of env var `JWT_SECRET` (default: `"NEXTHUS_NEOSYNK_SECRET"`)
- **Refresh token secret:** value of env var `JWT_REFRESH_SECRET` (default: `"NEXTHUS_NEOSYNK_REFRESH_SECRET"`)
- **Algorithm:** HS256
- **Token payload (claims):**
  ```json
  {
    "id": 1,
    "email": "driver@example.com",
    "fullname": "John Doe",
    "role": "DRIVER"
  }
  ```
- Access tokens expire in 15 minutes, refresh tokens in 7 days
- Tokens are stored in httpOnly cookies on the frontend, but for WebSocket connections the frontend will send the token as a query param or in the first message

## Frontend Data Contract

The frontend expects bus data in this shape (defined in `src/types/bus.ts`):

```typescript
interface Bus {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  location: {
    lat: number;
    lng: number;
  };
  routeId?: string | number;
}
```

The Go service WebSocket messages to passengers MUST match this structure (as JSON).

## Current Frontend State

- **Map:** Uses Leaflet (NOT Mapbox), open source
- **Bus data:** Currently hardcoded mock data in `src/lib/maps/mock-buses.ts` — this service replaces that
- **Driver dashboard:** Placeholder page at `/driver/dashboard` with text "próximamente..." — needs WebSocket integration to send GPS
- **No real-time mechanism exists yet** — no WebSocket, no SSE, nothing. Clean slate.

## MongoDB

MongoDB is used ONLY for AI chat logs (`ai_logs` collection in `smartops-medellin` DB). **This Go service does NOT interact with MongoDB at all.**

## Tech Decisions for This Service

- **Language:** Go (goroutines for concurrency, native WebSocket support)
- **WebSocket library:** `gorilla/websocket` or `nhooyr.io/websocket`
- **Database driver:** `lib/pq` or `pgx` for PostgreSQL
- **JWT validation:** `golang-jwt/jwt/v5`
- **No ORM** — raw SQL queries (the service only reads a few tables)
- **In-memory store** for bus locations (no need to persist GPS coords)
- **Docker deployment** required by project rules

## Environment Variables

```env
# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# JWT (must match the Next.js app)
JWT_SECRET=NEXTHUS_NEOSYNK_SECRET
JWT_REFRESH_SECRET=NEXTHUS_NEOSYNK_REFRESH_SECRET

# Server
PORT=8080
```

## Project Structure (target)

```
go-tracking/
├── CLAUDE.md          ← this file
├── Dockerfile
├── go.mod
├── go.sum
├── main.go            ← entry point, HTTP server setup
├── internal/
│   ├── auth/          ← JWT validation
│   ├── config/        ← env vars, configuration
│   ├── db/            ← PostgreSQL connection and queries
│   ├── models/        ← Go structs matching DB tables and WebSocket messages
│   └── ws/            ← WebSocket hub, client management, broadcast logic
└── README.md
```

## Code Style

- Write clean, idiomatic Go
- All code, comments, variable names, and documentation in **English**
- Use Go modules
- Handle errors explicitly (no silent swallowing)
- Log meaningful messages for debugging
- Keep it simple — this is an MVP

## What NOT to Do

- Do NOT use an ORM (overkill for read-only queries)
- Do NOT write GPS locations to the database (use in-memory only)
- Do NOT interact with MongoDB
- Do NOT build REST API endpoints for CRUD (the Next.js backend handles that)
- Do NOT duplicate authentication logic beyond token validation
