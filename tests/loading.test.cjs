const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const site = fs.readFileSync(path.join(root, 'assets/js/site.js'), 'utf8');
const lensFunctions = site.slice(site.indexOf('function renderLensControl('), site.indexOf('function setSettingsOpen('))
  .replace('import("./liquid-lens.js?v=2")', 'loadLensModule()');

function lensRuntime(loadLensModule) {
  const attributes = {};
  const values = {};
  const fields = { '.control-chip__icon': {}, '.control-chip__value': {} };
  const button = {
    querySelector: selector => fields[selector],
    setAttribute: (key, value) => { attributes[key] = value; },
    classList: { toggle() {} }
  };
  const context = vm.createContext({
    loadLensModule, lensButton: button, storage: { setItem: (key, value) => { values[key] = value; } },
    LENS_KEY: 'fz-lens', svgIcon: () => '<svg></svg>', translate: value => value,
    console: { error() {} }
  });
  vm.runInContext(`let LiquidLens = null, lensModulePromise = null, lensRequested = false, lensRequestId = 0, lensUnavailableReason = '';\n${lensFunctions}`, context);
  return { apply: enabled => context.applyLens(enabled), attributes, values, button, context };
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('default/off FX does not fetch or initialize the optional effect', async () => {
  let imports = 0;
  const runtime = lensRuntime(() => { imports++; throw new Error('should not load'); });
  await runtime.apply(false);
  assert.equal(imports, 0);
  assert.equal(runtime.attributes['aria-pressed'], 'false');
  assert.equal(runtime.values['fz-lens'], 'off');
});

test('turning FX off during a slow import prevents late activation', async () => {
  const pending = deferred();
  let starts = 0;
  const runtime = lensRuntime(() => pending.promise);
  const turningOn = runtime.apply(true);
  assert.equal(runtime.attributes['aria-pressed'], 'true');
  await runtime.apply(false);
  pending.resolve({ LiquidLens: { init() { starts++; }, destroy() {} } });
  await turningOn;
  assert.equal(starts, 0);
  assert.equal(runtime.attributes['aria-pressed'], 'false');
  assert.equal(runtime.values['fz-lens'], 'off');
});

test('rapid on/off/on changes share one import and initialize only the current request', async () => {
  const pending = deferred();
  let imports = 0, starts = 0;
  const runtime = lensRuntime(() => { imports++; return pending.promise; });
  const first = runtime.apply(true);
  await runtime.apply(false);
  const last = runtime.apply(true);
  pending.resolve({ LiquidLens: { init() { starts++; }, destroy() {} } });
  await Promise.all([first, last]);
  assert.equal(imports, 1);
  assert.equal(starts, 1);
  assert.equal(runtime.attributes['aria-pressed'], 'true');
});

test('an unavailable effect leaves the page usable and can be retried', async () => {
  let imports = 0, starts = 0;
  const runtime = lensRuntime(() => ++imports === 1 ? Promise.reject(new Error('offline')) :
    Promise.resolve({ LiquidLens: { init() { starts++; }, destroy() {} } }));
  await runtime.apply(true);
  assert.equal(runtime.attributes['aria-pressed'], 'false');
  assert.equal(runtime.values['fz-lens'], 'off');
  await runtime.apply(true);
  assert.equal(starts, 1);
});

test('unavailable FX keeps its accessible explanation when controls are rendered again', () => {
  const runtime = lensRuntime(() => {});
  vm.runInContext(`lensUnavailableReason = 'FX unavailable in Safari'; renderLensControl(false);`, runtime.context);
  assert.equal(runtime.button.title, 'FX unavailable in Safari');
  assert.equal(runtime.attributes['aria-label'], 'FX unavailable in Safari');
});

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(full) : entry.name.endsWith('.html') ? [full] : [];
  });
}

test('site pages paint a canvas before network assets and load optional fonts without blocking', () => {
  for (const file of [path.join(root, 'index.html'), ...htmlFiles(path.join(root, 'pages'))]) {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('assets/css/site.css')) continue;
    const head = html.slice(0, html.indexOf('</head>'));
    assert.ok(head.search(/<meta\s+charset=/i) < 1024, file);
    assert.ok(head.indexOf('data-canvas-startup') < head.search(/<script[^>]+src=/), file);
    assert.doesNotMatch(head, /<link[^>]+rel="stylesheet"[^>]+href="https:/, file);
    const fonts = head.match(/<link[^>]+fonts\.css[^>]+>/)?.[0];
    assert.match(fonts || '', /media="print"/, file);
    assert.match(fonts, /onload=/, file);
    assert.match(head.match(/<script[^>]+src="[^"]*favicon\.js[^"]*"[^>]*>/)?.[0] || "", /defer/, file);
  }
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'assets/css/site.css'), 'utf8'), /@import/);
});

