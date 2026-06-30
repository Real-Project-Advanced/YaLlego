# API Documentation

## Overview

The LlegoYa API is built with **Next.js Route Handlers** and provides authentication services and an AI-powered mobility assistant. All endpoints return responses in JSON format.

**Base URL**

```text
/api
```

---

## Authentication Endpoints

### POST `/api/auth/login`

Authenticates an existing user.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Successful Response**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

| Status | Description           |
| ------ | --------------------- |
| 200    | Login successful      |
| 400    | Invalid request data  |
| 401    | Invalid credentials   |
| 500    | Internal server error |

---

### POST `/api/auth/register`

Registers a new user.

**Request Body**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Successful Response**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

| Status | Description               |
| ------ | ------------------------- |
| 200    | User created successfully |
| 400    | Validation error          |
| 500    | Internal server error     |

---

### POST `/api/auth/logout`

Logs out the current user by removing authentication cookies and redirecting to the home page.

| Status | Description           |
| ------ | --------------------- |
| 200    | Logout successful     |
| 500    | Internal server error |

---

### GET `/api/auth/me`

Returns the authenticated user's information.

**Successful Response**

```json
{
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

| Status | Description               |
| ------ | ------------------------- |
| 200    | User information returned |
| 401    | Unauthorized              |
| 500    | Internal server error     |

---

### POST `/api/auth/refresh`

Refreshes the access token using the refresh token.

**Successful Response**

```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "..."
  }
}
```

| Status | Description                      |
| ------ | -------------------------------- |
| 200    | Token refreshed                  |
| 401    | Invalid or expired refresh token |
| 500    | Internal server error            |

---

## AI Assistant

### POST `/api/chat`

Sends a conversation to the AI assistant powered by Ollama.

**Request Body**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Which bus should I take to Guarne?"
    }
  ]
}
```

**Successful Response**

```json
{
  "role": "assistant",
  "content": "You can take route..."
}
```

All conversations are logged asynchronously in MongoDB for monitoring purposes.

| Status | Description                     |
| ------ | ------------------------------- |
| 200    | Response generated successfully |
| 400    | Invalid request                 |
| 500    | Internal server error           |
