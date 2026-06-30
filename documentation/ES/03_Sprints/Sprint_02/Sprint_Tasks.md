# Sprint 02 Tasks

## Información General

| Campo              | Valor      |
| ------------------ | ---------- |
| Sprint             | Sprint 02  |
| Duración           | 30 días    |
| Estado             | Finalizado |
| Total de Historias | 7          |
| Total de Tareas    | 34         |

---

# Objetivo

Descomponer las Historias de Usuario del Sprint 02 en tareas técnicas que permitan organizar el desarrollo, distribuir responsabilidades y facilitar el seguimiento del progreso durante todo el Sprint.

---

# Feature: Registro e Inicio de Sesión

## Tareas

| ID    | Tarea                                  | Prioridad | Estado     |
| ----- | -------------------------------------- | --------- | ---------- |
| T-001 | Diseñar interfaz de Login              | Alta      | Completada |
| T-002 | Diseñar interfaz de Registro           | Alta      | Completada |
| T-003 | Validar campos obligatorios            | Alta      | Completada |
| T-004 | Encriptar contraseña                   | Alta      | Completada |
| T-005 | Implementar autenticación              | Alta      | Completada |
| T-006 | Crear middleware para rutas protegidas | Alta      | Completada |

---

# US-012 - Formularios

## Objetivo

Crear formularios dinámicos para la interacción entre el usuario y el sistema.

### Tareas

| ID    | Tarea                                 | Estado     |
| ----- | ------------------------------------- | ---------- |
| T-007 | Crear componente LoginForm            | Completada |
| T-008 | Crear componente RegisterForm         | Completada |
| T-009 | Validar correo electrónico            | Completada |
| T-010 | Validar contraseña                    | Completada |
| T-011 | Mostrar mensajes de error             | Completada |
| T-012 | Limpiar formularios después del envío | Completada |

---

# US-013 - Server Actions

## Objetivo

Implementar Server Actions para manejar las operaciones del servidor de forma segura.

### Tareas

| ID    | Tarea                              | Estado     |
| ----- | ---------------------------------- | ---------- |
| T-013 | Crear Server Action para Login     | Completada |
| T-014 | Crear Server Action para Registro  | Completada |
| T-015 | Manejar errores del servidor       | Completada |
| T-016 | Validar información recibida       | Completada |
| T-017 | Conectar Server Actions con Prisma | Completada |

---

# US-014 - Embeddings

## Objetivo

Preparar el sistema para almacenar información mediante representaciones vectoriales.

### Tareas

| ID    | Tarea                               | Estado     |
| ----- | ----------------------------------- | ---------- |
| T-018 | Configurar generación de embeddings | Completada |
| T-019 | Probar generación de vectores       | Completada |
| T-020 | Validar estructura del embedding    | Completada |
| T-021 | Optimizar almacenamiento            | Completada |

---

# US-015 - Base de Datos Vectorial

## Objetivo

Configurar la base de datos para soportar búsquedas semánticas.

### Tareas

| ID    | Tarea                                | Estado     |
| ----- | ------------------------------------ | ---------- |
| T-022 | Instalar pgvector                    | Completada |
| T-023 | Configurar PostgreSQL                | Completada |
| T-024 | Actualizar esquema Prisma            | Completada |
| T-025 | Crear migraciones                    | Completada |
| T-026 | Verificar almacenamiento de vectores | Completada |

---

# US-016 - Consulta a Embeddings

## Objetivo

Permitir que el sistema consulte información almacenada mediante similitud vectorial.

### Tareas

| ID    | Tarea                            | Estado     |
| ----- | -------------------------------- | ---------- |
| T-027 | Crear consulta vectorial         | Completada |
| T-028 | Validar resultados               | Completada |
| T-029 | Integrar búsqueda con el backend | Completada |
| T-030 | Optimizar tiempo de respuesta    | Completada |

---

# US-017 - Respuestas de IA

## Objetivo

Permitir que la aplicación genere respuestas utilizando el contexto recuperado.

### Tareas

| ID    | Tarea                               | Estado     |
| ----- | ----------------------------------- | ---------- |
| T-031 | Configurar prompt del sistema       | Completada |
| T-032 | Integrar respuestas del modelo      | Completada |
| T-033 | Guardar historial de conversaciones | Completada |
| T-034 | Validar respuestas generadas        | Completada |

---

# Distribución General del Trabajo

| Área                    | Número de Tareas |
| ----------------------- | ---------------- |
| Autenticación           | 6                |
| Formularios             | 6                |
| Server Actions          | 5                |
| Embeddings              | 4                |
| Base de Datos Vectorial | 5                |
| Consultas IA            | 4                |
| Respuestas IA           | 4                |

**Total:** 34 tareas.

---

# Estado de las Tareas

| Estado                              | Cantidad |
| ----------------------------------- | -------- |
| Completadas                         | 31       |
| Completadas con ajustes posteriores | 3        |
| Pendientes                          | 0        |
| Canceladas                          | 0        |

---

# Dependencias Técnicas

Durante el desarrollo de estas tareas fue necesario contar con:

- Proyecto base configurado desde el Sprint 01.
- Prisma correctamente conectado a PostgreSQL.
- Variables de entorno configuradas.
- Acceso a la API de IA.
- Librerías necesarias instaladas.
- Configuración inicial de pgvector.

---

# Dificultades Encontradas

Durante la ejecución del Sprint surgieron algunos inconvenientes técnicos que requirieron tiempo adicional para su resolución.

## Autenticación

- Errores en la validación de credenciales.
- Problemas con la persistencia de la sesión.
- Protección incompleta de algunas rutas.

---

## Server Actions

- Dificultades para comprender el flujo entre cliente y servidor.
- Manejo incorrecto de errores asíncronos.
- Problemas con el tipado de TypeScript.

---

## Git

- Conflictos al realizar merge entre ramas.
- Dificultades al utilizar `git merge` ocasionando `git rebase` obligatorio .
- Integración manual de cambios.

---

## Base de Datos

- Errores durante las migraciones de Prisma.
- Configuración inicial de pgvector.
- Sincronización entre el esquema y la base de datos.

---

# Resumen del Sprint

El Sprint 02 representó un incremento significativo en la complejidad técnica del proyecto. A diferencia del Sprint anterior, en esta etapa se implementaron funcionalidades directamente relacionadas con la experiencia del usuario y se inició la integración de herramientas de Inteligencia Artificial.

Aunque se presentaron algunos inconvenientes relacionados con Git, autenticación y configuración de la base de datos, todas las tareas planificadas lograron completarse antes del cierre del Sprint, permitiendo continuar con el desarrollo de nuevas funcionalidades en el Sprint 03.
