# Definición de Terminado (Definition of Done - DoD)

## Propósito

La Definición de Terminado (DoD) establece los criterios mínimos de calidad que debe cumplir cada **Elemento del Product Backlog (PBI)** antes de ser considerado como completado.

Su objetivo es garantizar la consistencia, mantener la calidad del software y reducir la deuda técnica mediante una comprensión compartida de lo que significa que una funcionalidad esté **terminada** para todo el equipo de desarrollo.

---

# Objetivos

- Garantizar que cada funcionalidad cumpla con los estándares de calidad.
- Reducir los defectos en producción.
- Mejorar la mantenibilidad del código.
- Estandarizar las prácticas de desarrollo.
- Asegurar que la funcionalidad entregada esté lista para su despliegue.

---

# Lista de Verificación de la Definición de Terminado

Una tarea o Historia de Usuario se considera **Terminada** únicamente cuando se cumplen todos los siguientes criterios.

## Desarrollo

- El código fuente ha sido implementado completamente.
- Los requisitos de negocio han sido cumplidos.
- Se han seguido los estándares de codificación establecidos.

---

## Calidad del Código

- ESLint no reporta errores.
- La compilación de TypeScript se ejecuta correctamente.
- No existen variables ni importaciones sin utilizar.
- El código sigue las convenciones definidas para el proyecto.

---

## Base de Datos

- Se han creado las migraciones necesarias.
- El esquema de Prisma ha sido actualizado cuando corresponde.
- Las relaciones de la base de datos han sido validadas.

---

## Pruebas

- Se han completado las pruebas funcionales.
- Se ha verificado que la funcionalidad existente no se vea afectada.
- No existen errores de severidad **Crítica** o **Alta** pendientes.
- Los criterios de aceptación han sido validados satisfactoriamente.

---

## Revisión

- Se ha creado el Pull Request.
- Se ha realizado la revisión de código (Code Review).
- Se han atendido todos los comentarios de la revisión.
- La implementación ha sido aprobada por al menos un miembro del equipo.

---

# Criterios de Salida

Una Historia de Usuario se considera completada únicamente cuando todos los elementos de esta lista de verificación han sido satisfechos.

Si alguno de los criterios no se cumple, la tarea deberá permanecer en estado **En Progreso**.
