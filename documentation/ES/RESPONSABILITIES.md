# Roles, Responsabilidades y Organización del Equipo

# Introducción

LlegoYa es un proyecto que combina desarrollo web, aplicacion móvil, inteligencia artificial, geolocalización en tiempo real, bases de datos distribuidas y metodologías ágiles.

Debido a la complejidad del sistema, cada integrante posee responsabilidades claramente definidas sobre módulos específicos del proyecto.

Este documento tiene como objetivo:

* Definir los roles del equipo.
* Establecer responsabilidades individuales.
* Delimitar áreas de trabajo.
* Facilitar el onboarding de nuevos integrantes.
* Evitar duplicidad de esfuerzos.
* Garantizar la correcta ejecución de los sprints.

---

# Estructura Organizacional

La organización del proyecto se encuentra dividida en cinco grandes áreas:

## Gestión de Producto

Responsable de definir qué se construye, cuándo se construye y por qué se construye.

Incluye:

* Product Backlog
* Historias de Usuario
* Roadmap
* Priorización
* Planeación de Sprints

---

## Frontend & UX

Responsable de toda la experiencia visual de la plataforma.

Incluye:

* Interfaces
* Navegación
* Diseño Responsive
* Experiencia de Usuario
* Componentes reutilizables

---

## Backend & Datos

Responsable de toda la lógica de negocio y persistencia.

Incluye:

* APIs
* Bases de Datos
* Seguridad
* Autenticación
* Integraciones

---

## Inteligencia Artificial

Responsable de la capa cognitiva del sistema.

Incluye:

* Chat Inteligente
* Embeddings
* RAG
* Agentes
* Logging
* Fine-Tuning

---

## Movilidad y Geolocalización

Responsable de toda la información en tiempo real relacionada con ubicación y rutas.

Incluye:

* GPS
* Tracking
* Mapas
* Actualizaciones en tiempo real
* Sincronización de buses

---

# Roles Oficiales del Proyecto

## Product Owner (PO)

Responsable de maximizar el valor del producto.

Funciones:

* Definir visión del producto.
* Priorizar backlog.
* Aprobar funcionalidades.
* Gestionar alcance.
* Validar entregables.

---

## Scrum Master

Responsable de garantizar la correcta aplicación de Scrum.

Funciones:

* Facilitar ceremonias.
* Eliminar bloqueos.
* Proteger al equipo.
* Mantener la organización.

---

## Frontend Developer

Responsable de construir las interfaces de usuario.

---

## Backend Developer

Responsable de construir APIs y lógica de negocio.

---

## AI Engineer

Responsable de toda la capa de Inteligencia Artificial.

---

## Mobile Developer

Responsable de las aplicaciones móviles.

---

## Realtime Engineer

Responsable de geolocalización y sincronización en tiempo real.

---

# Integrantes del Proyecto

---

# Juan Sebastián

## Rol

Product Owner + Scrum Master

## Misión Principal

Garantizar que el equipo construya el producto correcto y no solamente que escriba código.

Es el responsable de mantener la visión general de LlegoYa y asegurar que todos los módulos trabajen de forma coordinada.

---

## Responsabilidades

### Gestión del Producto

* Mantener Product Backlog.
* Definir Historias de Usuario.
* Priorizar funcionalidades.
* Definir alcance del MVP.
* Validar entregables.

---

### Gestión Scrum

* Sprint Planning.
* Sprint Review.
* Sprint Retrospective.
* Daily Scrum.
* Seguimiento de bloqueos.

---

### Gestión Documental

Responsable de crear y mantener:

* README
* Product Vision
* Project Overview
* Architecture Document
* Sprint Documentation
* Release Notes
* User Stories
* Diagramas del sistema

---

### Gestión Estratégica

Tomar decisiones relacionadas con:

* Alcance.
* Prioridades.
* Roadmap.
* Nuevos módulos.
* Arquitectura funcional.

---

### Indicadores de Éxito

* Backlog actualizado.
* Historias refinadas.
* Sprints organizados.
* Documentación actualizada.
* MVP entregado en tiempo.

---

# Miguel

## Rol

AI Engineer

## Misión Principal

Construir el cerebro de LlegoYa.

Miguel es responsable de que la Inteligencia Artificial responda correctamente, entienda el contexto de movilidad y evolucione hasta convertirse en un asistente especializado en transporte.

---

## Responsabilidades

### Chat Inteligente

Desarrollar el sistema conversacional.

Debe responder preguntas como:

* ¿Qué ruta me sirve?
* ¿Qué buses tengo cerca?
* ¿Cómo llego a mi destino?
* ¿Qué alternativas tengo?

