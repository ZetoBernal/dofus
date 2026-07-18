"""
Resuelve, para cada nombre de misión ya scrapeado de duffus.fr (carpeta
output/), el enlace correspondiente en dofuspourlesnoobs.com.

Estrategia: el sitio es estático y cada ficha tiene el nombre exacto de la
misión en <title> (con entidades HTML tipo &eacute; para los acentos), así
que en vez de adivinar URLs:
  1. Se descarga su sitemap.xml completo (~2480 páginas: misiones, monstruos,
     noticias, etc.)
  2. Se lee el <title> de cada página (streaming, cortando la descarga en
     cuanto aparece </title> para no bajar la página entera).
  3. Se normalizan nombres de misión y títulos (sin acentos, minúsculas, sin
     puntuación) y se cruzan.
  4. Si no hay match exacto se intenta un match difuso; si tampoco hay,
     se deja un link de búsqueda en Google restringido al sitio, para que
     se pueda revisar a mano.

Salida: output/with_links/<slug>.json con
  {"icono": ..., "banner": ..., "misiones": [{"mision": ..., ..., "link": ...}, ...]}
y output/with_links/_no_encontrados.json con las misiones sin match exacto.
"""

import html
import json
import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from difflib import get_close_matches
from pathlib import Path
from urllib.parse import quote

import requests

SITEMAP_URL = "https://www.dofuspourlesnoobs.com/sitemap.xml"
OUTPUT_DIR = Path(__file__).parent / "output"
LINKS_DIR = OUTPUT_DIR / "with_links"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; DuffusQuestLinker/1.0)"}
MAX_WORKERS = 12
FUZZY_CUTOFF = 0.88


def normalize(text: str) -> str:
    text = html.unescape(text)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def fetch_sitemap_urls() -> list[str]:
    resp = requests.get(SITEMAP_URL, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return re.findall(r"<loc>([^<]+)</loc>", resp.text)


def fetch_title(url: str) -> tuple[str, str | None]:
    try:
        with requests.get(url, headers=HEADERS, timeout=15, stream=True) as r:
            buf = ""
            for chunk in r.iter_content(chunk_size=1024, decode_unicode=False):
                buf += chunk.decode("utf-8", errors="ignore")
                m = re.search(r"<title[^>]*>(.*?)</title>", buf, re.IGNORECASE | re.DOTALL)
                if m:
                    return url, html.unescape(m.group(1)).strip()
                if len(buf) > 8192:
                    break
    except requests.RequestException:
        pass
    return url, None


def build_title_index() -> dict[str, str]:
    """normalized title -> url"""
    urls = fetch_sitemap_urls()
    print(f"Sitemap: {len(urls)} páginas. Descargando títulos...")
    index: dict[str, str] = {}
    done = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(fetch_title, u) for u in urls]
        for fut in as_completed(futures):
            url, title = fut.result()
            done += 1
            if done % 250 == 0:
                print(f"  {done}/{len(urls)} páginas leídas...")
            if title:
                norm = normalize(title)
                if norm and norm not in index:
                    index[norm] = url
    print(f"Índice de títulos construido: {len(index)} entradas únicas.")
    return index


def google_fallback_link(quest_name: str) -> str:
    query = f'site:dofuspourlesnoobs.com "{quest_name}"'
    return f"https://www.google.com/search?q={quote(query)}"


QUOTED_NAME_RE = re.compile(r"['‘’]([^'‘’]{3,})['‘’]")


def lookup(name: str, title_index: dict[str, str], normalized_titles: list[str]) -> str | None:
    norm = normalize(name)
    if norm in title_index:
        return title_index[norm]
    close = get_close_matches(norm, normalized_titles, n=1, cutoff=FUZZY_CUTOFF)
    if close:
        return title_index[close[0]]
    return None


def resolve_links(quest_names: set[str], title_index: dict[str, str]) -> tuple[dict[str, str], list[str]]:
    """Muchas entradas de duffus.fr no son nombres de misión sino instrucciones
    de progreso ("Lancez 'Nombre real' jusqu'au donjon.") que citan el nombre
    real entre comillas. Si el nombre completo no matchea, se intenta con
    cada fragmento citado."""
    normalized_titles = list(title_index.keys())
    resolved: dict[str, str] = {}
    unmatched: list[str] = []

    for name in quest_names:
        link = lookup(name, title_index, normalized_titles)
        if link is None:
            for quoted in QUOTED_NAME_RE.findall(name):
                link = lookup(quoted.strip(), title_index, normalized_titles)
                if link:
                    break
        if link:
            resolved[name] = link
        else:
            resolved[name] = google_fallback_link(name)
            unmatched.append(name)

    print(f"Resueltas {len(quest_names) - len(unmatched)}/{len(quest_names)} misiones "
          f"contra dofuspourlesnoobs.com ({len(unmatched)} sin match, con link de Google de respaldo).")
    return resolved, unmatched


def main():
    guide_files = [
        f for f in OUTPUT_DIR.glob("*.json")
        if f.name not in ("all_quests.json",) and f.parent == OUTPUT_DIR
    ]
    if not guide_files:
        raise SystemExit(f"No hay archivos .json en {OUTPUT_DIR}. Corré primero scraper.py")

    guides: dict[str, dict] = {
        f.stem: json.loads(f.read_text(encoding="utf-8")) for f in guide_files
    }

    all_names = set()
    for data in guides.values():
        all_names.update(e["mision"] for e in data["misiones"])
    total = sum(len(v["misiones"]) for v in guides.values())
    print(f"{len(all_names)} nombres de misión únicos a resolver (de {total} totales).")

    title_index = build_title_index()
    resolved, unmatched = resolve_links(all_names, title_index)

    def with_links(data: dict) -> dict:
        return {
            **{k: v for k, v in data.items() if k != "misiones"},
            "misiones": [{**e, "link": resolved[e["mision"]]} for e in data["misiones"]],
        }

    LINKS_DIR.mkdir(exist_ok=True)
    for slug, data in guides.items():
        (LINKS_DIR / f"{slug}.json").write_text(
            json.dumps(with_links(data), ensure_ascii=False, indent=2), encoding="utf-8"
        )

    all_payload = {slug: with_links(data) for slug, data in guides.items()}
    (LINKS_DIR / "all_quests_links.json").write_text(
        json.dumps(all_payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (LINKS_DIR / "_no_encontrados.json").write_text(
        json.dumps(sorted(unmatched), ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"\nListo. Archivos con links guardados en {LINKS_DIR}/")


if __name__ == "__main__":
    main()
