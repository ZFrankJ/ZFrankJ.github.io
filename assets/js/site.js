import { LiquidLens } from "./liquid-lens.js";
import { getLanguage, initI18n, setLanguage, translate } from "./i18n.js?v=7";

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
const LENS_INFO_KEY = "fz-lens-info-shown-v4";
const LENS_SUPPORT_INFO_KEY = "fz-lens-support-info-shown-v2";

const storage = createStorage();

let themeButton = null;
let lensButton = null;
let languageButton = null;
let settingsButton = null;
let settingsControls = null;
let settingsItems = null;
let settingsOriginRaf = 0;
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
    const icon = themeButton.querySelector(".control-chip__icon");
    let title = "System theme";
    if (mode === "system") {
      if (icon) icon.textContent = "🖥";
      themeButton.setAttribute("aria-pressed", "mixed");
    } else {
      if (icon) icon.textContent = isLight ? "☀" : "☾";
      title = isLight ? "Light theme" : "Dark theme";
      themeButton.setAttribute("aria-pressed", String(isLight));
    }
    themeButton.title = translate(title);
    themeButton.setAttribute("aria-label", translate(title));
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
    const icon = lensButton.querySelector(".control-chip__icon");
    const title = enabled ? "Disable liquid lens" : "Enable liquid lens";
    if (icon) icon.textContent = enabled ? "FX" : "OFF";
    lensButton.title = translate(title);
    lensButton.setAttribute("aria-label", translate(title));
    lensButton.setAttribute("aria-pressed", String(enabled));
    lensButton.classList.toggle("is-inactive", !enabled);
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
    <div class="lens-note__title">${translate("Liquid Lens")}</div>
    <p class="lens-note__text">
      ${translate("Liquid FX is on by default to make the page feel alive. Tap the FX setting any time to return to normal. Safari and touch devices stay on the normal display because they do not support this FX reliably.")}
    </p>
    <div class="lens-note__actions">
      <button class="pill pill--ghost" data-note-action="dismiss">${translate("Keep FX")}</button>
      <button class="pill" data-note-action="disable">${translate("Turn off FX")}</button>
    </div>
    <button class="lens-note__dismiss" aria-label="${translate("Close")}">×</button>
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

