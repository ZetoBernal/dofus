"""
Scraper de misiones (quêtes) de las guías de duffus.fr: nombre, zona,
coordenada [x,y], PNJ que da la misión, recursos necesarios (si es de farm),
mazmorra asociada (si tiene), y el ícono + banner de cada guía.

El sitio es una SPA (React) que no renderiza el HTML en el servidor, por lo
que se necesita un navegador real (Playwright/Chromium) para obtener el
contenido, no basta con requests + BeautifulSoup.

Salida: un JSON por guía en output/<slug>.json
  {
    "icono": "https://.../icono.png" | null,
    "banner": "https://.../banner.jpg" | null,
    "rangos": ["1-20", "20-40", ...] // solo en guide-complet
    "misiones": [
      {
        "mision": "...", "zona": "...", "coordenadas": "[x,y]",
        "pnj": {"nombre": "...", "img": "https://..."} | null,
        "recursos": [{"nombre": "...", "cantidad": "×40", "img": "https://..."}],
        "donjon": {"nombre": "...", "link": "https://...", "img": "https://..."} | null,
        "rango": "1-20" | null // solo en guide-complet: a qué pestaña de nivel pertenece
      }, ...
    ]
  }
y un output/all_quests.json combinado {slug: {...}}.

Las URLs de imágenes quedan absolutas acá; download_images.py las descarga y
las reescribe a rutas locales antes de que match_links.py agregue los links.
"""

import json
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_URL = "https://duffus.fr"
OUTPUT_DIR = Path(__file__).parent / "output"

# Los 21 guías de Dofus individuales listadas en /guides
DOFUS_SLUGS = [
    "dofus-argente",
    "dofus-cawotte",
    "dokoko",
    "dofus-emeraude",
    "dofus-des-veilleurs",
    "dofus-pourpre",
    "domakuro",
    "dorigami",
    "dofus-turquoise",
    "dofus-des-glaces",
    "dofus-tachete",
    "dofus-abyssal",
    "dofus-ivoire",
    "dofus-ebene",
    "dofus-nebuleux",
    "dofus-vulbis",
    "dofus-forgelave",
    "dofus-du-cauchemar",
    "dom-de-pin",
    "dofus-sylvestre",
    "dofoozbz",
]

BONTA_SLUG = "alignement-bonta"

QUEST_CARD_SELECTOR = ".qb-card"
RANGE_PILL_SELECTOR = ".range-pill-label"

# Un solo round-trip por página: recorre las tarjetas de misión en el DOM y
# saca nombre, zona (chip sin coordenada), coordenada, PNJ y recursos.
EXTRACT_JS = """
() => Array.from(document.querySelectorAll('.qb-card')).map(card => {
  const nameEl = card.querySelector('.qb-title a');
  if (!nameEl) return null;
  const zoneEl = card.querySelector('.qb-chip:not(.qb-chip-pos)');
  const coordEl = card.querySelector('.qb-chip-pos');
  const name = nameEl.textContent.trim();
  if (!name) return null;

  const pnjImg = card.querySelector('.qb-pnj-wrap img');
  let pnj = null;
  if (pnjImg && pnjImg.src) {
    const file = decodeURIComponent(pnjImg.src.split('/').pop() || '').replace(/\\.[a-z]+$/i, '');
    pnj = { nombre: file, img: pnjImg.src };
  }

  const recursos = Array.from(card.querySelectorAll('.qb-res-item')).map(res => {
    const img = res.querySelector('img');
    const qty = res.querySelector('.qb-res-qty');
    if (!img) return null;
    return {
      nombre: img.alt || '',
      cantidad: qty ? qty.textContent.trim() : '',
      img: img.src,
    };
  }).filter(Boolean);

  const dungeonLink = card.querySelector('.qb-dungeons a');
  let donjon = null;
  if (dungeonLink) {
    const slug = (dungeonLink.getAttribute('href') || '').split('/').filter(Boolean).pop() || '';
    const nombre = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const dImg = dungeonLink.querySelector('img');
    donjon = {
      nombre,
      link: new URL(dungeonLink.getAttribute('href'), location.origin).href,
      img: dImg ? dImg.src : null,
    };
  }

  return {
    mision: name,
    zona: zoneEl ? zoneEl.textContent.trim() : null,
    coordenadas: coordEl ? coordEl.textContent.trim() : null,
    pnj,
    recursos,
    donjon,
  };
}).filter(Boolean)
"""

