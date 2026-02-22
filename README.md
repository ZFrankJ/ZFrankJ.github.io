# ZFrankJ.github.io

Personal site for Fujia Zhang with a simple structure:

- `index.html` — landing page linking to Science, Finance, Others, Profile.
- `pages/` — contains `science.html`, `finance.html`, `others.html`, `profile.html`.
- `assets/css/site.css` — shared styling plus light/dark theme tokens.
- `assets/js/liquid-lens.js` — full-screen liquid distortion effect with toggle.
- `assets/js/site.js` — theme + lens bubble controls shared by all pages.

Light/dark and the liquid-lens FX can be toggled from the floating bubbles on any page; a one-time note explains the FX control the first time you visit.

© 2025 Fujia Zhang. All rights reserved.

## Unified Image Loading

All regular `<img>` elements now use a shared loading indicator style across pages.

- Implemented in `assets/js/site.js` (`initImageLoaders`) and `assets/css/site.css` (`.media-load-shell`, `.media-load-indicator`, `.media-load-dot`).
- Images show a loading spinner overlay until fully loaded.
- If an image fails to load, the same overlay shows `Image unavailable`.
- Opt out for custom image viewers/components by adding `data-loader-skip="true"` on the `<img>`.

The self-cultivation gallery uses the same visual loading style for manual next/previous transitions.

