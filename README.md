# ZFrankJ.github.io

Personal site for Fujia Zhang with a simple structure:

- `index.html` — landing page linking to Science, Finance, Others, Profile.
- `pages/` — contains the Science, Finance, Others, and Profile routes, plus individual articles and projects.
- `assets/css/site.css` — shared styling plus light/dark theme tokens.
- `assets/js/liquid-lens.js` — full-screen liquid distortion effect with toggle.
- `assets/js/site.js` — navigation, language, appearance, and FX settings shared by the site pages.
- `assets/css/reading.css` — shared centered reading layouts, catalogs, and report controls.

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
