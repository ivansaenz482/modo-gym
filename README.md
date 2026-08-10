# MODO GYM — Plataforma completa

Plataforma escalable para gimnasios: **página web con panel de administrador**, **app móvil (Play Store)** y **API con
inteligencia artificial** conectada a **N8n**.

> ⚠️ **Estado:** versión de pruebas gratuita. Antes de publicar en Play Store hay que revisar seguridad y configurar builds
> de producción.

## Arquitectura

```
modo-gym/
├── apps/
│   ├── web/       # Sitio web (React + Vite) + panel admin + códigos QR
│   ├── mobile/    # App móvil (Expo SDK 57 / React Native 0.86)
│   └── api/       # API NestJS 11 + Prisma 7 + PostgreSQL + IA (N8n)
├── n8n/           # Workflows de N8n (generador de rutinas con IA)
├── scripts/       # Scripts auxiliares (setup de N8n)
├── docker-compose.yml  # postgres + api + n8n
└── .env.example   # Variables de entorno (copiar a .env)
```

## Puesta en marcha (desarrollo local)

### 1. Requisitos

- Node.js ≥ 22.13
- Docker Desktop (o engine compatible)

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env: credenciales de BD, JWT_SECRET, N8N_OWNER_PASSWORD, etc.
```

### 3. Instalar dependencias

```bash
npm install
```

> Si npm bloquea scripts de instalación (Prisma/esbuild), aprueba los paquetes con `npm approve-scripts <paquete>@<versión>` o
> añádelos a `allowScripts` en `package.json`.

### 4. Levantar la infraestructura

```bash
npm run docker:up        # postgres + api (NestJS) + n8n
npm run db:migrate       # aplicar migraciones
npm run db:seed          # datos de prueba (admin + cliente demo + ejercicios)
```

- **API:** http://localhost:3000/api · **Swagger:** http://localhost:3000/api/docs
- **N8n:** http://localhost:5678 (owner en `.env`: `N8N_OWNER_EMAIL` / `N8N_OWNER_PASSWORD`)
- **PostgreSQL:** puerto `55432` (para no chocar con PostgreSQL local)

### 5. Ejecutar la web

```bash
npm run dev:web          # http://localhost:5173
```

### 6. Ejecutar la app móvil

```bash
npm run dev:mobile       # Expo, escanea el QR con Expo Go
```

## Usuarios de prueba (seed)

| Rol | Email | Contraseña |
| --- | --- | --- |
| Administrador | `admin@modogym.com` | `admin123` |
| Cliente | `cliente@modogym.com` | `cliente123` |

## Inteligencia artificial con N8n

La API genera rutinas llamando a N8n:

```
POST /api/ai/routine  →  N8n webhook /webhook/routine-generator  →  OpenAI  →  rutina
```

Si N8n no está configurado, no tiene `OPENAI_API_KEY` o falla, la API usa un **generador local de respaldo** (ideal para
pruebas gratis). El campo `source` de la rutina indica el origen (`IA` vs `PROPIA`).

### Configurar N8n (automático)

1. En `.env` configura el owner de N8n (User Management):
   ```
   N8N_OWNER_EMAIL=admin@modogym.com
   N8N_OWNER_PASSWORD=una_contraseña_segura
   ```
2. Ejecuta la puesta a punto automática:
   ```bash
   npm run n8n:setup
   ```
   Esto crea la cuenta owner (si es la primera vez), genera y guarda la clave `N8N_API_KEY` en `.env`,
   e importa y **activa** el workflow `n8n/workflow-routine-generator.json` en N8n. El script es idempotente:
   si el workflow ya existe y está activo, lo deja tal cual (usa `--force` para reimportarlo).
3. Añade tu clave de OpenAI para que el webhook genere rutinas con IA real:
   - En `.env`: `OPENAI_API_KEY=sk-...` y ejecuta `npm run docker:up` (recrea el contenedor n8n), o
   - En N8n: Settings → Variables y crea `OPENAI_API_KEY`.

Verifica el webhook:

```bash
curl -X POST http://localhost:5678/webhook/routine-generator -H "Content-Type: application/json" \
  -d '{"daysPerWeek":4,"goal":"GANAR_MASA","experience":"INTERMEDIO"}'
