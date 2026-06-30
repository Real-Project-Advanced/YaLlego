# Bugs Sprint 01

## Resumen

Durante el Sprint 01 se identificaron diversos errores relacionados con la configuración inicial del proyecto.

---

## Registro de Bugs

| ID      | Descripción                           | Severidad | Estado  |
| ------- | ------------------------------------- | --------- | ------- |
| BUG-001 | Error en migración Prisma             | Alta      | Cerrado |
| BUG-002 | Componente no renderiza correctamente | Media     | Cerrado |
| BUG-003 | Problema con rutas                    | Media     | Cerrado |
| BUG-004 | Error de estilos Tailwind             | Baja      | Cerrado |
| BUG-005 | Error de husky y ESLint               | Baja      | Cerrado |

---

## Detalle

### BUG-001

Descripción:

La migración inicial de Prisma falló debido a inconsistencias en el esquema y llamado a la DB.

Solución:

Se regeneraron las migraciones y se actualizó el schema.

---

### BUG-002

Descripción:

Algunos componentes no mostraban correctamente la información.

Solución:

Corrección de propiedades y renderizado.

### BUG-003

Descripción:

El uso de link para rutas modificadas trajo problemas y genero desentendimiento.

Solución:

No usar rutas modificadas y usar rutas especificas automaticas otorgadas por el APP router de Next.js

### BUG-004

Descripción:

Error decapreted en la tecnología

Solución:

Cambiar el llamado de las clases y actualizar a la versión mas reciente de Tailwind

### BUG-005

Descripción:

La configuracion de husky no permitia leer los commits y ESLint no compilaba

Solución:

desactivar Husky temporalmente y arreglar la configuracion de ESLint
