"""Build a static site into public/ for Vercel deployment.

Renders index.html once (baking in the track list) and copies static
assets, so the deployed site needs no Python server at request time —
Vercel serves everything from its CDN.
"""
import shutil
from datetime import date
from pathlib import Path

from app import app, load_tracks, SITE_URL
import json

ROOT = Path(__file__).parent
PUBLIC_DIR = ROOT / "public"


def build():
    if PUBLIC_DIR.exists():
        shutil.rmtree(PUBLIC_DIR)
    PUBLIC_DIR.mkdir()

    shutil.copytree(ROOT / "static", PUBLIC_DIR / "static")
    shutil.copy(ROOT / "static" / "favicon.ico", PUBLIC_DIR / "favicon.ico")
    shutil.copy(ROOT / "static" / "robots.txt", PUBLIC_DIR / "robots.txt")

    with app.test_request_context():
        tracks = load_tracks()
        html = app.jinja_env.get_template("index.html").render(
            tracks=tracks,
            tracks_json=json.dumps(tracks, ensure_ascii=False),
            site_url=SITE_URL,
        )

    (PUBLIC_DIR / "index.html").write_text(html, encoding="utf-8")

    with app.test_request_context():
        about_html = app.jinja_env.get_template("about.html").render()
    (PUBLIC_DIR / "about.html").write_text(about_html, encoding="utf-8")

    with app.test_request_context():
        about_tartendu_html = app.jinja_env.get_template("about-tartendu.html").render()
    (PUBLIC_DIR / "about-tartendu.html").write_text(about_tartendu_html, encoding="utf-8")

    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{SITE_URL}/</loc>
    <lastmod>{date.today().isoformat()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
"""
    (PUBLIC_DIR / "sitemap.xml").write_text(sitemap, encoding="utf-8")

    print(f"Built {len(tracks)} tracks into {PUBLIC_DIR}")


if __name__ == "__main__":
    build()
