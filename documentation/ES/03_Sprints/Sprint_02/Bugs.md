# Bugs - Sprint 02

## Resumen

Durante el Sprint 02 se identificaron varios errores relacionados con la autenticación, la integración con la base de datos y el desarrollo de las funcionalidades de Inteligencia Artificial. La mayoría fueron corregidos durante el mismo sprint.

---

# Registro de Bugs

| ID      | Módulo                  | Severidad | Estado  |
| ------- | ----------------------- | --------- | ------- |
| BUG-001 | Login                   | Crítica   | Cerrado |
| BUG-002 | Registro                | Alta      | Cerrado |
| BUG-003 | Middleware              | Alta      | Cerrado |
| BUG-004 | Server Actions          | Media     | Cerrado |
| BUG-005 | Prisma                  | Crítica   | Cerrado |
| BUG-006 | Embeddings              | Media     | Cerrado |
| BUG-007 | Base de Datos Vectorial | Alta      | Cerrado |
| BUG-008 | Consulta IA             | Baja      | Cerrado |

---

# Detalle de Bugs

## BUG-001 - Error de autenticación

**Módulo:** Login

**Severidad:** Crítica

**Descripción:**
El sistema permitía iniciar sesión con credenciales inválidas debido a una validación incorrecta.

**Solución:**

- Se corrigió la validación de credenciales.
- Se verificó el hash de la contraseña antes de crear la sesión.

**Estado:** Cerrado

---

## BUG-002 - Registro duplicado

**Módulo:** Registro

**Severidad:** Alta

**Descripción:**
Era posible registrar un usuario con un correo electrónico ya existente.

**Solución:**

- Se agregó una validación previa en la base de datos.
- Se mostró un mensaje informativo al usuario.

**Estado:** Cerrado

---

## BUG-003 - Acceso a rutas protegidas

**Módulo:** Middleware

**Severidad:** Alta

**Descripción:**
Algunas rutas podían ser accedidas sin autenticación.

**Solución:**

- Se actualizó el middleware.
- Se validó el token antes de permitir el acceso.

**Estado:** Cerrado

---

## BUG-004 - Error en Server Actions

**Módulo:** Backend

**Severidad:** Media

**Descripción:**
Las excepciones generadas por las Server Actions no eran controladas correctamente.

**Solución:**

Se implementó manejo de errores utilizando bloques `try/catch`.

**Estado:** Cerrado

---

## BUG-005 - Migraciones de Prisma

**Módulo:** Base de Datos

**Severidad:** Crítica

**Descripción:**
Las migraciones fallaban por inconsistencias entre el esquema y la base de datos.

**Solución:**

- Se recrearon las migraciones.
- Se sincronizó el esquema de Prisma.

**Estado:** Cerrado

---

## BUG-006 - Generación de Embeddings

**Módulo:** IA

**Severidad:** Media

**Descripción:**
Los embeddings generados no tenían el formato esperado.

**Solución:**

Se ajustó el procesamiento antes del almacenamiento.

**Estado:** Cerrado

---

## BUG-007 - Almacenamiento Vectorial

**Módulo:** PostgreSQL + pgvector

**Severidad:** Alta

**Descripción:**
La base de datos no almacenaba correctamente algunos vectores.

**Solución:**

Se corrigió la configuración de pgvector y se validó el tipo de dato utilizado.

**Estado:** Cerrado

---

## BUG-008 - Respuestas IA

**Módulo:** Consulta IA

**Severidad:** Baja

**Descripción:**
En algunas consultas la IA respondía sin utilizar el contexto recuperado.

**Solución:**

Se mejoró el prompt del sistema y el envío del contexto.

**Estado:** Cerrado

---

# Resumen Final

| Severidad | Cantidad |
| --------- | -------- |
| Crítica   | 2        |
| Alta      | 3        |
| Media     | 2        |
| Baja      | 1        |

**Total de bugs registrados:** **8**

Todos los errores fueron corregidos antes del cierre del Sprint 02, por lo que no quedaron incidencias abiertas para el siguiente sprint.
