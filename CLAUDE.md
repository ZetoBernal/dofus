@AGENTS.md

# dofus-web

Sitio Next.js (App Router, TypeScript, Tailwind v4) de guías de misiones de
Dofus. Landing page + una página estática por guía con checklist de
progreso.

## Cómo está armado

- **`scraper-duffus/`** — pipeline de scraping, independiente de la app,
  corre en Docker (ver su propio flujo en `.claude/skills/sync-quest-data/`).
  No se ejecuta en runtime; genera JSON que se copia a mano a
  `src/data/quests/`.
- **`src/data/quests/*.json`** — un archivo por guía:
  `{icono, banner, rangos?, misiones: [{mision, zona, coordenadas, link,
  pnj, recursos, donjon, rango?}, ...]}`. `rangos`/`rango` solo existen en
  `guide-complet` (pestañas de nivel 1-20, 20-40, ...). Es la única fuente
  de datos de la app; no hay base de datos ni fetch en runtime. Todas las
  imágenes (`pnj`, `recursos[].img`, `donjon.img`, `icono`, `banner`) son
  rutas locales bajo `/images/`, nunca URLs remotas — `download_images.py`
  se encarga de eso en el pipeline de scraping.
- **`src/lib/guides.ts`** — metadata de las 23 guías (nombre, nivel,
  categoría) hardcodeada a mano + `getQuests(slug)` que lee el JSON
  correspondiente vía `fs` (funciona porque `page.tsx` son Server
  Components).
- **`src/app/guias/[slug]/page.tsx`** — 100% estático
  (`generateStaticParams` + `generateMetadata`), sin fetch en runtime. Todas
  las páginas se generan en build time.
- **`src/components/*.tsx`** — la única parte interactiva (`"use client"`):
  checklist con progreso, búsqueda, copiar `/travel x,y`. Progreso persiste
  en `localStorage` vía `src/lib/progress.ts`, cargado en un `useEffect`
  post-montaje para no romper la hidratación del HTML estático (ver
  `.claude/agents/design-reviewer.md` para el porqué).

## Actualizar datos de misiones

Cuando duffus.fr cambie una guía o los datos se vean desactualizados, usar
el skill `sync-quest-data` en vez de tocar `src/data/quests/` a mano.

## Testing

`npm run test` (Vitest + React Testing Library, jsdom). Cubre `src/lib/*` y
los componentes cliente. Las páginas Server Component (`async function
Page`) no son testeables con Vitest (limitación conocida de RSC async) — se
verifican corriendo `npm run dev` y revisando en el navegador.

**Vitest no chequea tipos** (transpila con esbuild, sin type-check). Ya pasó
que un fixture de test quedó desincronizado con un tipo (`Quest`/`GuideMeta`)
y `npm run test` lo dejó pasar igual. Correr `npm run typecheck` (`tsc
--noEmit`) además de `test` antes de dar algo por terminado — `next build`
type-checkea el código de la app pero no necesariamente los `*.test.tsx`.

## Antes de dar por terminado un cambio de UI

Correr el agente `design-reviewer` sobre los archivos tocados en `src/app/`
o `src/components/`.
