# Documentación de la API

## Descripción General

La API de LlegoYa está construida con **Next.js Route Handlers** y proporciona servicios de autenticación y un asistente de movilidad impulsado por inteligencia artificial. Todos los endpoints devuelven respuestas en formato JSON.

**URL Base**

```text
/api
```

---

## Endpoints de Autenticación

### POST `/api/auth/login`

Autentica a un usuario existente.

**Cuerpo de la Solicitud**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Respuesta Exitosa**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullname": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "role": "USER"
  }
}
```

| Estado | Descripción                     |
| ------ | ------------------------------- |
| 200    | Inicio de sesión exitoso        |
| 400    | Datos de la solicitud inválidos |
| 401    | Credenciales inválidas          |
| 500    | Error interno del servidor      |

---

### POST `/api/auth/register`

Registra un nuevo usuario.

**Cuerpo de la Solicitud**

```json
{
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Respuesta Exitosa**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullname": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "role": "USER"
  }
}
```

| Estado | Descripción                  |
| ------ | ---------------------------- |
| 200    | Usuario creado correctamente |
| 400    | Error de validación          |
| 500    | Error interno del servidor   |

---

### POST `/api/auth/logout`

Cierra la sesión del usuario actual eliminando las cookies de autenticación y redirigiendo a la página principal.

| Estado | Descripción                |
| ------ | -------------------------- |
| 200    | Cierre de sesión exitoso   |
| 500    | Error interno del servidor |

---

### GET `/api/auth/me`

Devuelve la información del usuario autenticado.

**Respuesta Exitosa**

```json
{
  "user": {
    "id": 1,
    "fullname": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "role": "USER"
  }
}
```

| Estado | Descripción                                    |
| ------ | ---------------------------------------------- |
| 200    | Información del usuario obtenida correctamente |
| 401    | No autorizado                                  |
| 500    | Error interno del servidor                     |

---

### POST `/api/auth/refresh`

Renueva el token de acceso utilizando el token de actualización (_refresh token_).

**Respuesta Exitosa**

```json
{
  "success": true,
  "message": "Tokens renovados correctamente",
  "data": {
    "accessToken": "..."
  }
}
```

| Estado | Descripción                       |
| ------ | --------------------------------- |
| 200    | Token renovado correctamente      |
| 401    | Refresh token inválido o expirado |
| 500    | Error interno del servidor        |

---

## Asistente de IA

### POST `/api/chat`

Envía una conversación al asistente de inteligencia artificial impulsado por Ollama.

**Cuerpo de la Solicitud**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "¿Qué bus debo tomar para ir a Guarne?"
    }
  ]
}
```

**Respuesta Exitosa**

```json
{
  "role": "assistant",
  "content": "Puedes tomar la ruta..."
}
```

Todas las conversaciones se registran de forma asíncrona en MongoDB con fines de monitoreo.

| Estado | Descripción                      |
| ------ | -------------------------------- |
| 200    | Respuesta generada correctamente |
| 400    | Solicitud inválida               |
| 500    | Error interno del servidor       |
