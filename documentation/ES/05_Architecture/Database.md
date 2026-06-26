# Database Design

## Overview

YaLlego uses PostgreSQL as its relational database and Prisma ORM as the data access layer.

---

# Database Architecture

```text
Application
      │
      ▼
Prisma Client
      │
      ▼
PostgreSQL
```

---

# Main Entities

## User

Stores all registered users.

Attributes

- id
- name
- email
- password
- role
- createdAt
- updatedAt

---

## Driver

Stores driver-specific information.

Attributes

- id
- licenseNumber
- vehicleInformation
- availability

---

## Route

Stores transportation routes.

Attributes

- id
- origin
- destination
- schedule
- driverId

---

## Favorite

Stores users' favorite routes.

Attributes

- id
- userId
- routeId

---

## Chat

Stores conversations between users.

Attributes

- id
- senderId
- receiverId
- message
- timestamp

---

# Relationships

```text
User
 │
 ├────< Favorite >──── Route
 │
 ├────< Chat
 │
 └──── Driver

Driver
 │
 └────< Route
```

---

# Database Features

- Relational model
- Foreign key constraints
- Automatic migrations using Prisma
- Type-safe queries
- Data validation through Prisma schema
