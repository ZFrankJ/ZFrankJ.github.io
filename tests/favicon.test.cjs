const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const startup = fs.readFileSync(path.join(root, "assets/js/favicon.js"), "utf8");
const site = fs.readFileSync(path.join(root, "assets/js/site.js"), "utf8");
const applyTheme = site.slice(site.indexOf("function applyTheme("), site.indexOf("function getInitialThemeMode("));

function loadFavicon({ mode, systemLight = false, blockedStorage = false, matchMedia = true } = {}) {
  const favicon = { dataset: {}, href: "" };
  let onSystemChange;
  const systemQuery = {
    matches: systemLight,
    addEventListener(event, callback) {
      assert.equal(event, "change");
      onSystemChange = callback;
    }
  };
  const document = {
    currentScript: { src: "https://example.com/personal/assets/js/favicon.js?v=1" },
    getElementById(id) {
      assert.equal(id, "site-favicon");
      return favicon;
    }
  };
  const window = matchMedia ? { matchMedia: () => systemQuery } : {};
  vm.runInNewContext(startup, {
    URL, document, window,
    localStorage: {
      getItem(key) {
        assert.equal(key, "fz-theme");
        if (blockedStorage) throw new Error("Storage blocked");
        return mode;
      }
    }
  });
  return {
    favicon, window, document,
    changeSystem(light) {
      systemQuery.matches = light;
      onSystemChange();
    }
  };
}

test("saved light and dark choices override the system on first load", () => {
  for (const [mode, systemLight, file] of [["light", false, "day"], ["dark", true, "night"]]) {
    const runtime = loadFavicon({ mode, systemLight });
    assert.equal(runtime.favicon.href, `https://example.com/personal/assets/icons/paper-plane-${file}.svg`);
    runtime.changeSystem(!systemLight);
    assert.equal(runtime.favicon.href, `https://example.com/personal/assets/icons/paper-plane-${file}.svg`);
  }
});

test("system mode follows OS changes; missing or invalid preferences fall back to system", () => {
  for (const mode of ["system", null, "invalid"]) {
    const runtime = loadFavicon({ mode });
    assert.match(runtime.favicon.href, /paper-plane-night\.svg$/);
    runtime.changeSystem(true);
    assert.match(runtime.favicon.href, /paper-plane-day\.svg$/);
    runtime.changeSystem(false);
    assert.match(runtime.favicon.href, /paper-plane-night\.svg$/);
  }
});

test("blocked storage and absent matchMedia still produce a usable icon", () => {
  assert.match(loadFavicon({ blockedStorage: true, systemLight: true }).favicon.href, /paper-plane-day\.svg$/);
  assert.match(loadFavicon({ blockedStorage: true, matchMedia: false }).favicon.href, /paper-plane-night\.svg$/);
});

test("the real theme handler updates the favicon on every selection", () => {
  const runtime = loadFavicon({ mode: "system" });
  let selectedMode;
  let isLight;
  runtime.document.documentElement = {
    style: {},
    classList: { toggle(name, enabled) { assert.equal(name, "theme-light"); isLight = enabled; } }
  };
  const context = vm.createContext({
    ...runtime,
    themeButton: null, themeMenu: null, THEME_KEY: "fz-theme",
    storage: { setItem(key, mode) { assert.equal(key, "fz-theme"); selectedMode = mode; } },
    getSystemTheme: () => "dark"
  });
  vm.runInContext(applyTheme, context);
  for (const [mode, file, expectedLight] of [["light", "day", true], ["dark", "night", false], ["system", "night", false]]) {
    vm.runInContext(`applyTheme(${JSON.stringify(mode)})`, context);
    assert.equal(selectedMode, mode);
    assert.equal(runtime.window.__fzThemeMode, mode);
    assert.equal(isLight, expectedLight);
    assert.match(runtime.favicon.href, new RegExp(`paper-plane-${file}\\.svg$`));
  }
  vm.runInContext('applyTheme("light")', context);
  runtime.changeSystem(false);
  assert.match(runtime.favicon.href, /paper-plane-day\.svg$/);
});

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}

test("every page has one paper-plane icon and the synchronous startup script", () => {
  const pages = [path.join(root, "index.html"), ...htmlFiles(path.join(root, "pages"))];
  for (const file of pages) {
    const html = fs.readFileSync(file, "utf8");
    const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)[1];
    const icons = [...head.matchAll(/<link\b[^>]*rel="(?:shortcut )?icon"[^>]*>/g)];
    assert.equal(icons.length, 1, file);
    assert.match(icons[0][0], /id="site-favicon"/);
    const href = icons[0][0].match(/href="([^"]+)"/)[1];
    assert.equal(path.resolve(path.dirname(file), href), path.join(root, "assets/icons/paper-plane-night.svg"));
    const script = head.match(/<script src="([^"]*favicon\.js\?v=1)"><\/script>/);
    assert.ok(script, file);
    assert.equal(path.resolve(path.dirname(file), script[1].split("?")[0]), path.join(root, "assets/js/favicon.js"));
    assert.doesNotMatch(head, /rel="icon"[^>]*data:/);
    assert.doesNotMatch(html, /site\.js\?v=(?:20|21)\b/);
  }
});

test("SVG geometry is shared and every fill uses the corresponding website CSS color", () => {
  const css = fs.readFileSync(path.join(root, "assets/css/site.css"), "utf8");
  const themes = {
    night: css.match(/:root\s*\{([^}]+)\}/)[1],
    day: css.match(/:root\.theme-light,\s*body\.theme-light\s*\{([^}]+)\}/)[1]
  };
  let geometry;
  for (const [theme, block] of Object.entries(themes)) {
    const palette = Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[\da-f]+);/gi)].map(m => [m[1], m[2]]));
    const svg = fs.readFileSync(path.join(root, `assets/icons/paper-plane-${theme}.svg`), "utf8");
    const fills = Object.fromEntries([...svg.matchAll(/<(?:path|g) id="([^"]+)"[^>]*fill="([^"]+)"/g)].map(m => [m[1], m[2]]));
    assert.equal(svg.match(/<rect[^>]*fill="([^"]+)"/)[1], palette["--bg"]);
    assert.equal(fills.creases, palette["--bg"]);
    assert.equal(fills.underside, palette["--accent"]);
    assert.equal(fills["upper-wing"], palette["--accent-2"]);
    assert.equal(fills["lower-wing"], palette["--accent-2"]);
    const paths = [...svg.matchAll(/ d="([^"]+)"/g)].map(m => m[1]);
    if (geometry) assert.deepEqual(paths, geometry);
    geometry = paths;
  }
});
