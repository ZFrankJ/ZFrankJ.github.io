# ZFrankJ.github.io

Personal site for Fujia Zhang with a simple structure:

- `index.html` — landing page linking to Science, Finance, Others, Profile.
- `pages/` — contains the Science, Finance, Others, and Profile routes, plus individual articles and projects.
- `assets/css/site.css` — shared styling plus light/dark theme tokens.
- `assets/js/liquid-lens.js` — full-screen liquid distortion effect with toggle.
- `assets/js/site.js` — navigation, language, appearance, and FX settings shared by the site pages.
- `assets/css/reading.css` — shared centered reading layouts, catalogs, and report controls.
- `assets/css/fonts.css` — optional fonts loaded without blocking the page; fallback text stays readable while they download.

The shared top bar links to Home, Science, Finance, Others, and Profile. Its SVG settings gear opens language, Day / Night / Automatic appearance, and optional liquid-lens FX controls. Preferences persist across pages; Automatic follows the operating system live. FX is off by default for new visitors.

For a local preview, run `python3 -m http.server 4000 --bind 127.0.0.1` from this directory and open `http://127.0.0.1:4000/`.

The paper-plane favicon follows the selected Light, Dark, or System theme, including on initial page load. Its SVG colors match the shared CSS theme tokens. Run `node --test tests/favicon.test.cjs` to check theme switching, page coverage, and palette consistency.

© 2026 Fujia Zhang. All rights reserved.

## Unified Image Loading

All regular `<img>` elements now use a shared loading indicator style across pages.

- Implemented in `assets/js/site.js` (`initImageLoaders`) and `assets/css/site.css` (`.media-load-shell`, `.media-load-indicator`, `.media-load-dot`).
- Images show a loading spinner overlay until fully loaded.
- If an image fails to load, the same overlay shows `Image unavailable`.
- Opt out for custom image viewers/components by adding `data-loader-skip="true"` on the `<img>`.

The self-cultivation gallery uses the same visual loading style for manual next/previous transitions.

## Loading behavior

The document paints its theme-colored outer canvas before external assets arrive. Timeline connectors use CSS and all event text is present in the initial HTML, so neither fonts nor JavaScript are required to show the timeline. Timeline images reserve their dimensions and load lazily; optimized WebP versions are used where they reduce transfer size, with the original image files retained.

Optional liquid-lens FX is imported only when enabled. Run `node --test tests/*.test.cjs` for the theme, localization, first-paint, and deferred-FX checks.

The method article keeps its reviewed snapshot in HTML, but loads the unchanged renderer, renderer CSS, and authored app from cacheable local files. Its introduction is readable before the interactive figures initialize. The engineering article shows its semantic fallback immediately while its enhanced reader prepares; neither article needs a white loading panel.

## Shared article layout

Both technical blogs use the same static catalog/title template, centered reading columns, and chapter navigation behavior (`assets/css/reading.css` and `assets/js/reading.js`). Their catalogs and titles stay outside the replaceable report content, so hydration never rebuilds the sidebar. The engineering reader switches visibility in one step and preserves the current reading position.

Edit bilingual titles and chapters in `assets/data/articles.json`, then run `python3 scripts/build-reading-shells.py`. Use `python3 scripts/build-reading-shells.py --check` to check that the HTML matches the shared template. Register new technical articles there and use the same catalog/hero slots and `data-reading` shell.
