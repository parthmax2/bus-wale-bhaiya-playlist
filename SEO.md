# SEO Plan — बस वाले भइया Playlist

**Live URL:** https://bus-wale-bhaiya-playlist.vercel.app/
**Niche:** Nostalgic Bollywood-song playlists associated with Indian bus
drivers / conductors, barbershops ("salon"), and similar meme-adjacent
retro-audio trends currently popular on YouTube/Instagram/Reddit.

## 1. Target keywords

| Tier | Keyword | Intent |
|---|---|---|
| Primary | bus wale bhaiya playlist | branded, exact-match to site name |
| Primary | bus wale playlist | generic trend term |
| Secondary | bus driver playlist | generic trend term |
| Secondary | bus wala playlist | spelling variant |
| Long-tail | raju mistri bus wale playlist | specific meme/creator variant |
| Long-tail | delux salon bus wala playlist | specific meme/creator variant |
| Long-tail | old bus songs playlist | descriptive/generic |
| Long-tail | 90s bus gaane playlist | descriptive/generic, Hinglish |
| Long-tail | bus mein bajne wala gana | descriptive, Hindi phrasing |
| Long-tail | purane gaane bus driver | descriptive, Hindi phrasing |

Strategy: **one strong homepage** targeting the Tier-1/Tier-2 terms with
real, crawlable content, plus **short mention sections** for the long-tail
creator-specific terms (raju mistri, delux salon) so the page is relevant
without diluting focus. Dedicated sub-pages for those terms are a phase-2
option (see §7) — only worth it once we see the homepage actually gets
crawled and search-console data tells us which term has real demand.

## 2. Why the site currently ranks for nothing

1. **No crawlable text.** All 32 track titles only exist inside a
   `<script type="application/json">` blob ([template/index.html:117](template/index.html#L117))
   that JS reads to build the player. Search engines don't index JSON
   script content as page text.
2. **No metadata.** No `<meta description>`, no Open Graph/Twitter tags,
   no canonical URL — so search results and social shares show blank/
   generic previews.
3. **No structured data.** Nothing tells Google "this is a music
   playlist" — so it can't offer rich results (track list, playlist
   card) even if it does crawl the page.
4. **No crawl infrastructure.** No `robots.txt`, no `sitemap.xml`.
5. **Images have no alt text** — `bus.jpeg`/`driver.jpeg` are pure
   background/decorative images with no descriptive text a crawler (or
   image search) can use.
6. **Generic title.** `<title>बस वाले भइया</title>` matches the brand but
   none of the actual search terms people type.

None of this is a speed/hosting problem — the site is already fast,
static, and CDN-hosted (see prior work on the Vercel migration). This is
purely an on-page content/metadata gap.

## 3. On-page changes (homepage)

- **`<title>`**: `बस वाले भइया Playlist – Bus Wale Bhaiya, Bus Driver & Salon Gaane`
  (keeps the Hindi brand name front and center, folds in the English
  search terms naturally).
- **`<meta name="description">`**: one or two sentences mentioning the
  playlist concept, bus wale bhaiya, bus driver playlist, salon songs,
  and that it streams free in-browser.
- **Visible intro paragraph** under the title (real HTML, not just the
  stylized letter-animated `<h1>`) — a couple of sentences naturally
  containing: bus wale playlist, bus driver playlist, bus wale bhaiya
  playlist, raju mistri style, delux salon bus wala playlist. Written as
  normal readable copy for a human first, not keyword-stuffed.
- **Full tracklist as real HTML** — render the same 32 tracks Jinja
  already has in `load_tracks()` ([app.py](app.py)) as a plain, visible
  `<ol>`/`<ul>` list (can be visually secondary/below the fold, styled
  compactly) *in addition to* the JS-driven interactive player. This is
  the single highest-value change: it gives Google 32 real song titles
  to index and rank on, instead of zero.
- **Image `alt` text**: descriptive alt text on `bus.jpeg` and
  `driver.jpeg` mentioning the bus/driver playlist concept naturally.
- **`lang` handling**: keep `lang="hi"` on `<html>` since the visible
  title/content is primarily Hindi/Devanagari, but the English keyword
  copy (title, meta, tracklist intro) still gets indexed fine — Google
  doesn't require a single-language page.

## 4. `<head>` metadata additions

- `<link rel="canonical" href="https://bus-wale-bhaiya-playlist.vercel.app/">`
- Open Graph: `og:title`, `og:description`, `og:type=website`,
  `og:url`, `og:image` (use `bus.jpeg` — this is what shows up when the
  link is shared on WhatsApp/Instagram/Twitter, which matters a lot for
  a trend-driven page people share directly).
- Twitter Card: `twitter:card=summary_large_image`, `twitter:title`,
  `twitter:description`, `twitter:image`.
- `<meta name="robots" content="index, follow">` (explicit, though it's
  the default).

## 5. Structured data (JSON-LD)

Add a `schema.org` `MusicPlaylist` block listing all 32 tracks as
`MusicRecording` entries with `name` and `position`. This is what makes
the page eligible for richer presentation in search results (and is a
strong topical signal reinforcing "this page is a playlist").

## 6. Crawl infrastructure

- **`robots.txt`** at the site root — allow all crawlers, point to the
  sitemap.
- **`sitemap.xml`** at the site root — single-URL sitemap (the homepage)
  with `lastmod`. `build.py` will generate this automatically at build
  time so it never goes stale.
- Both need to be emitted into `public/` (site root), not
  `public/static/`, since crawlers expect them at the domain root.

## 7. Phase 2 (optional, content-heavy — needs your input before doing)

The long-tail creator-specific terms ("raju mistri bus wale playlist",
"delux salon bus wala playlist") represent distinct search intents from
the core "bus wale bhaiya" brand. A single passing mention in the intro
paragraph may not be enough to rank *for those specific phrases*
individually. If they're worth chasing:

- Add short dedicated on-page sections (anchored, e.g. `#raju-mistri`,
  `#delux-salon`) each with a couple of genuine sentences — not
  duplicate/spun content, actual distinct copy.
- Or, if traffic data later justifies it, separate landing pages per
  term, each linking back to the main player.

This is deliberately **not** in the initial task list — it's copywriting
as much as dev work, and doing it before confirming search demand risks
wasted effort. Revisit after checking Google Search Console data a few
weeks post-launch.

## 8. Off-page (not implementable by me, but worth knowing)

- Backlinks matter a lot for a brand-new domain with zero authority.
  Sharing the link in relevant WhatsApp groups/Reddit/Instagram (where
  this trend already lives) will do more for early ranking than any
  on-page tweak.
- Submitting the URL directly to Google Search Console (manual "request
  indexing") after launch speeds up the first crawl significantly rather
  than waiting for organic discovery.

## 9. Files touched

- `template/index.html` — title, meta tags, JSON-LD, visible tracklist,
  alt text, intro copy.
- `app.py` / `build.py` — no logic change needed for tracklist (data
  already exists via `load_tracks()`), but `build.py` gains sitemap
  generation.
- New: `static/robots.txt` → copied to `public/robots.txt` by
  `build.py` (root-level, not under `/static/`).
- New: `public/sitemap.xml` — generated by `build.py` at build time.
