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
│   ├── portfolio.css       # Work grid (category colours, screenshot cards, hover zoom)
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

## Changelog

### 2026-07 — Copy, performance & assets pass
- **Latvian copy proofread.** Fixed ~45 corrupted / space-split words across `index.html` and all three `preview-*.html` pages (e.g. `optimāzācija → optimizācija`, `Raks tīt → Rakstīt`, `salōns → salons`, `Manikjurs → Manikīrs`, `Krasēšana → Krāsošana`).
- **Portfolio de-iframed.** The 6 live `<iframe>` embeds (each loading a full external site on page load) were replaced with static, optimised **WebP screenshots** in `assets/portfolio/` (~13–42 KB each). Cards use `object-fit: cover` + a hover zoom; clicking still opens the live site. Big drop in homepage weight and no dependency on third-party sites staying up.
- **Image optimisation.** `favicon.png` 440 KB → 25 KB (180×180); `logo.png` 168 KB → 50 KB (512×512, matching the schema logo dims). `og:image` dimensions updated to 512×512.
- **Housekeeping.** Removed the stale `/preview` entry from `sitemap.xml`; repointed dead `/preview` back-links in the preview pages to `/#work`.

> Regenerating portfolio screenshots: capture each live URL with headless Chrome
> (`chrome --headless=new --no-sandbox --window-size=1440,900 --virtual-time-budget=9000 --screenshot=out.png <url>`),
> then `ffmpeg -i out.png -vf scale=1200:-1 -c:v libwebp -quality 80 out.webp`.
