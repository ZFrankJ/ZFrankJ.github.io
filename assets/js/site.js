import { LiquidLens } from "./liquid-lens.js";
import { getLanguage, initI18n, setLanguage, translate } from "./i18n.js?v=12";

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

const storage = createStorage();

let themeButton = null;
let lensButton = null;
let languageButton = null;
let settingsButton = null;
let settingsControls = null;
let settingsItems = null;
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
  window.__fzThemeMode = mode;

  const favicon = document.getElementById("site-favicon");
  if (favicon?.dataset[effectiveTheme]) {
    favicon.href = favicon.dataset[effectiveTheme];
  }

  if (themeButton) {
    const icon = themeButton.querySelector(".control-chip__icon");
    let title = "Automatic";
    if (mode === "system") {
      if (icon) icon.innerHTML = svgIcon("system");
    } else {
      if (icon) icon.innerHTML = svgIcon(isLight ? "light" : "dark");
      title = isLight ? "Day" : "Night";
    }
    const value = themeButton.querySelector(".control-chip__value");
    if (value) value.textContent = translate(title);
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
    if (icon) icon.innerHTML = svgIcon("sparkles");
    const value = lensButton.querySelector(".control-chip__value");
    if (value) value.textContent = translate(enabled ? "On" : "Off");
    lensButton.title = translate(title);
    lensButton.setAttribute("aria-label", translate(title));
    lensButton.setAttribute("aria-pressed", String(enabled));
    lensButton.classList.toggle("is-inactive", !enabled);
  }

  if (persist) {
    storage.setItem(LENS_KEY, enabled ? "on" : "off");
  }
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
  else if (themeMenu?.getAttribute("data-open") !== "true") {
    themeMenu?.querySelectorAll("button").forEach(button => { button.tabIndex = -1; });
  }
  if (focusTrigger) settingsButton.focus();
}

function updateSettingsAnimationOrigins() {
  if (!settingsItems || !settingsButton) return;
  const trigger = settingsButton.getBoundingClientRect();
  const items = settingsItems.getBoundingClientRect();
  settingsItems.style.setProperty("--settings-clip-right", `${items.right - trigger.right}px`);
  const buttons = [...settingsItems.querySelectorAll(".control-chip")];
  buttons.forEach((button, index) => {
    button.style.setProperty("--settings-shift-x", `${trigger.left + trigger.width / 2 - items.left - button.offsetLeft - button.offsetWidth / 2}px`);
    button.style.setProperty("--settings-shift-y", `${trigger.top + trigger.height / 2 - items.top - button.offsetTop - button.offsetHeight / 2}px`);
    button.style.setProperty("--settings-open-delay", `${(buttons.length - index - 1) * 36}ms`);
  });
}

function renderSettingsLabels() {
  if (!settingsControls) return;

  settingsControls.setAttribute("aria-label", translate("Display controls"));

  const languageLabel = languageButton?.querySelector(".control-chip__label");
  const languageValue = languageButton?.querySelector(".control-chip__value");
  const themeLabel = themeButton?.querySelector(".control-chip__label");
  const lensLabel = lensButton?.querySelector(".control-chip__label");

  if (languageLabel) languageLabel.textContent = translate("Language");
  if (languageValue) languageValue.textContent = getLanguage() === "zh" ? "中文" : "EN";
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
}

