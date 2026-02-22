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
let themeMode = "system";
const systemQuery =
  typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: light)") : null;
let themeMenu = null;
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

function getSystemTheme() {
  return systemQuery && systemQuery.matches ? "light" : "dark";
}

function applyTheme(mode) {
  const effectiveTheme = mode === "system" ? getSystemTheme() : mode;
  const isLight = effectiveTheme === "light";
  const root = document.documentElement;

  root.classList.toggle("theme-light", isLight);
  root.style.colorScheme = isLight ? "light" : "dark";

  if (themeButton) {
    if (mode === "system") {
      themeButton.textContent = "🖥";
      themeButton.title = "System theme";
      themeButton.setAttribute("aria-pressed", "mixed");
    } else {
      themeButton.textContent = isLight ? "☀" : "☾";
      themeButton.title = isLight ? "Light theme" : "Dark theme";
      themeButton.setAttribute("aria-pressed", String(isLight));
    }
  }
  if (themeMenu) {
    themeMenu.querySelectorAll("[data-theme-option]").forEach((button) => {
      const active = button.getAttribute("data-theme-option") === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  storage.setItem(THEME_KEY, mode);
}

function getInitialThemeMode() {
  const savedTheme = window.__fzThemeMode || storage.getItem(THEME_KEY) || "system";
  if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
    return savedTheme;
  }
  return "system";
}

function applyLens(enabled, { persist = true } = {}) {
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

  if (persist) {
    storage.setItem(LENS_KEY, enabled ? "on" : "off");
  }
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
  themeMode = getInitialThemeMode();
  applyTheme(themeMode);

  if (systemQuery) {
    systemQuery.addEventListener("change", () => {
      if (themeMode === "system") applyTheme("system");
    });
  }

  if (themeButton) {
    buildThemeMenu();
    themeButton.setAttribute("aria-haspopup", "true");
    themeButton.addEventListener("click", () => {
      toggleThemeMenu();
    });
  }
}

function buildThemeMenu() {
  if (themeMenu || !themeButton) return;

  themeMenu = document.createElement("div");
  themeMenu.className = "theme-menu";
  themeMenu.setAttribute("data-open", "false");
  themeMenu.innerHTML = `
    <button class="theme-menu__item" data-theme-option="system" aria-pressed="false" title="System">🖥</button>
    <button class="theme-menu__item" data-theme-option="light" aria-pressed="false" title="Light">☀</button>
    <button class="theme-menu__item" data-theme-option="dark" aria-pressed="false" title="Dark">☾</button>
  `;
  document.body.appendChild(themeMenu);

  themeMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-option]");
    if (!button) return;
    themeMode = button.getAttribute("data-theme-option") || "system";
    applyTheme(themeMode);
    setThemeMenuOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!themeMenu || themeMenu.getAttribute("data-open") !== "true") return;
    if (themeMenu.contains(event.target) || event.target === themeButton) return;
    setThemeMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setThemeMenuOpen(false);
  });

  applyTheme(themeMode);
}

function toggleThemeMenu() {
  if (!themeMenu) return;
  const isOpen = themeMenu.getAttribute("data-open") === "true";
  setThemeMenuOpen(!isOpen);
}

function setThemeMenuOpen(open) {
  if (!themeMenu || !themeButton) return;
  themeMenu.setAttribute("data-open", open ? "true" : "false");
  themeButton.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    requestAnimationFrame(positionThemeMenu);
  }
}

function positionThemeMenu() {
  if (!themeMenu || !themeButton) return;
  const rect = themeButton.getBoundingClientRect();
  const menuWidth = themeMenu.offsetWidth || 48;
  const left = Math.max(8, rect.left + rect.width / 2 - menuWidth / 2);
  const top = rect.bottom + 8;
  themeMenu.style.left = `${left}px`;
  themeMenu.style.top = `${top}px`;
}

function initLens() {
  const isCoarsePointer =
    (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches) ||
    navigator.maxTouchPoints > 0;
  if (isCoarsePointer) {
    applyLens(false, { persist: false });
    if (lensButton) {
      lensButton.disabled = true;
      lensButton.setAttribute("aria-disabled", "true");
      lensButton.title = "FX disabled on touch devices";
    }
    return;
  }

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


function initImageLoaders() {
  const images = document.querySelectorAll('img:not([data-loader-skip="true"])');

  images.forEach((img) => {
    if (img.dataset.loaderBound === "1") return;
    if (!img.parentElement) return;

    const wrapper = document.createElement("span");
    wrapper.className = "media-load-shell is-loading";

    const indicator = document.createElement("span");
    indicator.className = "media-load-indicator";
    indicator.innerHTML = '<span class="media-load-dot" aria-hidden="true"></span><span class="media-load-label">Loading image</span>';

    if (img.closest(".profile-photo")) {
      wrapper.style.height = "100%";
    }

    const radius = getComputedStyle(img).borderRadius;
    if (radius && radius !== "0px") {
      wrapper.style.borderRadius = radius;
    }

    const parent = img.parentElement;
    parent.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(indicator);

    const clearLoading = () => {
      wrapper.classList.remove("is-loading", "is-error");
      const label = wrapper.querySelector(".media-load-label");
      if (label) label.textContent = "Loading image";
    };

    const markError = () => {
      wrapper.classList.remove("is-loading");
      wrapper.classList.add("is-error");
      const label = wrapper.querySelector(".media-load-label");
      if (label) label.textContent = "Image unavailable";
    };

    img.addEventListener("load", clearLoading);
    img.addEventListener("error", markError);

    if (img.complete) {
      if (img.naturalWidth > 0) {
        clearLoading();
      } else {
        markError();
      }
    }

    img.dataset.loaderBound = "1";
  });
}

function bootstrap() {
  themeButton = document.querySelector('[data-toggle="theme"]');
  lensButton = document.querySelector('[data-toggle="lens"]');
  initTheme();
  initLens();
  initTimelineSpines();
  initImageLoaders();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