---

### Sistema RAG

Construir:

Pregunta
↓
Embedding
↓
Vector Search
↓
Contexto
↓
Respuesta

---

### Logging de IA

Toda interacción debe almacenarse en MongoDB.

Guardar:

* Pregunta.
* Contexto.
* Respuesta.
* Fecha.
* Usuario.

---

### Control de Calidad

Reducir:

* Alucinaciones.
* Respuestas ambiguas.
* Información incorrecta.

---

### Futuro Fine-Tuning

Preparar la información que permitirá entrenar versiones especializadas del modelo.

---

# Daniel

## Rol

Frontend Lead & UX Engineer

## Misión Principal

Construir una experiencia de usuario moderna, intuitiva y consistente.

Daniel es dueño de toda la apariencia visual de LlegoYa.

---

## Responsabilidades

### Diseño de Interfaces

Construir y mejorar:

* Login.
* Registro.
* Dashboard.
* Chat.
* Favoritos.
* Historial.
* Panel Admin.
* Panel Conductor.

---

### Sistema de Diseño

Definir:

* Colores.
* Espaciados.
* Tipografías.
* Componentes reutilizables.

---

### Experiencia de Usuario

Implementar:

* Toasts.
* Alertas.
* Skeletons.
* Loaders.
* Estados vacíos.
* Manejo de errores.

---

### Responsive Design

Garantizar funcionamiento en:

* Desktop.
* Tablet.
* Mobile.

---

### Autenticación Visual

Diseñar:

* Flujos de Login.
* Recuperación de sesión.
* Redirecciones.
* Estados protegidos.

---

# Estiven

## Rol

Maps Engineer

## Misión Principal

Construir todo el ecosistema visual de movilidad.

Será responsable del mapa principal de LlegoYa.

---

## Responsabilidades

### Mapa Principal

Implementar:

* Visualización de rutas.
* Visualización de buses.
* Marcadores.
* Capas de información.

---

### Integración Cartográfica

Evaluar e implementar:

* Mapbox.
* HERE Maps.
* Google Maps Platform.

---

### Visualización Operativa

Mostrar:

* Buses activos.
* Rutas activas.
* Ubicación actual del usuario.

---

### Optimización

Garantizar que el mapa sea fluido incluso con múltiples vehículos activos.

---

# Samuel

## Rol

Realtime & Location Engineer

## Misión Principal

Hacer que la información del mapa sea real.

Mientras Estiven muestra los datos, Samuel es quien los genera y sincroniza.

---

## Responsabilidades

### Geolocalización

Capturar:

* Ubicación de conductores.
* Ubicación de buses.

---

### Actualización en Tiempo Real

Construir:

Conductor
↓
GPS
↓
API
↓
Supabase
↓
Mapa

---

### Sincronización

Actualizar posiciones cada pocos segundos.

---

### Backend de Tracking

Crear APIs para:

* Actualizar ubicación.
* Consultar ubicación.
* Consultar estado.

---

# Tobias

## Rol

Backend & Data Engineer

## Misión Principal

Construir la base de datos y la lógica de negocio principal del sistema.

---

## Responsabilidades

### Supabase

Diseñar:

* Tablas.
* Relaciones.
* Índices.
* Permisos.

---

### MongoDB

Gestionar:

* Historial.
* Logs.
* Conversaciones.

---

### APIs

Crear:

* CRUD de rutas.
* CRUD de buses.
* CRUD de conductores.

---

### Integraciones

Conectar:

* Frontend.
* Base de datos.
* IA.

---

### Calidad de Datos

Garantizar integridad y consistencia de la información.

---

# Desarrollador Mobile

## Rol

Mobile Engineer

## Misión Principal

Construir la experiencia móvil para usuarios y conductores.

---

## Aplicación Usuario

Funciones:

* Consulta de rutas.
* Chat IA.
* Favoritos.
* Historial.

---

## Aplicación Conductor

Funciones:

* Inicio de recorrido.
* Fin de recorrido.
* Compartir ubicación.
* Reportar incidentes.

---

## Integraciones

Consumir APIs desarrolladas por Backend.

Sincronizar ubicación con Supabase Realtime.

Mantener consistencia con la aplicación web.

---

# Filosofía del Equipo

Todos los integrantes son responsables de:

* Mantener código limpio.
* Documentar cambios.
* Seguir Git Flow.
* Participar en revisiones.
* Reportar bloqueos.
* Cumplir Definition of Done.

El éxito de LlegoYa depende de la colaboración entre todas las áreas y no únicamente del trabajo individual.