function svgIcon(name) {
  const paths = {
    settings: '<path d="M9.1299 5.0709L10.3129 4.6922L10.4357 2.1231L13.5643 2.1231L13.6871 4.6922L14.8701 5.0709L15.9744 5.6396L17.8779 3.9098L20.0902 6.1221L18.3604 8.0256L18.9291 9.1299L19.3078 10.3129L21.8769 10.4357L21.8769 13.5643L19.3078 13.6871L18.9291 14.8701L18.3604 15.9744L20.0902 17.8779L17.8779 20.0902L15.9744 18.3604L14.8701 18.9291L13.6871 19.3078L13.5643 21.8769L10.4357 21.8769L10.3129 19.3078L9.1299 18.9291L8.0256 18.3604L6.1221 20.0902L3.9098 17.8779L5.6396 15.9744L5.0709 14.8701L4.6922 13.6871L2.1231 13.5643L2.1231 10.4357L4.6922 10.3129L5.0709 9.1299L5.6396 8.0256L3.9098 6.1221L6.1221 3.9098L8.0256 5.6396Z"/><circle cx="12" cy="12" r="3.1"/>',
    system: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    dark: '<path d="M20.5 14A8.7 8.7 0 0 1 10 3.5 8.7 8.7 0 1 0 20.5 14Z"/>',
    language: '<path d="M3 5h12M9 3v2m3 0c0 6-4 10-8 12m1-9c1 4 4 7 8 9m1 4 4-11 4 11m-6.5-4h5"/>',
    sparkles: '<path d="m10 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2Zm9 12 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>'
  };
  return `<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function buildTopbar() {
  const base = new URL("../../", import.meta.url);
  const routes = [["Home", ""], ["Science", "pages/science/"], ["Finance", "pages/finance/"], ["Others", "pages/others/"], ["Profile", "pages/profile/"]];
  const bar = document.createElement("header");
  bar.className = "site-topbar";
  const backdrop = document.createElement("div");
  backdrop.className = "site-topbar__backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  bar.appendChild(backdrop);
  const inner = document.createElement("div");
  inner.className = "site-topbar__inner";
  const nav = document.createElement("nav");
  nav.className = "site-nav";
  nav.setAttribute("aria-label", "Main navigation");
  routes.forEach(([label, path]) => {
    const link = document.createElement("a");
    link.href = new URL(path, base).href;
    link.textContent = label;
    const current = path ? location.pathname.startsWith(new URL(path, base).pathname) : [base.pathname, `${base.pathname}index.html`].includes(location.pathname);
    if (current) link.setAttribute("aria-current", "page");
    nav.appendChild(link);
  });
  inner.appendChild(nav);
  const controls = document.querySelector(".control-bubbles") || document.createElement("div");
  controls.className = "control-bubbles";
  inner.appendChild(controls);
  bar.appendChild(inner);
  document.body.prepend(bar);
  const syncTopbarHeight = () => {
    document.documentElement.style.setProperty("--site-topbar-height", `${bar.offsetHeight}px`);
  };
  syncTopbarHeight();
  if (typeof ResizeObserver === "function") new ResizeObserver(syncTopbarHeight).observe(bar);
  else window.addEventListener("resize", syncTopbarHeight);

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
    <button class="settings-trigger" data-toggle="settings" type="button" aria-expanded="false" aria-controls="display-settings-items">
      ${svgIcon("settings")}
    </button>
    <div class="control-bubbles__items" data-settings-items aria-hidden="true" data-i18n-skip>
      <button class="control-chip" data-toggle="language" type="button" aria-pressed="false" tabindex="-1">
        <span class="control-chip__icon">${svgIcon("language")}</span>
        <span class="control-chip__label">Language</span>
        <span class="control-chip__value">EN</span>
      </button>
      <button class="control-chip" data-toggle="theme" type="button" aria-expanded="false" tabindex="-1">
        <span class="control-chip__icon">${svgIcon("system")}</span>
        <span class="control-chip__label">Theme</span>
        <span class="control-chip__value"></span>
      </button>
      <button class="control-chip" data-toggle="lens" type="button" aria-pressed="false" tabindex="-1">
        <span class="control-chip__icon">${svgIcon("sparkles")}</span>
        <span class="control-chip__label">FX</span>
        <span class="control-chip__value"></span>
      </button>
    </div>
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
      lensButton.title = translate(lensButton.disabled ? (LiquidLens.isSafariBrowser() ? "FX unavailable in Safari" : "FX unavailable on touch devices") : title);
      lensButton.querySelector(".control-chip__value").textContent = translate(lensEnabled ? "On" : "Off");
      lensButton.setAttribute("aria-label", lensButton.title);
    }
    renderThemeMenuLabels();
    scheduleTimelineSpineUpdate();
  });

  window.addEventListener("resize", () => {
    updateSettingsAnimationOrigins();
    if (themeMenu?.getAttribute("data-open") === "true") positionThemeMenu();
  });
  document.fonts?.ready.then(updateSettingsAnimationOrigins).catch(() => {});
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
  themeMenu.id = "appearance-options";
  themeMenu.setAttribute("role", "group");
  themeButton.setAttribute("aria-controls", themeMenu.id);
  themeMenu.innerHTML = ["system", "light", "dark"].map(mode => `
    <button class="theme-menu__item" data-theme-option="${mode}" aria-pressed="false" type="button">
      ${svgIcon(mode)}<span data-theme-label></span><span class="theme-menu__check">${svgIcon("check")}</span>
    </button>
  `).join("");
  settingsControls.appendChild(themeMenu);
  renderThemeMenuLabels();

  themeMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-option]");
    if (!button) return;
    themeMode = button.getAttribute("data-theme-option") || "system";
    applyTheme(themeMode);
    setThemeMenuOpen(false);
    themeButton.focus();
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
    const label = option === "light" ? "Day" : option === "dark" ? "Night" : "Automatic";
    button.querySelector("[data-theme-label]").textContent = translate(label);
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
  themeMenu.querySelectorAll("button").forEach(button => { button.tabIndex = open ? 0 : -1; });
  if (open) positionThemeMenu();
}

function positionThemeMenu() {
  if (!themeMenu || !themeButton || !settingsControls) return;
  const trigger = themeButton.getBoundingClientRect();
  const controls = settingsControls.getBoundingClientRect();
  const left = Math.max(8, Math.min(trigger.left, window.innerWidth - themeMenu.offsetWidth - 8));
  themeMenu.style.left = `${left - controls.left}px`;
  themeMenu.style.top = `${trigger.bottom - controls.top + 10}px`;
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
      lensButton.title = translate(isSafari ? "FX unavailable in Safari" : "FX unavailable on touch devices");
      lensButton.setAttribute("aria-label", lensButton.title);
    }
    return;
  }

  const savedLens = storage.getItem(LENS_KEY);
  const shouldEnable = savedLens === "on" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  applyLens(shouldEnable);

  if (lensButton) {
    lensButton.addEventListener("click", () => {
      const next = !LiquidLens.active;
      applyLens(next);
    });
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
  buildTopbar();
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
