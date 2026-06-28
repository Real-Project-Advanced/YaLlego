# API Documentation

## Overview

The application exposes RESTful API endpoints through Next.js Route Handlers.

All endpoints communicate with the Service Layer before accessing the database.

---

# Authentication

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| POST   | /api/auth/login    | Authenticate user      |
| POST   | /api/auth/register | Register a new user    |
| POST   | /api/auth/logout   | Logout current user    |
| GET    | /api/auth/me       | Get authenticated user |

---

# Users

| Method | Endpoint       | Description           |
| ------ | -------------- | --------------------- |
| GET    | /api/users     | Retrieve users        |
| GET    | /api/users/:id | Retrieve user details |
| PUT    | /api/users/:id | Update user           |
| DELETE | /api/users/:id | Delete user           |

---

# Routes

| Method | Endpoint        | Description     |
| ------ | --------------- | --------------- |
| GET    | /api/routes     | Retrieve routes |
| POST   | /api/routes     | Create route    |
| PUT    | /api/routes/:id | Update route    |
| DELETE | /api/routes/:id | Delete route    |

---

# Favorites

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | /api/favorites     | Retrieve favorites |
| POST   | /api/favorites     | Add favorite       |
| DELETE | /api/favorites/:id | Remove favorite    |

---

# Chat

| Method | Endpoint  | Description            |
| ------ | --------- | ---------------------- |
| GET    | /api/chat | Retrieve conversations |
| POST   | /api/chat | Send message           |

---

# Authentication Flow

```text
Client

↓

Login Request

↓

JWT Generation

↓

Middleware Validation

↓

Protected Route

↓

Database Access
```

---

# Response Format

Successful responses return:

- HTTP Status Code
- JSON payload

Error responses include:

- Error message
- Status code
- Validation details (if applicable)
