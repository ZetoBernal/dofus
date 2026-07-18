---
name: sync-quest-data
description: Re-scrapea las guías de duffus.fr y sus links en dofuspourlesnoobs.com, refresca src/data/quests y verifica que la app siga sana. Usar cuando duffus.fr agregue/actualice una guía, cuando los datos de misiones se vean desactualizados, o cuando el usuario pida "actualizar las misiones" / "resincronizar datos".
---

# Sync quest data

El sitio (`dofus-web`, Next.js en la raíz del repo) lee las misiones desde
JSON estático en `src/data/quests/`. Ese JSON no se genera en runtime: viene
de un pipeline de scraping en `scraper-duffus/` que hay que correr a mano y
copiar. Este skill automatiza ese pipeline completo.

## Cuándo NO usar esto

Si solo cambió el diseño/código de la app (no los datos), no hace falta
correr nada de esto — es exclusivamente para refrescar el contenido de las
misiones.

## Pasos

1. **Confirmar con el usuario** antes de correr nada si no fue él quien pidió
   explícitamente el refresh — el scraping pega contra duffus.fr y
   dofuspourlesnoobs.com (sitios de terceros), y `match_links.py` descarga
   ~2500 páginas del segundo sitio.

2. Rebuildear y correr el scraper de duffus.fr (Playwright headless en
   Docker — el sitio es una SPA, no sirve requests+HTML plano):

   ```bash
   cd scraper-duffus
   docker build -t duffus-scraper .
   docker run --rm -v "$(pwd)/output:/app/output" duffus-scraper
   ```

   Extrae, por guía, `{icono, banner, misiones: [{mision, zona, coordenadas,
   pnj, recursos}, ...]}` a `output/*.json`. `pnj` y `recursos[].img` son
   URLs absolutas a duffus.fr en este punto.

3. Rebuildear y correr el descargador de imágenes (HTTP simple, sin
   navegador). Descarga cada ícono/PNJ/recurso único referenciado y
   reescribe esos mismos `output/*.json` reemplazando las URLs remotas por
   rutas locales `/images/...`:

   ```bash
   docker build -f Dockerfile.images -t duffus-images .
   docker run --rm -v "$(pwd)/output:/app/output" duffus-images
   ```

   Es idempotente (no vuelve a bajar lo que ya existe en `output/images/`),
   así que correrlo de nuevo tras un scrape parcial es seguro.

4. Rebuildear y correr el matcher de links contra dofuspourlesnoobs.com
   (HTTP simple, sin navegador — ese sitio sí es estático):

   ```bash
   docker build -f Dockerfile.match -t duffus-linker .
   docker run --rm -v "$(pwd)/output:/app/output" duffus-linker
   ```

   Cruza cada misión con el `<title>` de las ~2480 páginas del sitemap de
   dofuspourlesnoobs.com y agrega el campo `link`. Revisa
   `output/with_links/_no_encontrados.json` — si ese archivo creció mucho
   respecto a antes (referencia: ~11 de 1136), algo cambió en el sitio
   destino y vale la pena avisar al usuario en vez de asumir que está bien.

5. Copiar el resultado a la app: el JSON a `src/data/quests/`, las imágenes
   nuevas a `public/images/` (sin pisar lo que ya está, `cp -n`):

   ```bash
   cd ..
   cp scraper-duffus/output/with_links/*.json src/data/quests/
   rm src/data/quests/all_quests_links.json src/data/quests/_no_encontrados.json
   mkdir -p public/images
   cp -rn scraper-duffus/output/images/* public/images/
   ```

6. Verificar que todo siga andando antes de dar por terminado:

   ```bash
   npm run build
   npm run test
   ```

   `lib/guides.test.ts` valida que cada guía tenga misiones sin duplicados y
   con `link` válido — si algo del scraping salió mal, esto debería fallar
   acá antes de llegar a producción.

7. Contarle al usuario un resumen corto: cuántas misiones cambiaron por guía
   (comparando conteos antes/después, `git diff --stat src/data/quests/`
   sirve para esto), y si hubo guías nuevas o eliminadas en duffus.fr que
   requieran actualizar `GUIDES` en `src/lib/guides.ts`.

## Si duffus.fr agregó o quitó una guía

El scraper tiene hardcodeada la lista de slugs (`DOFUS_SLUGS` en
`scraper-duffus/scraper.py`) y `src/lib/guides.ts` tiene su propio `GUIDES`
con nombre/nivel para cada una. Si `/guides` en duffus.fr muestra una guía
nueva, hay que agregar el slug en ambos lugares a mano — no se infiere solo.
