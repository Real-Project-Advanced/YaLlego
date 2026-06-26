# LlegoYa

LlegoYa es una plataforma fullstack para movilidad urbana en Medellin. El proyecto busca ayudar a usuarios del transporte publico a consultar rutas, visualizar buses y recibir recomendaciones de desplazamiento mediante una experiencia web con mapas, autenticacion por roles e inteligencia artificial especializada en movilidad.

El producto esta pensado como una base escalable para un ecosistema de movilidad inteligente: usuarios consultan rutas y recomendaciones, conductores comparten informacion operativa, y administradores gestionan rutas, buses y conductores desde una misma fuente de datos.

## Objetivo del proyecto

Construir una plataforma inteligente capaz de reducir la incertidumbre al moverse por la ciudad, centralizando informacion de rutas, buses, usuarios y operacion de transporte.

La vision funcional incluye:

- Consulta y comparacion de rutas urbanas.
- Visualizacion de recorridos y buses sobre mapa.
- Chat inteligente para preguntas de movilidad en Medellin.
- Gestion de usuarios, conductores, buses y rutas.
- Paneles diferenciados para usuario, conductor y administracion.
- Base tecnica preparada para datos en tiempo real, analitica y futuras integraciones.

## Estado actual

El repositorio contiene un MVP web construido con Next.js y TypeScript. Actualmente incluye:

- Landing page y flujo de autenticacion.
- Registro, inicio de sesion, cierre de sesion y renovacion de tokens.
- Autenticacion con JWT en cookies `httpOnly`.
- Redireccion por rol hacia paneles de usuario, conductor o administrador.
- Dashboard de usuario con busqueda de rutas, favoritos, novedades y chatbot.
- Vistas administrativas iniciales para dashboard, rutas, conductores y superadmin.
- Modulo de mapas con Leaflet, rutas y buses simulados en Medellin.
- Servicio de IA conectado a Ollama para preguntas de movilidad.
- Modelo de datos Prisma para usuarios, conductores, transportes y rutas.
- Integraciones preparadas para PostgreSQL/Supabase y MongoDB.

Algunas capacidades descritas en la documentacion del producto son parte de la vision y del roadmap, no necesariamente funcionalidades completas en produccion.

## Roles del sistema

LlegoYa contempla tres tipos principales de usuario:

- `USER`: usuario final del transporte publico. Consulta rutas, usa el chat, revisa favoritos e historial.
- `DRIVER`: conductor. Consulta rutas asignadas y comparte estado/ubicacion operativa.
- `SUPER_ADMIN`: administrador. Gestiona informacion operativa como rutas, conductores y vehiculos.

## Stack tecnologico

- **Framework:** Next.js 16 con App Router.
- **Lenguaje:** TypeScript.
- **UI:** React 19, Tailwind CSS 4, Radix UI y Lucide React.
- **Mapas:** Leaflet y React Leaflet.
- **Base de datos relacional:** PostgreSQL mediante Prisma 7 y `@prisma/adapter-pg`.
- **Servicios externos:** Supabase client y MongoDB client.
- **Autenticacion:** JWT con `jose`, cookies `httpOnly` y hash de contrasenas con `bcryptjs`.
- **IA:** Ollama mediante un servicio de chat local.
- **Calidad:** ESLint, Prettier, Husky y lint-staged.

## Estructura del proyecto

```txt
.
├── documentation/          # Documentacion de producto en ES/EN
├── prisma/                 # Esquema Prisma y configuracion de base de datos
├── public/                 # Assets publicos
├── src/
│   ├── app/                # Rutas, layouts y API routes de Next.js
│   ├── components/         # Componentes reutilizables de UI
│   ├── generated/          # Cliente Prisma generado
│   ├── lib/                # Clientes, auth, mapas y utilidades
│   ├── modules/            # Modulos de dominio: auth, routes, user, shared
│   ├── shared/             # Tipos, validadores y constantes compartidas
│   └── types/              # Tipos globales del proyecto
├── ARQUITECTURA.md         # Documento historico de arquitectura
├── TOKENS.md               # Notas relacionadas con tokens/autenticacion
└── package.json            # Scripts y dependencias
```

## Modulos principales

### Autenticacion

El modulo de autenticacion vive principalmente en `src/modules/auth`, `src/lib/auth.ts`, `src/middleware.ts` y `src/app/api/auth`.

Incluye:

- Registro y login.
- Hash de contrasenas.
- Access token y refresh token.
- Cookies seguras `httpOnly`.
- Middleware de proteccion de rutas.
- Redireccion despues del login segun el rol.

### Usuarios

