# Tasks: GitHub Badge Click Animation

- [ ] Add reveal overlay markup to `template/index.html`
  - [ ] Backdrop element (`#gh-reveal`)
  - [ ] Card element with GitHub Octicon mark (inline SVG)
  - [ ] Avatar `<img>` clone target inside the card
  - [ ] Handle text (`@parthmax2`)
- [ ] Add CSS to `static/style.css`
  - [ ] `.gh-reveal` backdrop styles + fade transition
  - [ ] `.gh-reveal-card` styles (dark GitHub theme, border, shadow)
  - [ ] Keyframes: pop (badge), fly-to-center, form-card, fade-out
  - [ ] `prefers-reduced-motion` fallback (simple fade only)
- [ ] Wire up `static/main.js`
  - [ ] Intercept badge click (`preventDefault`)
  - [ ] Guard against double-trigger while animating
  - [ ] Reserve new tab via `window.open('about:blank')` on the gesture
  - [ ] Position/scale the flying clone from the badge's real screen rect
  - [ ] Sequence classes for fly -> form -> hold -> fade
  - [ ] Redirect reserved tab to profile URL after sequence; fallback to
        same-tab `location.href` if `window.open` returned null
  - [ ] Reset overlay state after navigation so it can replay next time
- [ ] Manual test in browser (Playwright)
  - [ ] Click badge, confirm animation plays smoothly
  - [ ] Confirm new tab opens to `https://github.com/parthmax2`
  - [ ] Confirm rapid double-click doesn't break the sequence
  - [ ] Confirm reduced-motion path still navigates correctly
