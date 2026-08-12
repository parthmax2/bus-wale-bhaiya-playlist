"""Build a static site into public/ for Vercel deployment.

Renders index.html once (baking in the track list) and copies static
assets, so the deployed site needs no Python server at request time —
Vercel serves everything from its CDN.
"""
import shutil
from pathlib import Path

from app import app, load_tracks
import json

ROOT = Path(__file__).parent
PUBLIC_DIR = ROOT / "public"


def build():
    if PUBLIC_DIR.exists():
        shutil.rmtree(PUBLIC_DIR)
    PUBLIC_DIR.mkdir()

    shutil.copytree(ROOT / "static", PUBLIC_DIR / "static")
    shutil.copy(ROOT / "static" / "favicon.ico", PUBLIC_DIR / "favicon.ico")

    with app.test_request_context():
        tracks = load_tracks()
        html = app.jinja_env.get_template("index.html").render(
            tracks_json=json.dumps(tracks, ensure_ascii=False)
        )

    (PUBLIC_DIR / "index.html").write_text(html, encoding="utf-8")
    print(f"Built {len(tracks)} tracks into {PUBLIC_DIR}")


if __name__ == "__main__":
    build()
