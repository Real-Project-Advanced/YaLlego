# Roles del Sistema

La plataforma LlegoYa está diseñada para ser utilizada por diferentes tipos de usuarios.

Cada rol tiene permisos, responsabilidades y funcionalidades específicas.

---

# Usuario

## Descripción

Es la persona que utiliza el transporte público,son las personas que necesitan y consultan información sobre rutas y buses.

Representa el principal beneficiario del sistema.

---

## Responsabilidades

* Consultar rutas.
* Buscar destinos.
* Interactuar con la IA.
* Administrar sus favoritos.
* Consultar historial.

---

## Permisos

Puede:

* Registrarse.
* Iniciar sesión.
* Editar perfil.
* Consultar rutas.
* Consultar buses.
* Guardar favoritos.
* Utilizar el chat inteligente.

No puede:

* Crear rutas.
* Crear buses.
* Administrar conductores.
* Modificar información operativa.

---

## Casos de Uso

Ejemplos:

* Buscar una ruta para llegar al trabajo.
* Consultar buses cercanos.
* Preguntar a la IA qué ruta tomar.
* Guardar una ruta frecuente.

---

# Conductor

## Descripción

Persona encargada de operar un vehículo perteneciente a una empresa de transporte.

Su función principal es proporcionar información de ubicación en tiempo real al sistema por medio de su dispositivo movil.

---

## Responsabilidades

* Compartir ubicación.
* Consultar rutas asignadas.
* Actualizar estado operativo.
* Mantener información actualizada.

---

## Permisos

Puede:

* Iniciar sesión.
* Consultar ruta asignada.
* Compartir ubicación GPS.
* Cambiar estado operativo.

No puede:

* Crear rutas.
* Crear buses.
* Administrar usuarios.

---

## Estados Operativos

* Disponible.
* En servicio.
* En descanso.
* Fuera de servicio.

---

# Administrador

## Descripción

La Persona encargada de administrar la operación de una empresa de transporte, es aquella que tiene la disponibilidad de hacer toda la gestion.

Tiene acceso a herramientas de gestión y supervisión.

---

## Responsabilidades

* Gestionar conductores.
* Gestionar buses.
* Gestionar rutas.
* Supervisar la operación.

---

## Permisos

Puede:

* Crear conductores.
* Editar conductores.
* Crear buses.
* Editar buses.
* Crear rutas.
* Editar rutas
* Asignar rutas.
* Consultar información operativa.

---

## Casos de Uso

* Asignar un conductor a un bus.
* Crear una nueva ruta.
* Actualizar información operativa.
* Supervisar vehículos activos.

---

# Relación entre Roles

Administrador
↓
Conductores y Buses
↓
Ubicación en Tiempo Real
↓
Usuarios
↓
Consultas e Interacciones con IA

Esta relación representa el flujo principal de información dentro de la plataforma.

Toda la operación generada por administradores y conductores termina beneficiando al usuario final mediante información actualizada y recomendaciones inteligentes.