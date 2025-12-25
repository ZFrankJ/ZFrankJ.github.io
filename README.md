# ZFrankJ.github.io

Personal site for Fujia Zhang with a simple structure:

- `index.html` — landing page linking to Science, Finance, Others, Profile.
- `pages/` — contains `science.html`, `finance.html`, `others.html`, `profile.html`.
- `assets/css/site.css` — shared styling plus light/dark theme tokens.
- `assets/js/liquid-lens.js` — full-screen liquid distortion effect with toggle.
- `assets/js/site.js` — theme + lens bubble controls shared by all pages.

Light/dark and the liquid-lens FX can be toggled from the floating bubbles on any page; a one-time note explains the FX control the first time you visit.

Local preview: use a server so ES modules load (browsers block `file://` imports). From the repo root: `python -m http.server 4000` then open `http://localhost:4000/`.
