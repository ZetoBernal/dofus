# dofus-web

Sitio de guías de misiones de Dofus. Landing page + una página por guía con
checklist de progreso, más un panel de admin para traducir misiones al
español. Monorepo con **front y back separados** en carpetas propias,
coordinados con npm workspaces desde la raíz.

## Cómo está armado

- **`front/`** — Next.js (App Router, TypeScript, Tailwind v4). Sirve las
  páginas públicas y el panel `/admin`. No toca Postgres directo — todo lo
  que antes era Prisma ahora son llamadas HTTP al backend.
- **`back/`** — NestJS con Prisma como ORM, en arquitectura limpia
  (`domain/` → `application/` → `infrastructure/`). Dueño de la
  autenticación del admin, el CRUD de traducciones y la subida de imágenes.
  Ver "Backend (NestJS)" más abajo para el detalle de capas.
- **`scraper-duffus/`** — pipeline de scraping, independiente de front/back,
  corre en Docker (ver `.claude/skills/sync-quest-data/`). No se ejecuta en
  runtime; genera JSON que se copia a mano a `front/src/data/quests/`.
- **`docker-compose.yml`** (raíz) — Postgres local para `back/`.

### Setup local

```bash
npm install                       # instala front/ y back/ (workspaces)
docker compose up -d db           # levanta Postgres
cd back && npx prisma migrate dev # aplica el schema
npm run dev                       # desde la raíz: levanta front (:3000) y back (:4000) juntos
```

`.env` está separado por carpeta (`front/.env`, `back/.env`), cada uno
gitignoreado con placeholders versionados. `back/.env` necesita
`ADMIN_PASSWORD_HASH` — generalo con `npx tsx scripts/hash-password.ts
"tu-contraseña"` corrido desde `back/`.

## Front (`front/`)

Ver [`front/AGENTS.md`](front/AGENTS.md) antes de tocar código Next.js ahí —
esta versión de Next tiene cambios importantes respecto a lo que trae
entrenado un modelo.

- **`src/data/quests/*.json`** — un archivo por guía:
  `{icono, banner, rangos?, misiones: [{mision, zona, coordenadas, link,
  pnj, recursos, donjon, rango?}, ...]}`. `rangos`/`rango` solo existen en
  `guide-complet` (pestañas de nivel 1-20, 20-40, ...). Es la fuente de
  datos base (contenido en francés); no hay fetch a una API externa para
  esto. Todas las imágenes (`pnj`, `recursos[].img`, `donjon.img`, `icono`,
  `banner`) son rutas locales bajo `/images/`, nunca URLs remotas —
  `download_images.py` se encarga de eso en el pipeline de scraping.
- **`src/lib/guides.ts`** — metadata de las 23 guías (nombre, nivel,
  categoría) hardcodeada a mano + `getQuests(slug)` que lee el JSON
  correspondiente vía `fs` (funciona porque `page.tsx` son Server
  Components).
- **`src/lib/overrides.ts`** — capa de datos para las traducciones, pero acá
  ya no pega contra Prisma: hace `fetch` al backend
  (`getAllOverrides`/`getOverride`, con `{ fresh: true }` para bypasear
  cache cuando lo necesita el admin). Mismos nombres/firmas que antes para
  no tener que tocar las páginas que los consumen.
- **`src/app/guias/[slug]/page.tsx`** — `generateStaticParams` +
  `export const revalidate = 60`: se pre-renderiza en build pero se
  regenera en background cada 60s (ISR), para que las traducciones nuevas
  del admin aparezcan sin rebuild manual. Como esto llama a `back/` en cada
  regeneración, **`next build` necesita el backend (y Postgres) corriendo**
  — ya no es buildeable 100% offline.
- **`src/proxy.ts`** (no `middleware.ts` — Next 16 lo renombró) protege
  `/admin/*` chequeando **solo que exista** la cookie de sesión, sin
  verificar la firma del JWT — el back es quien realmente autentica en cada
  escritura (ver más abajo). Esto evita duplicar el `SESSION_SECRET` entre
  front y back; una cookie vencida o falsa no deja mutar nada porque el
  guard del back la rechaza.
- **`next.config.ts`** — `rewrites()` manda todo `/backend/*` al backend
  (`BACKEND_URL` en `front/.env`). El navegador le pega a `/backend/...`
  como si fuera del mismo origen, así la cookie de sesión que pone el back
  queda same-origin sin necesitar CORS. `src/components/admin/
  MissionEditor.tsx` (client component) usa esto para PUT/DELETE/upload.
- **`src/app/admin/actions.ts`** — el login sí es un Server Action (corre
  server-to-server contra el back, sin pasar por el navegador), así que acá
  se relee el `Set-Cookie` de la respuesta del back y se reproduce como
  cookie propia vía `next/headers`. `logout` solo borra la cookie local
  (JWT stateless, no hay sesión que invalidar del lado del back).
