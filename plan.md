# Plan: GitHub Badge Click Animation

## Goal
When the user clicks the bottom-right GitHub avatar badge, instead of jumping
straight to the profile, play a short "pop and travel" animation: the avatar
detaches from its corner, flies to the center of the screen, forms into a
GitHub-branded reveal card (dark theme, Octicon mark, profile name), then
opens the GitHub profile.

## UX Flow
1. **Click** — user clicks the badge in the bottom-right corner.
2. **Pop** — the badge briefly squashes/scales at its origin spot (tactile
   click feedback).
3. **Travel** — a cloned avatar detaches and flies from the corner to the
   center of the viewport, scaling up, while a dimmed backdrop fades in
   behind it.
4. **Form** — at center, the avatar settles into a rounded GitHub-style card:
   dark background (`#0d1117`), the GitHub Octicon mark, the avatar, and the
   handle (`@parthmax2`) fade/scale in together.
5. **Open** — after a brief hold, the card fades out and the GitHub profile
   opens in a new tab.

Total animation time: ~1.1s, so it reads as a flourish, not a delay.

## Technical Approach
- **Popup-blocker safe navigation**: browsers only allow `window.open` on a
  direct user gesture. So on click we immediately call
  `window.open('about:blank', '_blank')` to reserve the tab, keep a
  reference, run the animation on the *current* page, and once the animation
  finishes, set `newTab.location.href = profileUrl`. This avoids being
  blocked while still letting the animation play first.
- **Overlay markup**: a hidden `#gh-reveal` overlay (backdrop + card) lives
  in `index.html`, reused on every click rather than building DOM nodes in
  JS.
- **Animation**: pure CSS `@keyframes` triggered by toggling classes
  (`.is-active`) from `main.js`, timed with `setTimeout`/
  `transitionend`/`animationend` — no animation libraries, keeps the project
  dependency-free.
- **Assets**: GitHub's Octicon "mark-github" glyph inlined as SVG (public,
  MIT-licensed icon set) — no external request needed.
- **Accessibility**: overlay gets `aria-hidden` toggling and click can still
  be triggered via keyboard (button already focusable); middle-click / open
  in new tab still works since the real `href` stays on the anchor and JS
  only intercepts default left-click behavior.

## Visual Design
- Backdrop: `rgba(13,17,23,0.72)` (GitHub dark) with `backdrop-filter: blur`.
- Card: `#0d1117` background, `1px solid #30363d` border, rounded 20px,
  soft shadow, GitHub mark in white at top, avatar (56px circle) below it,
  `@parthmax2` handle in GitHub's monospace-ish system font.
- Motion: origin badge scales down to 0 opacity as the flying clone appears
  at its exact screen position (so the transition looks seamless), then
  clone flies + scales to center over ~450ms with an ease-out curve, card
  contents fade/scale in with a slight stagger, everything fades out over
  ~200ms before navigation.

## Files Touched
- `template/index.html` — add the reveal overlay markup (backdrop, card,
  inline SVG mark, avatar clone target).
- `static/style.css` — add `.gh-reveal`, `.gh-reveal-card`, keyframes for
  fly/scale/fade, reduced-motion fallback.
- `static/main.js` — click handler: intercept click, open blank tab, run
  animation sequence, redirect the reserved tab, cleanup overlay state.

## Edge Cases
- Rapid double-click: ignore re-trigger while animation is already running
  (guard flag).
- `prefers-reduced-motion`: skip the flight/scale animation, do a simple
  fade, then navigate — respects user accessibility settings.
- Popup blocked anyway (e.g. some strict settings): fallback to normal
  navigation via the anchor's `href` after animation, same tab, no error
  shown to user.
