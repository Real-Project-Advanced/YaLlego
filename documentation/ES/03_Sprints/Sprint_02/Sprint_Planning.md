# Sprint 02 Planning

## Información General

| Campo                | Valor                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Sprint               | Sprint 02                                                                                         |
| Duración             | 30 días                                                                                           |
| Scrum Master         | Tobias (Luego hubo un cambio y pasa Juan Sebastian a ser Ambas labores)                           |
| Product Owner        | Juan Mosquera                                                                                     |
| Equipo de Desarrollo | Miguel Angel Restrepo, Daniel Perez Bustamante, Daniel Tobias Atehortúa , Juan Sebastian Mosquera |

---

# Descripción del Sprint

Después de haber establecido la estructura inicial del proyecto durante el Sprint 01, el segundo sprint estuvo enfocado en implementar las primeras funcionalidades funcionales del sistema.

El objetivo principal fue desarrollar el proceso completo de autenticación del usuario (Registro e Inicio de Sesión), construir los formularios de interacción con el usuario, conectar la aplicación con el backend mediante Server Actions de Next.js y comenzar la integración de las funcionalidades relacionadas con Inteligencia Artificial mediante la generación y almacenamiento de embeddings con Ollama.

Este sprint representó la transición entre la preparación del proyecto y el desarrollo de funcionalidades que serían utilizadas directamente por los usuarios.

---

# Objetivo del Sprint

Desarrollar las funcionalidades necesarias para permitir la autenticación de usuarios, la comunicación segura entre el frontend y el backend, la implementación de la infraestructura inicial para las características de Inteligencia Artificial y la creación de endpoints para las diferentes caracteristicas.

---

# Sprint Goal

Al finalizar el Sprint 02, el sistema debe permitir:

- Registrar nuevos usuarios.
- Iniciar sesión de manera segura.
- Validar formularios del lado del cliente.
- Procesar información mediante Server Actions.
- Configurar la base de datos.
- Generar y almacenar embeddings.
- Preparar el sistema para futuras consultas mediante IA.

---

# Historias de Usuario Seleccionadas

| ID      | Historia                    | Prioridad | Story Points | Estado     |
| ------- | --------------------------- | --------- | ------------ | ---------- |
| Feature | Registro e Inicio de Sesión | Alta      | 5            | Completada |
| US-012  | Formularios                 | Alta      | 5            | Completada |
| US-013  | Server Actions              | Alta      | 5            | Completada |
| US-014  | Embeddings                  | Media     | 3            | Completada |
| US-015  | Base de Datos Vectorial     | Alta      | 5            | Completada |
| US-016  | Consulta a Embeddings       | Alta      | 5            | Completada |
| US-017  | Respuestas de IA            | Media     | 5            | Completada |

---

# Alcance del Sprint

Durante este Sprint se desarrollarán las siguientes funcionalidades:

## Autenticación

- Registro de usuarios.
- Inicio de sesión.
- Validación de credenciales.
- Gestión de sesiones.
- Protección de rutas.
- Chat AI inicial.

---

## Formularios

- Formularios interactivos.
- Validación utilizando TypeScript.
- Manejo de errores.
- Comunicación con el backend.

---

## Backend

- Implementación de Server Actions.
- Comunicación con Prisma.
- Validaciones del lado del servidor.
- Manejo de excepciones.

---

## Inteligencia Artificial

- Generación de embeddings.
- Almacenamiento en la base de datos vectorial.
- Configuración de pgvector.
- Consultas semánticas iniciales.
- Gestión de respuestas del modelo.

---

# Sprint Backlog

## Feature

- Implementar Registro.
- Implementar Login.
- Encriptación de contraseñas.
- Autenticación mediante JWT.
- Middleware de autenticación.

---

## US-012 Formularios

- Crear formularios de Login.
- Crear formularios de Registro.
- Crear vistas Admin y Driver temporales.
- Validación de campos.
- Manejo de estados de error.
- Envío de información al backend.

---

## US-013 Server Actions

- Crear Server Actions.
- Comunicación con Prisma.
- Manejo de errores.
- Validación del flujo cliente-servidor.

---

## US-014 Embeddings

- Configuración del modelo.
- Generación de vectores.
- Validación del formato.
- Almacenamiento inicial.

---

## US-015 Base de Datos Vectorial

