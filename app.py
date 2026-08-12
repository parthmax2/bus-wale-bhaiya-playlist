import json
import re
from pathlib import Path

from flask import Flask, render_template, url_for, send_from_directory

app = Flask(__name__, template_folder="template", static_folder="static")

TRACKS_DIR = Path(app.static_folder) / "audio" / "tracks"
SITE_URL = "https://bus-wale-bhaiya-playlist.vercel.app"


def load_tracks():
    tracks = []
    for path in sorted(TRACKS_DIR.glob("*.mp3")):
        title = re.sub(r"^\d+-?", "", path.stem).replace("-", " ")
        tracks.append({
            "title": title,
            "src": url_for("static", filename=f"audio/tracks/{path.name}"),
        })
    return tracks


@app.route("/")
def index():
    tracks = load_tracks()
    return render_template(
        "index.html",
        tracks=tracks,
        tracks_json=json.dumps(tracks, ensure_ascii=False),
        site_url=SITE_URL,
    )


@app.route("/about.html")
def about():
    return render_template("about.html")


@app.route("/favicon.ico")
def favicon():
    return send_from_directory(app.static_folder, "favicon.ico")


if __name__ == "__main__":
    app.run(debug=True)