test('timeline text is in the initial HTML and images reserve space before downloading', () => {
  for (const name of ['science', 'finance']) {
    const html = fs.readFileSync(path.join(root, `pages/${name}/index.html`), 'utf8');
    assert.ok((html.match(/class="timeline-item"/g) || []).length > 1);
    for (const image of html.match(/<img[^>]*class="timeline-media"[^>]*>/g) || []) {
      assert.match(image, /width="[1-9]\d*"/);
      assert.match(image, /height="[1-9]\d*"/);
      assert.match(image, /loading="lazy"/);
      assert.match(image, /decoding="async"/);
    }
  }
});


test('first-paint theme and language still initialize when preference storage is blocked', () => {
  for (const name of ['index.html', 'pages/science/index.html', 'pages/finance/quant-method-story/index.html', 'pages/finance/quant-engineering-trajectory/index.html']) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    const startup = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].find(match => match[1].includes('window.__fzThemeMode'))[1];
    const toggles = {};
    const document = { documentElement: { classList: { toggle: (name, active) => { toggles[name] = active; } }, dataset: {}, style: {} } };
    const matchMedia = () => ({ matches: true });
    vm.runInNewContext(startup, { document, window: { matchMedia }, matchMedia, localStorage: { getItem() { throw new Error('blocked'); } } });
    assert.equal(toggles['theme-light'], true, name);
    assert.equal(document.documentElement.lang, 'en', name);
  }
});

test('the method reader defers cacheable scripts and preserves the reviewed renderer bytes', () => {
  const crypto = require('node:crypto');
  const directory = path.join(root, 'pages/finance/quant-method-story');
  const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
  const expected = html.match(/name="data-app-runtime-sha256" content="([^"]+)"/)[1];
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, 'runtime.js'))).digest('hex'), expected);
  assert.doesNotMatch(html, /src="data:text\/javascript/);
  const scripts = [...html.matchAll(/<script\b([^>]*src="\.\/(?:report-i18n|runtime|report-app)\.js[^>]*)>/g)];
  assert.equal(scripts.length, 3);
  scripts.forEach(script => assert.match(script[1], /\bdefer\b/));
  assert.ok(html.indexOf('./report-i18n.js') < html.indexOf('./runtime.js'));
  assert.ok(html.indexOf('./runtime.js') < html.indexOf('./report-app.js'));
  assert.match(html, /data-report-preview[\s\S]*My Quant project began/);
  assert.match(html, /data-report-preview[\s\S]*我的量化项目起步/);
});

test('the engineering reader switches content atomically without rebuilding article chrome', () => {
  const classes = new Set();
  const listeners = {};
  const attributes = new Map([['data-reading-active', '']]);
  const block = { dataset: { artifactBlockId: '02-intro' }, getBoundingClientRect: () => ({ top: 100, bottom: 500 }), removeAttribute() {} };
  const fallback = {
    querySelectorAll: () => [block],
    removeAttribute: name => attributes.delete(name),
    setAttribute: (name, value) => attributes.set(name, value),
  };
  const enhancedAttributes = new Map([['aria-hidden', 'true'], ['inert', '']]);
  let scrollAdjustment;
  let readyEvent;
  const reader = {
    querySelector: () => ({ getBoundingClientRect: () => ({ top: 120 }) }),
    setAttribute: (name, value) => enhancedAttributes.set(name, value),
    removeAttribute: name => enhancedAttributes.delete(name),
    addEventListener: (name, listener) => { listeners[name] = listener; },
    dispatchEvent: event => { readyEvent = event.type; },
  };
  const document = {
    getElementById: id => id.includes('fallback') ? fallback : reader,
    querySelector: () => ({ getBoundingClientRect: () => ({ bottom: 80 }) }),
    body: { classList: { add: name => classes.add(name), contains: name => classes.has(name) } },
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'pages/finance/quant-engineering-trajectory/report-layout.js'), 'utf8'), {
    document, scrollY: 450, scrollBy: options => { scrollAdjustment = options.top; },
    CustomEvent: class { constructor(type) { this.type = type; } },
  });
  assert.equal(classes.size, 0); // Semantic content stays visible while the renderer waits.
  listeners['reading:enhanced-ready']();
  assert.ok(classes.has('report-ready'));
  assert.equal(attributes.has('data-reading-active'), false);
  assert.equal(enhancedAttributes.has('data-reading-active'), true);
  assert.equal(enhancedAttributes.has('aria-hidden'), false);
  assert.equal(enhancedAttributes.has('inert'), false);
  assert.equal(scrollAdjustment, 20);
  assert.equal(readyEvent, 'reading:ready');
});
