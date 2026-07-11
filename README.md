# Vdigital

Professional website agency for Latvian businesses. Standalone static site with live portfolio previews, pricing packages, contact form, dark/light theme, cookie consent and GA4 analytics.

**Live:** [vdigital.lv](https://vdigital.lv) · Deployed via Vercel (auto-deploy on push to `main`)

---

## Project Structure

```
/
├── index.html              # Main page
├── kapec.html              # Article page — "Why your business needs a website"
├── preview-restoran.html   # Industry mock-up — restaurant / café
├── preview-salons.html     # Industry mock-up — beauty salon / barbershop
├── preview-fitness.html    # Industry mock-up — fitness / sports club
├── favicon.png             # 180×180, optimised
├── logo.png                # 512×512, optimised — OG / social + schema logo
├── og-image.svg
├── robots.txt
├── sitemap.xml
├── vercel.json             # Vercel routing config
│
├── assets/
│   └── portfolio/          # Static WebP screenshots of live portfolio sites
│
├── css/
│   ├── base.css            # CSS variables, reset, typography, dark/light tokens
│   ├── nav.css             # Navbar + mobile menu
│   ├── hero.css            # Hero section (particles, spotlight, glitch, scanline)
│   ├── services.css        # Services grid (3D tilt, border sweep)
│   ├── packages.css        # Pricing cards (per-card spotlight, shimmer streak)
│   ├── portfolio.css       # Work grid (category colours, screenshot cards, scroll-on-hover pan)
│   ├── trust.css           # "Kāpēc Vdigital" trust / social-proof cards
│   ├── cta.css             # CTA banner (animated gradient text, floating orbs) + cookie banner
│   ├── contact.css         # Contact form + WhatsApp link
│   ├── footer.css          # Footer
│   ├── utilities.css       # Shared utilities, buttons, badges, scroll-to-top, animations
│   ├── responsive.css      # All media queries
│   ├── preview.css         # Styles for the industry mock-up pages
│   └── kapec-mais-lapa.css # Page-specific styles for the article page
│
└── js/
    ├── theme.js            # Dark/light mode toggle + persistence
    ├── nav.js              # Mobile menu, scroll-hide nav
    ├── particles.js        # Hero particle canvas
    ├── hero.js             # Spotlight, typewriter, stats counter
    ├── animations.js       # Scroll fade-in, services tilt, packages spotlight, magnetic hover
    ├── portfolio.js        # Portfolio category filter
    └── contact.js          # Contact form submission handling
```

---

## Rules — How to Keep It Clean

### CSS
- **One file per section.** Never add styles to a file that doesn't match its section name.
- `base.css` is for variables and resets only — no component styles.
- `utilities.css` is for shared, reusable classes (buttons, badges, section headers). If a style is used in more than one section, it goes here.
- `responsive.css` is the single source of all media queries. Never write `@media` rules inside section files.
- Dark/light mode overrides (`[data-theme="light"]`) live in the same file as the component they override — directly below the base rule.

### JavaScript
- **One file per concern.** Don't add unrelated logic to an existing file — create a new one and add a `<script>` tag in `index.html`.
- Touch device detection is handled once in `animations.js` via `window.matchMedia('(hover:none)')`. Reuse that pattern — don't re-detect in other files.
- Never use `document.write` or inline event handlers in HTML.
- All scripts are loaded at the bottom of `<body>` — keep it that way.

### HTML
- No inline `<style>` blocks. All CSS goes in the `css/` folder.
- No inline `onclick` or other event attributes. All event logic goes in JS files.
- `index.html` loads all 11 CSS files and all 7 JS files. `kapec-mais-lapa.html` loads only the shared CSS it needs + its own page CSS + `theme.js` + `nav.js`.
- When adding a new page, follow the same pattern: shared CSS (base, utilities, nav, footer, responsive) + a new page-specific CSS file.

### Git
- Branch from `main` using `feature/`, `refactor/`, or `fix/` prefixes.
- Squash merge PRs into `main` to keep history clean.
- PR titles should follow: `Type: Short description (#issue)`
- Delete the branch after merging.

---

## Tech Stack

| | |
|---|---|
| HTML/CSS/JS | Vanilla — zero frameworks, zero build step |
| Fonts | Inter + Space Grotesk via Google Fonts |
| Icons | Inline SVG + emoji |
| Analytics | Google Analytics 4 (consent-gated) |
| Forms | Formspree |
| Hosting | Vercel |
| Theme | Dark default, light toggle, persisted in `localStorage` |
| Portfolio | Static WebP screenshots (`assets/portfolio/`), captured with headless Chrome |

---

## Roadmap — next up

Not yet done, roughly in priority order:

**Design / UX**
- [ ] **Real client testimonials** — the honest "Kāpēc Vdigital" trust section is live, but there are still no client quotes. When real quotes exist (name + business + text), add a testimonials strip. Not fabricating endorsements for a live business.
- [x] ~~Richer portfolio thumbnails~~ — done: full-page screenshots with a slow scroll-on-hover pan reveal.
- [x] ~~Hero mock replacement~~ — done: hero card now cross-fades real portfolio screenshots with a matching URL.
- [x] ~~Spacing & typography audit~~ — done (first pass): tighter heading tracking/line-height and section rhythm. Revisit if a bolder scale is wanted.

**Content / assets**
- [ ] **Proper OG image** — `og:image` currently points at the square `logo.png`; design a real 1200×630 share image (an `og-image.svg` stub already exists but is unused).
- [ ] **Refresh portfolio screenshots periodically** as the live client sites change (regen command is in the Changelog note below — now via `puppeteer-core`, full-page).

**Decisions / loose ends**
- [ ] **Surface the `preview-*` pages** — the 3 industry mock-ups (restaurant / salon / fitness) are in the sitemap but no longer linked from the main nav. Decide whether to link them (e.g. a "Piemēri" entry or from the portfolio) or keep them purely as SEO landing pages.
- [ ] **Cache headers** — consider `Cache-Control` for `/assets/**` and images via `vercel.json` for repeat-visit performance.

---

## Changelog

### 2026-07 — Design pass 2 (screenshots, hero, trust, type)
- **Portfolio depth.** Recaptured all 6 sites as **full-page** screenshots (via `puppeteer-core` driving the installed Chrome, clipped to 2200 px) and the cards now **pan down the whole page on hover** (3.2 s) instead of a static zoom. Still ~288 KB for all six.
- **Hero rotator.** The fake skeleton preview-card (with invented 98/100/94 metrics) is now a browser mock that **cross-fades through the real portfolio screenshots** every 3.4 s with a matching URL bar and a "90+ PageSpeed" badge.
- **Trust / social-proof section.** New honest **"Kāpēc Vdigital"** section (6 truthful value cards — clear pricing, fast start, no lock-in, all-included, local support, we-maintain-it). No fabricated testimonials.
- **Typography.** Tighter heading tracking (`-0.02em`) and line-height (`1.14`), tuned section-header rhythm.
- All motion additions honour `prefers-reduced-motion`.

### 2026-07 — Mobile overflow fix
- **Fixed the "zoom out" on phones.** The featured pricing card's animated shimmer streak (`::before`, `left: 150%`) overflowed the viewport; because the card needs `overflow: visible` for its floating badge, the overflow bubbled up to `<html>` (only `body` was clipping horizontally), so mobile browsers shrank the whole page to fit ~735px. Added `overflow-x: hidden` to `html` in `base.css` — page now stays exactly at device width.

### 2026-07 — Design & UX pass
- **Portfolio category filter.** Added the filter bar (Visi / E-komercija / Skaistums / Pakalpojumi / Radītāji) above the work grid and wired `portfolio.js` to filter cards by `data-category` (the CSS + data attributes already existed but the buttons/JS were never built — `portfolio.js` was leftover iframe-scaling code).
- **Scroll-spy navigation.** The nav link for the section currently in view is highlighted with an accent underline, via an `IntersectionObserver` in `nav.js`.
- **Accessibility.** Honour `prefers-reduced-motion` (particles, typewriter, counters, marquee and transitions all stand down) and added visible `:focus-visible` outlines for keyboard users.

### 2026-07 — Copy, performance & assets pass
- **Latvian copy proofread.** Fixed ~45 corrupted / space-split words across `index.html` and all three `preview-*.html` pages (e.g. `optimāzācija → optimizācija`, `Raks tīt → Rakstīt`, `salōns → salons`, `Manikjurs → Manikīrs`, `Krasēšana → Krāsošana`).
- **Portfolio de-iframed.** The 6 live `<iframe>` embeds (each loading a full external site on page load) were replaced with static, optimised **WebP screenshots** in `assets/portfolio/` (~13–42 KB each). Cards use `object-fit: cover` + a hover zoom; clicking still opens the live site. Big drop in homepage weight and no dependency on third-party sites staying up.
- **Image optimisation.** `favicon.png` 440 KB → 25 KB (180×180); `logo.png` 168 KB → 50 KB (512×512, matching the schema logo dims). `og:image` dimensions updated to 512×512.
- **Housekeeping.** Removed the stale `/preview` entry from `sitemap.xml`; repointed dead `/preview` back-links in the preview pages to `/#work`.

> Regenerating portfolio screenshots (full-page): drive the installed Chrome with
> `puppeteer-core` at a 1440×900 viewport, `page.screenshot({ clip: { x:0, y:0, width:1440, height:2200 } })`,
> then `ffmpeg -i out.png -vf scale=1200:-1 -c:v libwebp -quality 78 out.webp`.
> The same six files feed both the portfolio cards and the hero rotator.
