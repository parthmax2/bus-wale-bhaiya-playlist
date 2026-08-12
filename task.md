# Tasks: SEO

See [SEO.md](SEO.md) for the full plan/reasoning behind each item.

- [ ] `<head>` metadata in `template/index.html`
  - [ ] New `<title>` with target keywords
  - [ ] `<meta name="description">`
  - [ ] `<link rel="canonical">`
  - [ ] Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`)
  - [ ] Twitter Card tags
  - [ ] `<meta name="robots" content="index, follow">`
- [ ] Visible, crawlable content in `template/index.html`
  - [ ] Intro paragraph under the title mentioning target keyword variants naturally
  - [ ] Full 32-track list rendered as real HTML (not just inside the JSON script tag)
  - [ ] Descriptive `alt` text on `bus.jpeg` and `driver.jpeg`
- [ ] Structured data
  - [ ] `MusicPlaylist` JSON-LD block listing all tracks
- [ ] Crawl infrastructure
  - [ ] `static/robots.txt` (allow all, reference sitemap)
  - [ ] `build.py`: copy `robots.txt` to `public/` root
  - [ ] `build.py`: generate `public/sitemap.xml` with homepage + lastmod
- [ ] Verification
  - [ ] Rebuild (`python build.py`) and confirm `public/robots.txt` and
        `public/sitemap.xml` exist at root (not under `/static/`)
  - [ ] View page source and confirm tracklist text + meta tags are present
        in raw HTML (not just JS-rendered)
  - [ ] Validate JSON-LD (no syntax errors)
  - [ ] Note: redeploy to Vercel required before any of this affects the
        live site or gets crawled

## Deferred (phase 2 — not started, needs your go-ahead)

- [ ] Dedicated sections/pages for "raju mistri bus wale playlist" and
      "delux salon bus wala playlist" — see SEO.md §7
- [ ] Submit URL to Google Search Console after redeploy