GUIDE_ASSETS_JS = """
() => {
  const icon = document.querySelector('img[alt^="Illustration"]') ||
               document.querySelector('img[src*="hero_guide"]');
  const banner = document.querySelector('.guide-template-bg img');
  return {
    icono: icon ? icon.src : null,
    banner: banner ? banner.src : null,
  };
}
"""


def extract_quest_entries(page, rango: str | None = None) -> list[dict]:
    page.wait_for_selector(QUEST_CARD_SELECTOR, timeout=15000)
    entries = page.evaluate(EXTRACT_JS)
    if rango is not None:
        for e in entries:
            e["rango"] = rango
    return entries


def extract_guide_assets(page) -> dict:
    try:
        page.wait_for_selector(
            'img[alt^="Illustration"], img[src*="hero_guide"]', timeout=5000
        )
    except Exception:
        pass  # algunas guías podrían no tener ícono; seguimos igual
    return page.evaluate(GUIDE_ASSETS_JS)


def dedupe(entries: list[dict]) -> list[dict]:
    """Conserva la primera aparición de cada misión (por nombre)."""
    seen: dict[str, dict] = {}
    for e in entries:
        seen.setdefault(e["mision"], e)
    return list(seen.values())


def scrape_simple_guide(page, slug: str) -> dict:
    url = f"{BASE_URL}/guide/{slug}"
    page.goto(url, wait_until="domcontentloaded")
    misiones = dedupe(extract_quest_entries(page))
    assets = extract_guide_assets(page)
    return {**assets, "misiones": misiones}


def scrape_guide_complet(page) -> dict:
    """El guide-complet divide las misiones en pestañas por rango de nivel
    (1-20, 20-40, ..., 180-190 y 200 repartido en 7 pestañas). Cada click
    reemplaza el contenido mostrado, así que hay que recorrer todas las
    pestañas y acumular. El ícono/banner no cambian entre pestañas."""
    url = f"{BASE_URL}/guide-complet"
    page.goto(url, wait_until="domcontentloaded")
    page.wait_for_selector(RANGE_PILL_SELECTOR, timeout=15000)

    assets = extract_guide_assets(page)

    pill_count = page.locator(RANGE_PILL_SELECTOR).count()
    all_entries: list[dict] = []
    rangos: list[str] = []

    for i in range(pill_count):
        pill = page.locator(RANGE_PILL_SELECTOR).nth(i)
        rango = pill.text_content().strip()
        rangos.append(rango)
        pill.click()
        page.wait_for_timeout(500)
        all_entries.extend(extract_quest_entries(page, rango=rango))

    return {**assets, "rangos": rangos, "misiones": dedupe(all_entries)}


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    combined: dict[str, dict] = {}

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
        ))

        print("Scrapeando guide-complet (niveles 1 a 200)...")
        combined["guide-complet"] = scrape_guide_complet(page)
        print(f"  -> {len(combined['guide-complet']['misiones'])} misiones")

        print("Scrapeando alignement-bonta...")
        combined[BONTA_SLUG] = scrape_simple_guide(page, BONTA_SLUG)
        print(f"  -> {len(combined[BONTA_SLUG]['misiones'])} misiones")

        for slug in DOFUS_SLUGS:
            print(f"Scrapeando {slug}...")
            data = scrape_simple_guide(page, slug)
            combined[slug] = data
            print(f"  -> {len(data['misiones'])} misiones")
            time.sleep(0.3)

        browser.close()

    for slug, data in combined.items():
        (OUTPUT_DIR / f"{slug}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    (OUTPUT_DIR / "all_quests.json").write_text(
        json.dumps(combined, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    total = sum(len(v["misiones"]) for v in combined.values())
    print(f"\nListo. {total} misiones (con zona, coordenadas, PNJ y recursos) guardadas en {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
