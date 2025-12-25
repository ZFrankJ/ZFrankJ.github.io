import { LiquidLens } from "./liquid-lens.js";

// Warn if loaded via file:// which can block ES modules and FX filter
if (window.location.protocol === "file:") {
  console.warn(
    "This site uses ES modules and filters. Please run from a local server (e.g., `python -m http.server 4000`)."
  );
  const banner = document.createElement("div");
  banner.style.cssText =
    "position:fixed;bottom:12px;left:12px;right:12px;padding:12px 14px;border-radius:10px;background:#8b1f1f;color:#fff;font-weight:600;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,0.25);";
  banner.textContent =
    "Local files block the JS modules. Start a local server (e.g., python -m http.server 4000) and open http://localhost:4000/";
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(banner));
}

const THEME_KEY = "fz-theme";
const LENS_KEY = "fz-lens";
const LENS_INFO_KEY = "fz-lens-info-shown-v3";

const storage = createStorage();

let themeButton = null;
let lensButton = null;
let timelineSpineRaf = 0;
let timelineResizeObserver = null;

function createStorage() {
  try {
    const testKey = "__fz-pref-test__";
    localStorage.setItem(testKey, "ok");
    localStorage.removeItem(testKey);
    return localStorage;
  } catch (err) {
    console.warn("Local storage unavailable; preferences won't persist.", err);
    return {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {}
    };
  }
}

function applyTheme(theme) {
  const isLight = theme === "light";
  const root = document.documentElement;

  root.classList.toggle("theme-light", isLight);
  root.style.colorScheme = isLight ? "light" : "dark";

  if (themeButton) {
    themeButton.textContent = isLight ? "☾" : "☀";
    themeButton.title = isLight ? "Switch to dark theme" : "Switch to light theme";
    themeButton.setAttribute("aria-pressed", String(isLight));
  }
  storage.setItem(THEME_KEY, isLight ? "light" : "dark");
}

function getInitialTheme() {
  const savedTheme =
    window.__fzPreferredTheme ||
    storage.getItem(THEME_KEY) ||
    (typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "dark";
}

function applyLens(enabled) {
  try {
    if (enabled) {
      LiquidLens.init("body");
    } else {
      LiquidLens.destroy();
    }
  } catch (err) {
    console.error("Liquid Lens failed to toggle:", err);
  }

  if (lensButton) {
    lensButton.textContent = enabled ? "FX" : "OFF";
    lensButton.title = enabled ? "Disable liquid lens" : "Enable liquid lens";
    lensButton.setAttribute("aria-pressed", String(enabled));
    lensButton.classList.toggle("bubble--ghost", !enabled);
  }

  storage.setItem(LENS_KEY, enabled ? "on" : "off");
}

function showLensNoteOnce() {
  if (storage.getItem(LENS_INFO_KEY) === "1") return;

  const note = document.createElement("div");
  note.className = "lens-note";
  note.innerHTML = `
    <div class="lens-note__title">Liquid Lens</div>
    <p class="lens-note__text">
      Liquid FX is on by default to make the page feel alive. Tap the “FX” bubble any time to return to normal.
    </p>
    <div class="lens-note__actions">
      <button class="pill pill--ghost" data-note-action="dismiss">Keep FX</button>
      <button class="pill" data-note-action="disable">Turn off FX</button>
    </div>
    <button class="lens-note__dismiss" aria-label="Close">×</button>
  `;

  const dismiss = () => {
    storage.setItem(LENS_INFO_KEY, "1");
    note.remove();
  };

  note.querySelector("[data-note-action='dismiss']")?.addEventListener("click", dismiss);
  note.querySelector(".lens-note__dismiss")?.addEventListener("click", dismiss);
  note.querySelector("[data-note-action='disable']")?.addEventListener("click", () => {
    applyLens(false);
    dismiss();
  });

  document.body.appendChild(note);
}

function setTimelineSpine(timeline) {
  const items = timeline.querySelectorAll(".timeline-item");
  if (items.length < 2) {
    timeline.style.setProperty("--timeline-start", "0px");
    timeline.style.setProperty("--timeline-span", "0px");
    return;
  }

  const timelineRect = timeline.getBoundingClientRect();
  const originY = timelineRect.top + timeline.clientTop;
  const firstRect = items[0].getBoundingClientRect();
  const lastRect = items[items.length - 1].getBoundingClientRect();

  const start = firstRect.top + firstRect.height / 2 - originY;
  const end = lastRect.top + lastRect.height / 2 - originY;

  if (!Number.isFinite(start) || !Number.isFinite(end)) return;

  const height = timeline.clientHeight;
  const clampedStart = Math.max(0, Math.min(start, height));
  const clampedEnd = Math.max(clampedStart, Math.min(end, height));
  const span = clampedEnd - clampedStart;

  timeline.style.setProperty("--timeline-start", `${clampedStart}px`);
  timeline.style.setProperty("--timeline-span", `${span}px`);
}

function updateTimelineSpines() {
  timelineSpineRaf = 0;
  document.querySelectorAll(".timeline").forEach(setTimelineSpine);
}

function scheduleTimelineSpineUpdate() {
  if (timelineSpineRaf) return;
  timelineSpineRaf = requestAnimationFrame(updateTimelineSpines);
}

function initTimelineSpines() {
  const timelines = document.querySelectorAll(".timeline");
  if (timelines.length === 0) return;

  scheduleTimelineSpineUpdate();

  window.addEventListener("resize", scheduleTimelineSpineUpdate, { passive: true });
  window.addEventListener("load", scheduleTimelineSpineUpdate, { passive: true });

  if (document.fonts?.ready && typeof document.fonts.ready.then === "function") {
    document.fonts.ready.then(scheduleTimelineSpineUpdate).catch(() => {});
  }

  if (typeof ResizeObserver === "function") {
    timelineResizeObserver = new ResizeObserver(() => scheduleTimelineSpineUpdate());
    timelines.forEach((timeline) => timelineResizeObserver.observe(timeline));
  }
}

function initTheme() {
  applyTheme(getInitialTheme());

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const next = document.documentElement.classList.contains("theme-light") ? "dark" : "light";
      applyTheme(next);
    });
  }
}

function initLens() {
  const savedLens = storage.getItem(LENS_KEY);
  const shouldEnable = savedLens !== "off";
  applyLens(shouldEnable);

  if (lensButton) {
    lensButton.addEventListener("click", () => {
      const next = !LiquidLens.active;
      applyLens(next);
    });
  }

  if (shouldEnable) {
    setTimeout(showLensNoteOnce, 250);
  }
}

function bootstrap() {
  themeButton = document.querySelector('[data-toggle="theme"]');
  lensButton = document.querySelector('[data-toggle="lens"]');
  initTheme();
  initLens();
  initTimelineSpines();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