El modulo de usuario esta en `src/modules/user`. Contiene el dashboard del usuario final, busqueda de rutas, favoritos, novedades y panel de chatbot.

### Rutas y mapas

El modulo de rutas esta en `src/modules/routes` y `src/lib/maps`. Usa Leaflet para mostrar el mapa de Medellin, rutas simuladas, buses simulados y limites geograficos.

### Inteligencia artificial

El servicio de IA esta en `src/modules/shared/services/ai.service.ts`. Se conecta a Ollama y usa un prompt de sistema enfocado exclusivamente en movilidad urbana del Valle de Aburra.

Variables relacionadas:

- `OLLAMA_ENDPOINT`
- `OLLAMA_MODEL`

### Datos

El modelo relacional principal esta en `prisma/schema.prisma` e incluye:

- `users`
- `drivers`
- `transports`
- `routes`
- `user_role`

## Requisitos

- Node.js compatible con Next.js 16.
- npm.
- PostgreSQL disponible mediante `DATABASE_URL`.
- Ollama instalado y ejecutando un modelo compatible si se desea usar el chat de IA.
- MongoDB opcional para logging o futuras funcionalidades relacionadas con IA.
- Credenciales de Supabase opcionales si se usa el cliente de Supabase.

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto con las variables necesarias:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

JWT_SECRET="replace-with-a-secure-secret"
JWT_REFRESH_SECRET="replace-with-a-secure-refresh-secret"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

OLLAMA_ENDPOINT="http://127.0.0.1:11434/api"
OLLAMA_MODEL="smartops-bot"

MONGODB_URI="mongodb+srv://USER:PASSWORD@HOST/DATABASE"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

Para desarrollo local, `DATABASE_URL`, `JWT_SECRET` y `JWT_REFRESH_SECRET` son las variables mas importantes. MongoDB, Supabase y Ollama dependen del flujo que se quiera probar.

## Instalacion

```bash
npm install
```

Genera el cliente de Prisma:

```bash
npm run db:generate
```

Sincroniza el esquema con la base de datos configurada:

```bash
npm run db:push
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicacion quedara disponible normalmente en:

```txt
http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev          # Ejecuta Next.js en modo desarrollo
npm run build        # Construye la aplicacion para produccion
npm run start        # Inicia la build de produccion
npm run lint         # Ejecuta ESLint
npm run format       # Formatea el proyecto con Prettier
npm run db:generate  # Genera el cliente Prisma
npm run db:push      # Aplica el esquema Prisma a la base de datos
```

## Rutas relevantes

- `/`: pagina publica principal.
- `/login`: inicio de sesion.
- `/register`: registro.
- `/user`: dashboard del usuario final.
- `/driver`: dashboard del conductor.
- `/admin`: panel administrativo.
- `/admin/routes`: administracion de rutas.
- `/admin/driver`: administracion de conductores.
- `/admin/superadmin`: vista de superadministrador.
- `/api/auth/*`: endpoints de autenticacion.
- `/api/chat`: endpoint de chat con IA.

## Convenciones de desarrollo

- Usar TypeScript de forma estricta y evitar `any`.
- Mantener UI, logica de negocio, acceso a datos y tipos separados por modulo.
- Preferir componentes reutilizables en `src/components` o dentro del modulo correspondiente.
- Mantener validaciones compartidas en `src/shared/validators`.
- Ejecutar lint y formato antes de abrir un Pull Request.
- No subir secretos reales en `.env`, logs o documentacion.
- Trabajar mediante Pull Request hacia ramas protegidas.

## Documentacion del producto

La documentacion funcional y organizacional esta en `documentation/`:

- `documentation/ES/PRODUCT_VISION.md`
- `documentation/ES/PROJECT-OVERVIEW.md`
- `documentation/ES/USER_ROLES.md`
- `documentation/ES/SPRINT_PLANNING.md`
- `documentation/ES/RESPONSABILITIES.md`

Tambien existen versiones en ingles dentro de `documentation/EN/`.

## Roadmap

Proximas capacidades previstas:

- Tracking GPS real para buses y conductores.
- Gestion completa de rutas, vehiculos y asignaciones.
- Historial persistente de consultas y rutas favoritas.
- Alertas inteligentes sobre cambios de servicio.
- Recomendaciones basadas en datos historicos.
- RAG para que la IA responda con informacion operativa actualizada.
- Analitica para administradores y empresas de transporte.
- Aplicacion movil.

## Licencia

Este proyecto es privado y de uso academico/profesional del equipo LlegoYa, salvo que el repositorio indique una licencia diferente.
