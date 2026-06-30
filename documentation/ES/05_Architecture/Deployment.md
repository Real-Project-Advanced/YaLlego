# Guía de Despliegue

## Descripción General

LlegoYa es una aplicación web **Full Stack** desarrollada con **Next.js**, **Prisma ORM**, **PostgreSQL**, **MongoDB** y **Ollama**.

## Requisitos

- Node.js 20 o superior
- npm
- PostgreSQL
- MongoDB
- Ollama

## Variables de Entorno

Crea un archivo `.env`.

```env
DATABASE_URL=<cadena de conexión a PostgreSQL>

MONGODB_URI=<cadena de conexión a MongoDB>

JWT_SECRET=<clave secreta para JWT>

OLLAMA_URL=http://localhost:11434
```

## Instalación

Clona el repositorio e instala las dependencias.

```bash
git clone <url-del-repositorio>

cd LlegoYa

npm install
```

## Generar el Cliente de Prisma

```bash
npx prisma generate
```

## Ejecutar las Migraciones

```bash
npx prisma migrate deploy
```

## Iniciar la Aplicación

Modo de desarrollo:

```bash
npm run dev
```

Modo de producción:

```bash
npm run build

npm start
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

## Tecnologías

- Next.js
- TypeScript
- PostgreSQL
- Prisma ORM
- MongoDB
- Ollama
- Autenticación mediante JWT