- Instalación de pgvector.
- Configuración de Prisma.
- Pruebas de almacenamiento.
- Consultas básicas.

---

## US-016 Consulta a Embeddings

- Captura de consultas.
- Conversión a vectores.
- Validación de consultas.
- Integración con la base de datos.

---

## US-017 Respuestas IA

- Configuración del System Prompt.
- Almacenamiento de conversaciones.
- Restricción de respuestas.
- Optimización del contexto.

---

# Distribución del Trabajo

| Área                    | Responsable          |
| ----------------------- | -------------------- |
| Frontend                | Equipo de Desarrollo |
| Backend                 | Equipo de Desarrollo |
| Base de Datos           | Equipo de Desarrollo |
| Inteligencia Artificial | Equipo de Desarrollo |
| Testing                 | Todo el equipo       |
| Feedback                | Todo el equipo       |

---

# Dependencias

El Sprint depende de que las funcionalidades desarrolladas durante el Sprint 01 se encuentren completamente estables.

Dependencias principales:

- Proyecto configurado correctamente.
- Prisma funcionando.
- Base de datos Supabase:PostgreSQL disponible.
- Variables de entorno configuradas.
- Repositorio sincronizado.

---

# Riesgos Identificados

| Riesgo                               | Probabilidad | Impacto | Plan de Mitigación                                        |
| ------------------------------------ | ------------ | ------- | --------------------------------------------------------- |
| Errores de autenticación             | Alta         | Alto    | Realizar pruebas continuas del flujo de Login y Registro. |
| Problemas con Server Actions         | Media        | Alto    | Implementar manejo de excepciones y validaciones.         |
| Configuración incorrecta de pgvector | Media        | Alto    | Realizar pruebas locales antes de integrar al proyecto.   |
| Conflictos de Git entre ramas        | Alta         | Medio   | Revisar cambios antes de realizar merge o rebase.         |
| Ausencia de integrantes del equipo   | Media        | Medio   | Redistribuir tareas y mantener comunicación constante.    |

---

# Definition of Ready Aplicada

Antes de comenzar el Sprint, todas las historias seleccionadas cumplían con los siguientes criterios:

- Historia de usuario definida.
- Criterios de aceptación establecidos.
- Estimación realizada.
- Prioridad asignada.
- Dependencias identificadas.
- Tareas registradas en Jira.

---

# Definition of Done Aplicada

Cada historia se considerará finalizada cuando:

- El desarrollo haya sido completado.
- El código compile correctamente.
- No existan errores críticos.
- Las pruebas funcionales sean satisfactorias.
- La documentación haya sido actualizada.
- Los cambios estén integrados en la rama principal del proyecto.

---

# Métricas Esperadas

| Métrica                   | Objetivo |
| ------------------------- | -------- |
| Historias completadas     | 100%     |
| Bugs críticos             | 0        |
| Bugs de alta prioridad    | ≤ 2      |
| Cobertura funcional       | 100%     |
| Documentación actualizada | Sí       |

---

# Cronograma del Sprint

| Semana   | Actividades                                                           |
| -------- | --------------------------------------------------------------------- |
| Semana 1 | Implementación de Login y Registro.                                   |
| Semana 2 | Desarrollo de Formularios y Server Actions.                           |
| Semana 3 | Integración de Embeddings y Base de Datos Vectorial.                  |
| Semana 4 | Consultas semánticas, respuestas IA, pruebas y corrección de errores. |

---

# Criterios de Éxito

El Sprint será considerado exitoso si:

- Todas las historias de usuario fueron implementadas.
- El proceso de autenticación funciona correctamente.
- Los formularios validan la información antes del envío.
- La comunicación entre frontend y backend es estable.
- Los embeddings pueden almacenarse y recuperarse correctamente.
- La documentación del proyecto permanece actualizada.
- El sistema queda preparado para el desarrollo del Sprint 03.

---

# Observaciones

Durante este Sprint se espera enfrentar una mayor complejidad técnica debido a la integración de nuevas tecnologías como Server Actions, autenticación, bases de datos vectoriales y procesamiento inicial de Inteligencia Artificial.

Por esta razón, será fundamental mantener una comunicación constante entre los integrantes del equipo, realizar reuniones de seguimiento periódicas y documentar oportunamente cualquier inconveniente presentado durante el desarrollo.