```

### Panel de administrador

- **Resumen:** métricas de clientes, rutinas, progreso y ejercicios.
- **Clientes:** lista y detalle de cada cliente (perfil, rutinas, progreso, nutrición).
- **Ejercicios:** crea ejercicios y sube su foto o video. Las subidas se guardan en `apps/api/uploads/` y se sirven desde
  `/api/uploads/*` (solo imágenes jpg/png/webp/gif y videos mp4/webm/mov, máx. 50 MB).
- **Códigos QR:** enlaces para descargar la app y abrir la web.

## App móvil (Play Store)

- **Framework:** Expo SDK 57 (React Native 0.86, React 19).
- **Pantallas:** inicio, login/registro, onboarding (objetivo, días/semana, nivel), rutina (IA o propia), biblioteca de
  ejercicios con imágenes/videos, progreso y nutrición.
- **Publicación:** usa [EAS Build](https://docs.expo.dev/build/introduction/) para generar el APK/AAB. `android.package =
  com.modogym.app` ya está configurado en `app.config.js`.

### Generar APK de prueba con EAS Build

1. Instala dependencias del workspace (`npm install` en la raíz).
2. Inicia sesión en EAS: `npx eas-cli login` (cuenta de expo.dev).
3. Configura el proyecto la primera vez: `npm run build:configure -w @modo-gym/mobile`.
4. Edita en `apps/mobile/eas.json` la variable `EXPO_PUBLIC_API_URL` del perfil `preview` con la URL de tu API
   (debe ser alcanzable desde el teléfono, p. ej. `https://api.modogym.com` o tu IP de LAN).
5. Genera el APK de prueba:
   ```bash
   npm run build:android:preview -w @modo-gym/mobile
   ```
   El perfil `preview` genera un **APK instalable** (`buildType: apk`) e incluye `usesCleartextTraffic: true`
   para poder conectar con APIs en HTTP sin certificado (solo este perfil).
6. Descarga el APK desde el enlace que muestra EAS o instálalo con `npx eas-cli build:run -p android`.

### Generar AAB para Play Store

```bash
npm run build:android:production -w @modo-gym/mobile
```

El perfil `production` genera un AAB firmado para subir a la consola de Play. Requiere cuenta de desarrollador
y credenciales de firma configuradas en EAS.

### Notas para aprobar en Play Store

- Cambia `JWT_SECRET` por una clave larga y aleatoria (nunca en el repo).
- Usa **HTTPS** para la API en producción (la app móvil no permite HTTP en claro en builds finales).
- Configura `APP_DOWNLOAD_URL` con la URL real de la app publicada y `WEB_URL` con el dominio real.
- Los códigos QR del panel admin se generan desde **Admin → Códigos QR**: uno para descargar la app y otro para la página web.
- Revisa la política de datos/privacidad y los permisos de la app.

## API — Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/register` | Registrar cliente |
| POST | `/api/auth/login` | Iniciar sesión (JWT) |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| GET | `/api/clients` | Listar clientes (admin) |
| GET | `/api/clients/:id` | Detalle de cliente (admin o propio) |
| PATCH | `/api/clients/:id` | Editar perfil |
| GET | `/api/exercises` | Biblioteca de ejercicios |
| POST | `/api/exercises` | Crear ejercicio (admin) |
| PATCH | `/api/exercises/:id` | Actualizar ejercicio, p. ej. foto/video (admin) |
| POST | `/api/upload` | Subir imagen/video (multipart, admin) → devuelve URL |
| GET | `/api/upload/...` (estático) | Archivos subidos servidos desde `/api/uploads/*` |
| GET | `/api/routines/mine` | Rutinas del cliente |
| POST | `/api/routines` | Crear rutina propia |
| POST | `/api/ai/routine` | Generar rutina con IA (N8n o fallback) |
| POST | `/api/ai/nutrition` | Generar plan nutricional con IA |
| GET/POST | `/api/progress` | Progreso (peso, medidas) |
| GET | `/api/nutrition/mine` | Planes nutricionales del cliente |
| GET | `/api/qr` | URLs para los códigos QR (admin) |

## Comandos útiles

```bash
npm run dev          # todo: web + api + mobile
npm run dev:api      # solo API (hot reload)
npm run dev:web      # solo web
npm run dev:mobile   # solo app móvil
npm run build        # build de todos los workspaces
npm run n8n:setup    # importa y activa el workflow de IA en N8n
npm run db:seed      # sembrar datos de prueba
npm run docker:down  # detener contenedores
```

## Seguridad

- Passwords con `bcryptjs` (10 rondas).
- JWT con expiración (`JWT_EXPIRES_IN`) y `helmet` para cabeceras HTTP.
- Guards de roles (`ADMIN` vs `CLIENT`).
- `ValidationPipe` with class-validator in all DTOs.
- CORS restringido a `CORS_ORIGINS`.
- Swagger en `/api/docs` para auditar los endpoints.
