# Vdigital

Professional website agency for Latvian businesses. Standalone static site with live portfolio previews, pricing packages, contact form, dark/light theme, cookie consent and GA4 analytics.

**Live:** [vdigital.lv](https://vdigital.lv) · Deployed via Vercel (auto-deploy on push to `main`)

---

## Project Structure

```
/
├── index.html              # Main page
├── kapec-mais-lapa.html    # Article page — "Why your business needs a website"
├── favicon.png
├── logo.png
├── og-image.svg
├── robots.txt
├── sitemap.xml
├── vercel.json             # Vercel routing config
│
├── css/
│   ├── base.css            # CSS variables, reset, typography, dark/light tokens
│   ├── nav.css             # Navbar + mobile menu
│   ├── hero.css            # Hero section (particles, spotlight, glitch, scanline)
│   ├── services.css        # Services grid (3D tilt, border sweep)
│   ├── packages.css        # Pricing cards (per-card spotlight, shimmer streak)
│   ├── portfolio.css       # Work grid (category colours, magnetic hover)
│   ├── cta.css             # CTA banner (animated gradient text, floating orbs) + cookie banner
│   ├── contact.css         # Contact form + WhatsApp link
│   ├── footer.css          # Footer
│   ├── utilities.css       # Shared utilities, buttons, badges, scroll-to-top, animations
│   ├── responsive.css      # All media queries
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