function showUnsupportedLensNoteOnce(message) {
  if (storage.getItem(LENS_SUPPORT_INFO_KEY) === "1") return;

  const note = document.createElement("div");
  note.className = "lens-note";
  note.innerHTML = `
    <div class="lens-note__title">${translate("FX Support Note")}</div>
    <p class="lens-note__text">
      ${translate(message)}
    </p>
    <div class="lens-note__actions">
      <button class="pill" data-note-action="dismiss">${translate("Understood")}</button>
    </div>
    <button class="lens-note__dismiss" aria-label="${translate("Close")}">×</button>
  `;

  const dismiss = () => {
    storage.setItem(LENS_SUPPORT_INFO_KEY, "1");
    note.remove();
  };

  note.querySelector("[data-note-action='dismiss']")?.addEventListener("click", dismiss);
  note.querySelector(".lens-note__dismiss")?.addEventListener("click", dismiss);

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

function setSettingsOpen(open, { focusTrigger = false } = {}) {
  if (!settingsControls || !settingsItems || !settingsButton) return;

  if (open) {
    updateSettingsAnimationOrigins();
    void settingsItems.offsetWidth;
  }
  settingsControls.setAttribute("data-open", open ? "true" : "false");
  settingsItems.setAttribute("aria-hidden", open ? "false" : "true");
  settingsButton.setAttribute("aria-expanded", String(open));
  settingsButton.title = translate(open ? "Close settings" : "Open settings");
  settingsButton.setAttribute("aria-label", translate(open ? "Close settings" : "Open settings"));
  settingsItems.querySelectorAll("button").forEach((button) => {
    button.tabIndex = open ? 0 : -1;
  });

  if (!open) setThemeMenuOpen(false);
  if (focusTrigger) settingsButton.focus();
}

function updateSettingsAnimationOrigins() {
  if (!settingsItems || !settingsButton) return;

  const triggerRect = settingsButton.getBoundingClientRect();
  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  const itemsRect = settingsItems.getBoundingClientRect();
  const buttons = Array.from(settingsItems.querySelectorAll(".control-chip"));

  buttons.forEach((button, index) => {
    const buttonCenter = itemsRect.left + button.offsetLeft + button.offsetWidth / 2;
    const shift = Math.round(triggerCenter - buttonCenter);
    const revealOrder = buttons.length - index - 1;
    button.style.setProperty("--settings-shift-x", `${shift}px`);
    button.style.setProperty("--settings-open-delay", `${revealOrder * 36}ms`);
  });
}

function scheduleSettingsAnimationOrigins() {
  if (settingsOriginRaf) cancelAnimationFrame(settingsOriginRaf);
  settingsOriginRaf = requestAnimationFrame(() => {
    settingsOriginRaf = 0;
    updateSettingsAnimationOrigins();
  });
}

function renderSettingsLabels() {
  if (!settingsControls) return;

  settingsControls.setAttribute("aria-label", translate("Display controls"));

  const languageLabel = languageButton?.querySelector(".control-chip__label");
  const languageIcon = languageButton?.querySelector(".control-chip__icon");
  const themeLabel = themeButton?.querySelector(".control-chip__label");
  const lensLabel = lensButton?.querySelector(".control-chip__label");

  if (languageLabel) languageLabel.textContent = translate("Language");
  if (languageIcon) languageIcon.textContent = getLanguage() === "zh" ? "中" : "EN";
  if (languageButton) {
    languageButton.title = translate("Switch language");
    languageButton.setAttribute("aria-label", translate("Switch language"));
    languageButton.setAttribute("aria-pressed", String(getLanguage() === "zh"));
  }
  if (themeLabel) themeLabel.textContent = translate("Theme");
  if (lensLabel) lensLabel.textContent = translate("FX");

  if (settingsButton) {
    const isOpen = settingsControls.getAttribute("data-open") === "true";
    settingsButton.title = translate(isOpen ? "Close settings" : "Open settings");
    settingsButton.setAttribute("aria-label", translate(isOpen ? "Close settings" : "Open settings"));
  }

  scheduleSettingsAnimationOrigins();
}

function buildSettingsControls() {
  settingsControls = document.querySelector(".control-bubbles");
  if (!settingsControls) {
    settingsControls = document.createElement("div");
    settingsControls.className = "control-bubbles";
    document.body.appendChild(settingsControls);
  }

  settingsControls.setAttribute("role", "toolbar");
  settingsControls.setAttribute("data-open", "false");
  settingsControls.innerHTML = `
    <div class="control-bubbles__items" data-settings-items aria-hidden="true">
      <button class="control-chip" data-toggle="language" type="button" aria-pressed="false" tabindex="-1">
        <span class="control-chip__icon" aria-hidden="true">EN</span>
        <span class="control-chip__label">Language</span>
      </button>
      <button class="control-chip" data-toggle="theme" type="button" aria-pressed="mixed" tabindex="-1">
        <span class="control-chip__icon" aria-hidden="true">🖥</span>
        <span class="control-chip__label">Theme</span>
      </button>
      <button class="control-chip" data-toggle="lens" type="button" aria-pressed="true" tabindex="-1">
        <span class="control-chip__icon" aria-hidden="true">FX</span>
        <span class="control-chip__label">FX</span>
      </button>
    </div>
    <button class="bubble settings-trigger" data-toggle="settings" type="button" aria-expanded="false" aria-controls="display-settings-items">
      <span aria-hidden="true">⚙</span>
    </button>
  `;

  settingsItems = settingsControls.querySelector("[data-settings-items]");
  if (settingsItems) settingsItems.id = "display-settings-items";
  settingsButton = settingsControls.querySelector('[data-toggle="settings"]');
  languageButton = settingsControls.querySelector('[data-toggle="language"]');
  themeButton = settingsControls.querySelector('[data-toggle="theme"]');
  lensButton = settingsControls.querySelector('[data-toggle="lens"]');

  settingsButton?.addEventListener("click", () => {
    const isOpen = settingsControls.getAttribute("data-open") === "true";
    setSettingsOpen(!isOpen);
  });

  languageButton?.addEventListener("click", () => {
    setLanguage(getLanguage() === "zh" ? "en" : "zh");
  });

  document.addEventListener("click", (event) => {
    if (settingsControls?.getAttribute("data-open") !== "true") return;
    if (settingsControls.contains(event.target)) return;
    setSettingsOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (settingsControls?.getAttribute("data-open") !== "true") return;
    setSettingsOpen(false, { focusTrigger: true });
  });

  document.addEventListener("fz:languagechange", () => {
    renderSettingsLabels();
    applyTheme(themeMode);
    if (lensButton) {
      const lensEnabled = LiquidLens.active;
      const title = lensEnabled ? "Disable liquid lens" : "Enable liquid lens";
      lensButton.title = translate(title);
      lensButton.setAttribute("aria-label", translate(title));
    }
    renderThemeMenuLabels();
    scheduleTimelineSpineUpdate();
  });

  window.addEventListener("resize", scheduleSettingsAnimationOrigins);
  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleSettingsAnimationOrigins).catch(() => {});
  }

  renderSettingsLabels();
  setSettingsOpen(false);
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
    <button class="theme-menu__item" data-theme-option="system" aria-pressed="false">🖥</button>
    <button class="theme-menu__item" data-theme-option="light" aria-pressed="false">☀</button>
    <button class="theme-menu__item" data-theme-option="dark" aria-pressed="false">☾</button>
  `;
  document.body.appendChild(themeMenu);
  renderThemeMenuLabels();

  themeMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-option]");
    if (!button) return;
    themeMode = button.getAttribute("data-theme-option") || "system";
    applyTheme(themeMode);
    setThemeMenuOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!themeMenu || themeMenu.getAttribute("data-open") !== "true") return;
    if (themeMenu.contains(event.target) || themeButton?.contains(event.target)) return;
    setThemeMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setThemeMenuOpen(false);
  });

  applyTheme(themeMode);
}

function renderThemeMenuLabels() {
  if (!themeMenu) return;
  themeMenu.querySelectorAll("[data-theme-option]").forEach((button) => {
    const option = button.getAttribute("data-theme-option") || "system";
    const label = option === "light" ? "Light" : option === "dark" ? "Dark" : "System";
    button.title = translate(label);
    button.setAttribute("aria-label", translate(label));
  });
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
  const left = Math.max(8, window.scrollX + rect.left + rect.width / 2 - menuWidth / 2);
  const top = window.scrollY + rect.bottom + 8;
  themeMenu.style.left = `${left}px`;
  themeMenu.style.top = `${top}px`;
}

function initLens() {
  const isCoarsePointer =
    (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches) ||
    navigator.maxTouchPoints > 0;
  const isSafari = LiquidLens.isSafariBrowser();
  if (isCoarsePointer || isSafari) {
    applyLens(false, { persist: false });
    if (lensButton) {
      lensButton.disabled = true;
      lensButton.setAttribute("aria-disabled", "true");
      lensButton.title = isSafari ? "FX unavailable in Safari" : "FX unavailable on touch devices";
    }
    const noteMessage = isSafari
      ? "Liquid FX is disabled in Safari because WebKit does not support this effect reliably. Touch devices also stay on the normal display."
      : "Liquid FX is disabled on touch devices. Safari also stays on the normal display because the effect is not reliable there.";
    setTimeout(() => showUnsupportedLensNoteOnce(noteMessage), 250);
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
    indicator.innerHTML = `<span class="media-load-dot" aria-hidden="true"></span><span class="media-load-label">${translate("Loading image")}</span>`;

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

    const label = indicator.querySelector(".media-load-label");

    const clearLoading = () => {
      wrapper.classList.remove("is-loading", "is-error");
      indicator.hidden = true;
      if (label) label.textContent = translate("Loading image");
    };

    const markError = () => {
      wrapper.classList.remove("is-loading");
      wrapper.classList.add("is-error");
      indicator.hidden = false;
      if (label) label.textContent = translate("Image unavailable");
    };

    img.dataset.loaderBound = "1";
    img.addEventListener("load", clearLoading, { once: true });
    img.addEventListener("error", markError, { once: true });

    if (img.complete) {
      if (img.naturalWidth > 0) {
        clearLoading();
      } else {
        markError();
      }
      return;
    }

    if (typeof img.decode === "function") {
      img.decode().then(() => {
        if (img.naturalWidth > 0) {
          clearLoading();
        }
      }).catch(() => {});
    }
  });
}

function bootstrap() {
  initI18n();
  buildSettingsControls();
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
