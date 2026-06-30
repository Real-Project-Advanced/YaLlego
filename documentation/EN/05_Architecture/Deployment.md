# Deployment Guide

## Overview

LlegoYa is a full-stack web application built with Next.js, Prisma ORM, PostgreSQL, MongoDB, and Ollama.

## Requirements

- Node.js 20+
- npm
- PostgreSQL
- MongoDB
- Ollama

## Environment Variables

Create a `.env` file.

```env
DATABASE_URL=<PostgreSQL connection string>

MONGODB_URI=<MongoDB connection string>

JWT_SECRET=<JWT secret>

OLLAMA_URL=http://localhost:11434
```

## Installation

Clone the repository and install dependencies.

```bash
git clone <repository-url>

cd LlegoYa

npm install
```

## Generate Prisma Client

```bash
npx prisma generate
```

## Run Migrations

```bash
npx prisma migrate deploy
```

## Start the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build

npm start
```

The application will be available at:

```
http://localhost:3000
```

## Technologies

- Next.js
- TypeScript
- PostgreSQL
- Prisma ORM
- MongoDB
- Ollama
- JWT Authentication
