const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const test = require('node:test');
const root = path.resolve(__dirname, '..');

test('engineering table overflow fades match the table surface and outer corners', () => {
  const css = fs.readFileSync(path.join(root, 'pages/finance/quant-engineering-trajectory/report.css'), 'utf8');
  assert.match(css, /\.table-scroll-shell\s*\{\s*--table-scroll-edge-surface: var\(--panel-strong\) !important;/);
  assert.doesNotMatch(css, /--table-scroll-edge-surface:\s*#(?:fff|000)\b/);
  for (const side of ['left', 'right']) {
    const rule = css.match(new RegExp(`\\.table-scroll-edge-${side}\\s*\\{([^}]+)\\}`))[1];
    for (const end of ['top', 'bottom']) {
      assert.match(rule, new RegExp(`border-${end}-${side}-radius: inherit;`));
    }
  }
});

test('technical articles ship the same catalog and title components outside their renderers', () => {
  const build = spawnSync('python3', ['scripts/build-reading-shells.py', '--check'], { cwd: root, encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr);
  for (const article of JSON.parse(fs.readFileSync(path.join(root, 'assets/data/articles.json'), 'utf8'))) {
    const html = fs.readFileSync(path.join(root, article.path), 'utf8');
    assert.equal((html.match(/data-reading-catalog/g) || []).length, 1);
    assert.equal((html.match(/class="reading-hero"/g) || []).length, 1);
    assert.ok(html.indexOf('data-reading-catalog') < html.indexOf('data-reading-content'));
    assert.ok(html.indexOf('class="reading-hero"') < html.indexOf('data-reading-content'));
    assert.match(html.slice(0, html.indexOf('</head>')), /assets\/js\/reading\.js\?v=1/);
    assert.doesNotMatch(html, /report-loading-shell|report-chapter-navigation-runtime/);
    const catalog = html.slice(html.indexOf('data-reading-catalog'), html.indexOf('<!-- reading:catalog:end -->'));
    for (const chapter of article.chapters) assert.ok(catalog.includes(`href="#${chapter.id}"`));
  }
});

function catalogEnvironment(hash = '') {
  const listeners = {}, readingEvents = {}, catalogEvents = {};
  const pending = [];
  let targets;
  let context;
  let mutation;
  const landings = [];
  const links = ['intro', 'middle', 'last'].map(id => ({
    hash: `#${id}`, attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
  }));
  function makeTargets(generation) {
    return Object.fromEntries(['intro', 'middle', 'last'].map((id, i) => [id, {
      getBoundingClientRect: () => ({ top: [0, 600, 950][i] - context.scrollY }),
      scrollIntoView: options => landings.push({ id, generation, behavior: options.behavior }),
      focus() {},
    }]));
  }
  const active = { querySelector: selector => targets[selector.match(/id="(.*)"/)[1]] || null };
  const content = { querySelector: () => active };
  const catalog = { querySelectorAll: () => links, addEventListener: (name, callback) => { catalogEvents[name] = callback; } };
  const reading = {
    querySelector: selector => selector.includes('catalog') ? catalog : content,
    addEventListener: (name, callback) => { readingEvents[name] = callback; },
  };
  const location = { hash };
  context = vm.createContext({
    document: { querySelectorAll: () => [reading], querySelector: () => ({ getBoundingClientRect: () => ({ bottom: 80 }) }), documentElement: { scrollHeight: 1100 } },
    window: { matchMedia: () => ({ matches: true }), addEventListener: (name, callback) => { listeners[name] = callback; } },
    location, CSS: { escape: value => value }, scrollY: 0, innerHeight: 600,
    history: { pushState: (_state, _title, hash) => { location.hash = hash; } },
    requestAnimationFrame: callback => { pending.push(callback); return pending.length; },
    ResizeObserver: class { observe() {} },
    MutationObserver: class { constructor(callback) { mutation = callback; } observe() {} },
  });
  targets = makeTargets('static');
  const source = fs.readFileSync(path.join(root, 'assets/js/reading.js'), 'utf8').replace('export function', 'function');
  vm.runInContext(source, context);
  const flush = () => { for (let turns = 0; pending.length && turns < 20; turns++) pending.shift()(); assert.equal(pending.length, 0); };
  flush();
  return { links, landings, location, context, listeners, flush,
    click(index, modifiers = {}) {
      let prevented = false;
      catalogEvents.click({ button: 0, target: { closest: () => links[index] }, preventDefault: () => { prevented = true; }, ...modifiers });
      flush(); return prevented;
    },
    hydrate() { targets = makeTargets('enhanced'); mutation(); readingEvents['reading:ready'](); flush(); },
  };
}

test('shared catalog keeps chapter selection and deep links through delayed hydration', () => {
  const page = catalogEnvironment('#last');
  assert.equal(page.landings.at(-1).generation, 'static');
  assert.equal(page.links[2].attributes['aria-current'], 'location');
  page.hydrate();
  assert.equal(page.landings.at(-1).generation, 'enhanced');
  assert.equal(page.landings.at(-1).id, 'last');
  assert.equal(page.click(1, { ctrlKey: true }), false);
  assert.equal(page.location.hash, '#last');
  assert.equal(page.click(1), true);
  assert.equal(page.location.hash, '#middle');
  assert.equal(page.landings.at(-1).behavior, 'instant'); // Reduced motion.
  page.context.scrollY = 500;
  page.listeners.wheel(); page.flush();
  assert.equal(page.links[2].attributes['aria-current'], 'location');
});

test('malformed chapter hashes leave the catalog usable', () => {
  const page = catalogEnvironment('#%');
  assert.equal(page.links[0].attributes['aria-current'], 'location');
  assert.equal(page.click(1), true);
  assert.equal(page.links[1].attributes['aria-current'], 'location');
});
