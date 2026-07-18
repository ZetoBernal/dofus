"""
Descarga y guarda localmente todas las imágenes referenciadas por
output/*.json (generado por scraper.py): PNJ que dan cada misión, íconos de
recursos/materiales, y el ícono + banner de cada guía.

Reescribe esos mismos JSON reemplazando las URLs remotas (duffus.fr,
supabase.co) por rutas locales /images/... para que la app no dependa de
hotlinkear imágenes de terceros.

Corre después de scraper.py y antes de match_links.py.
"""

import json
import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import unquote, urlsplit

import requests

OUTPUT_DIR = Path(__file__).parent / "output"
IMAGES_DIR = OUTPUT_DIR / "images"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; DuffusImageFetcher/1.0)"}
MAX_WORKERS = 12
# Un ícono/avatar/banner normal de duffus.fr pesa unos cientos de KB como
# mucho; si algo pesa más es casi seguro un asset de fondo pesado que se
# coló por el selector, no un ícono real (nos pasó con guide-complet:
# 8.8 MB). Mejor descartarlo que servir eso desde nuestro propio dominio.
MAX_BYTES = 1_500_000


def safe_filename(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^A-Za-z0-9_.-]+", "-", text)
    return text.strip("-") or "img"


def guess_ext(url: str) -> str:
    ext = Path(urlsplit(url).path).suffix
    return ext if ext else ".png"


def local_name_for_asset(url: str) -> str:
    last = unquote(Path(urlsplit(url).path).name)
    return safe_filename(last)


def download(url: str, dest: Path) -> bool:
    if dest.exists():
        return True
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        if len(resp.content) > MAX_BYTES:
            return False
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(resp.content)
        return True
    except requests.RequestException:
        return False


def collect_jobs(guides: dict[str, dict]) -> dict[str, tuple[str, Path]]:
    """url -> (kind, local_path). Dedupeado por url."""
    jobs: dict[str, tuple[str, Path]] = {}

    for slug, data in guides.items():
        if data.get("icono"):
            url = data["icono"]
            dest = IMAGES_DIR / "guides" / f"{slug}-icon{guess_ext(url)}"
            jobs[url] = ("icono", dest)
        if data.get("banner"):
            url = data["banner"]
            dest = IMAGES_DIR / "guides" / f"{slug}-banner{guess_ext(url)}"
            jobs[url] = ("banner", dest)

        for quest in data.get("misiones", []):
            pnj = quest.get("pnj")
            if pnj and pnj.get("img"):
                url = pnj["img"]
                dest = IMAGES_DIR / "pnj" / local_name_for_asset(url)
                jobs.setdefault(url, ("pnj", dest))
            for recurso in quest.get("recursos", []):
                url = recurso.get("img")
                if url:
                    dest = IMAGES_DIR / "recursos" / local_name_for_asset(url)
                    jobs.setdefault(url, ("recurso", dest))
            donjon = quest.get("donjon")
            if donjon and donjon.get("img"):
                url = donjon["img"]
                dest = IMAGES_DIR / "donjones" / local_name_for_asset(url)
                jobs.setdefault(url, ("donjon", dest))

    return jobs


def to_web_path(local_path: Path) -> str:
    return f"/images/{local_path.relative_to(IMAGES_DIR).as_posix()}"


def rewrite(guides: dict[str, dict], url_to_local: dict[str, str]) -> None:
    """Todo lo que no se haya podido localizar (descartado por tamaño o
    caído por red) se limpia en vez de dejar una URL remota colgando:
    la app nunca debe hotlinkear imágenes de terceros."""
    for data in guides.values():
        if data.get("icono"):
            data["icono"] = url_to_local.get(data["icono"])
        if data.get("banner"):
            data["banner"] = url_to_local.get(data["banner"])
        for quest in data.get("misiones", []):
            pnj = quest.get("pnj")
            if pnj:
                local = url_to_local.get(pnj.get("img"))
                quest["pnj"] = {"nombre": pnj["nombre"], "img": local} if local else None
            quest["recursos"] = [
                {**r, "img": url_to_local[r["img"]]}
                for r in quest.get("recursos", [])
                if r.get("img") in url_to_local
            ]
            donjon = quest.get("donjon")
            if donjon:
                quest["donjon"] = {**donjon, "img": url_to_local.get(donjon.get("img"))}


def main():
    guide_files = [
        f for f in OUTPUT_DIR.glob("*.json") if f.name != "all_quests.json"
    ]
    if not guide_files:
        raise SystemExit(f"No hay archivos .json en {OUTPUT_DIR}. Corré primero scraper.py")

    guides = {f.stem: json.loads(f.read_text(encoding="utf-8")) for f in guide_files}

    jobs = collect_jobs(guides)
    print(f"{len(jobs)} imágenes únicas a descargar...")

    url_to_local: dict[str, str] = {}
    failed = 0
    done = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(download, url, dest): (url, dest) for url, (_kind, dest) in jobs.items()
        }
        for fut in as_completed(futures):
            url, dest = futures[fut]
            ok = fut.result()
            done += 1
            if done % 100 == 0:
                print(f"  {done}/{len(jobs)}...")
            if ok:
                url_to_local[url] = to_web_path(dest)
            else:
                failed += 1

    print(f"Descargadas {len(url_to_local)}/{len(jobs)} imágenes ({failed} descartadas por tamaño o error de red).")

    rewrite(guides, url_to_local)

    for slug, data in guides.items():
        (OUTPUT_DIR / f"{slug}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    (OUTPUT_DIR / "all_quests.json").write_text(
        json.dumps(guides, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"Listo. Imágenes en {IMAGES_DIR}/, JSON reescritos con rutas locales.")


if __name__ == "__main__":
    main()