- **`src/components/*.tsx`** — la parte interactiva (`"use client"`):
  checklist con progreso, búsqueda, copiar `/travel x,y`, toggle FR/ES.
  Progreso persiste en `localStorage` vía `src/lib/progress.ts`, idioma vía
  `src/lib/language.ts` — ambos cargados en un `useEffect` post-montaje
  para no romper la hidratación del HTML estático (ver
  `.claude/agents/design-reviewer.md` para el porqué).
- **Selector FR/ES** (`LanguageProvider` + `LanguageToggle`): en francés
  todo funciona como siempre (link externo a dofuspourlesnoobs.com). En
  español, si la misión tiene traducción se muestra el nombre en español y
  un desplegable con los pasos; si no la tiene, cae al nombre en francés
  con una marca "(sin traducir)" — nunca rompe ni oculta nada, tenerlo sin
  traducir es el estado esperado para la mayoría de las 1136 misiones por
  ahora.

## Backend (`back/`)

NestJS con Prisma, en arquitectura limpia:

- **`src/domain/`** — entidades e interfaces puras (`MissionOverride`,
  `MissionOverrideRepository`, `TokenService`, `PasswordHasher`,
  `AdminCredentialsProvider`, `FileStorage`). Sin dependencias de Nest ni
  de Prisma — son los contratos que implementa `infrastructure/`.
- **`src/application/`** — casos de uso (`SaveOverrideUseCase`,
  `LoginUseCase`, `UploadStepImageUseCase`, etc.), orquestan el dominio sin
  saber de HTTP ni de la base de datos concreta.
- **`src/infrastructure/`** — las implementaciones reales:
  `persistence/` (Prisma), `auth/` (JWT vía `jose`, bcrypt, credenciales
  desde env), `storage/` (filesystem local para imágenes subidas),
  `http/` (controllers, DTOs con `class-validator`, el guard de sesión).
- **`src/modules/`** — el composition root: cablea cada interfaz del
  dominio a su implementación concreta vía DI (`{ provide: TokenService,
  useClass: JoseTokenService }`, etc.).
- **Rutas**: todo bajo prefijo global `/api` (`POST /api/auth/login`,
  `GET|PUT|DELETE /api/mission-overrides/:mision`, `POST
  /api/uploads/steps`). Las lecturas de `mission-overrides` son públicas
  (las consume la página pública de guías); solo escribir/borrar y subir
  imágenes requieren la cookie de sesión (`SessionAuthGuard`).
- **Imágenes subidas** se guardan en `back/uploads/steps/` (gitignoreado —
  contenido en runtime) y se sirven directo por Nest en `/uploads/...`
  (`app.useStaticAssets`, fuera del prefijo `/api`). El front las referencia
  como `/backend/uploads/steps/...`, que el rewrite de Next resuelve al
  backend.
- **`prisma/schema.prisma`** — `MissionOverride` (keyed por `mision`, el
  nombre francés — es estable y global entre guías) + `Step[]` (texto +
  imagen opcional, orden libre). Generador Prisma 7 con driver adapter
  (`@prisma/adapter-pg`) — ver `src/infrastructure/persistence/prisma.service.ts`.
- **Variable de puerto propia**: el backend escucha en `BACK_PORT` (no
  `PORT`) — algunas herramientas de desarrollo inyectan `PORT` apuntando al
  front, y si el back también lo leyera pisarían el mismo puerto.
- **`ADMIN_PASSWORD_HASH`**: a diferencia de cuando esto vivía en Next.js,
  acá **no** hace falta escapar los `$` del hash bcrypt — `@nestjs/config`
  usa dotenv sin expansión de variables, así que el hash se carga tal cual
  lo imprime `scripts/hash-password.ts`. (El bug de silent-corruption por
  expansión de `$` que documentábamos acá era específico de Next.js; ya no
  aplica.)

## Actualizar datos de misiones

Cuando duffus.fr cambie una guía o los datos se vean desactualizados, usar
el skill `sync-quest-data` en vez de tocar `front/src/data/quests/` a mano.

## Testing

**Front** (`cd front && npm run test`, Vitest + React Testing Library,
jsdom). Cubre `src/lib/*` y los componentes cliente. Las páginas Server
Component (`async function Page`) no son testeables con Vitest (limitación
conocida de RSC async) — se verifican corriendo `npm run dev` desde la raíz
y revisando en el navegador.

**Vitest no chequea tipos** (transpila con esbuild, sin type-check). Correr
`npm run typecheck` (desde la raíz, corre `tsc --noEmit` en front y back)
además de `test` antes de dar algo por terminado.

`front/src/lib/overrides.ts` no tiene tests — es un fetch wrapper fino, y
probarlo de verdad necesitaría el backend + Postgres corriendo. Se verifica
a mano contra `docker compose up -d db` + `npm run dev` + `/admin`.

**Back** no tiene suite de tests automatizada todavía (Nest usa Jest por
convención, no Vitest — no se armó para no duplicar tooling sin necesidad
real). Se verifica a mano: `cd back && npm run typecheck`, `npm run build`,
y probando los endpoints contra Postgres local.

## Antes de dar por terminado un cambio de UI

Correr el agente `design-reviewer` sobre los archivos tocados en
`front/src/app/` o `front/src/components/`.
