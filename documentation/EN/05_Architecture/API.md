# API Documentation

## Overview

The LlegoYa API is built with **Next.js Route Handlers** and provides authentication services and an AI-powered mobility assistant. The platform also includes a small **Go tracking service** for real-time driver GPS and road-following navigation geometry. All endpoints return responses in JSON format.

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

---

## Go Tracking And Navigation Service

**Base URL**

```text
http://localhost:8080
```

### GET `/navigation/route`

Returns a road-following route geometry between two places or two GPS points. The driver map uses this endpoint to avoid drawing a straight, inaccurate line from the beginning to the end of the route.

**Query Parameters**

| Parameter        | Description            |
| ---------------- | ---------------------- |
| `origin`         | Origin place name      |
| `destination`    | Destination place name |
| `originLat`      | Origin latitude        |
| `originLng`      | Origin longitude       |
| `destinationLat` | Destination latitude   |
| `destinationLng` | Destination longitude  |

When `origin` and `destination` are present, the Go service geocodes them around Medellin before calculating the route. Coordinate parameters remain supported as a fallback.

**Successful Response**

```json
{
  "coordinates": [
    [6.253, -75.5905],
    [6.2525, -75.5898]
  ],
  "distanceKm": 4.8,
  "durationMin": 18.2,
  "provider": "osrm"
}
```

Coordinates are returned as `[lat, lng]` pairs to match Leaflet and the frontend map components.

| Status | Description                        |
| ------ | ---------------------------------- |
| 200    | Route geometry returned            |
| 400    | Missing or invalid coordinates     |
| 404    | No route found                     |
| 502    | Routing provider unavailable/error |

### WebSocket `/ws/driver`

Receives authenticated driver GPS updates and broadcasts active bus positions to passengers.

### WebSocket `/ws/passenger`

Streams active bus locations to passenger map clients.

**Message Shape**

```json
[
  {
    "id": "12",
    "plate": "ABC123",
    "model": "Buseta",
    "capacity": 24,
    "location": { "lat": 6.2442, "lng": -75.5812 },
    "routeId": 4,
    "routeName": "Circular -> Laureles"
  }
]
```
