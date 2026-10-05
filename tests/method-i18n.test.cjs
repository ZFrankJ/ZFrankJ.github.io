const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const crypto = require("node:crypto");

const directory = path.resolve(__dirname, "../pages/finance/quant-method-story");
const html = fs.readFileSync(path.join(directory, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
const snapshot = JSON.parse(scripts.filter(match => /id="data-app-reviewed-snapshot"|data-app-snapshot-chunk/.test(match[1])).map(match => match[2]).join(""));
const program = scripts.at(-1)[2];
const authored = program.slice(program.indexOf("var jsxRuntime ="), program.indexOf("\n})(__dataAuthoredModule"));
const localization = fs.readFileSync(path.join(directory, "report-i18n.js"), "utf8");

class Element {
  constructor(children = []) {
    this.children = children;
    this.attributes = {};
    children.forEach(child => child.parentElement = this);
  }
  closest() { return null; }
  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, value) { this.attributes[name] = value; }
  querySelectorAll() { return []; }
}

function environment(language = "en") {
  const events = new Map();
  const generatedText = { nodeType: 3, nodeValue: "Hover or select a point to inspect its coordinates and return." };
  const body = new Element([generatedText]);
  const content = new Element();
  const downloads = new Element();
  const description = new Element();
  const document = {
    body, title: "",
    documentElement: { dataset: { language } },
    getElementById(id) { return id === "root" ? content : null; },
    querySelector(selector) {
      return selector === ".journal-downloads" ? downloads : selector === 'meta[name="description"]' ? description : null;
    },
    addEventListener(name, callback) {
      if (!events.has(name)) events.set(name, new Set());
      events.get(name).add(callback);
    },
    removeEventListener(name, callback) { events.get(name)?.delete(callback); },
    createTreeWalker(root) {
      const texts = root.nodeType === 3 ? [] : root.children || [];
      let index = 0;
      return { nextNode: () => texts[index++] || null };
    }
  };
  let observe;
  const context = vm.createContext({
    document, Element, Node: { TEXT_NODE: 3 }, NodeFilter: { SHOW_TEXT: 4 },
    MutationObserver: class { constructor(callback) { observe = callback; } observe() {} },
  });
  vm.runInContext(localization, context);
  return {
    context, document, generatedText, content, downloads, description,
    setLanguage(next) {
      document.documentElement.dataset.language = next;
      events.get("fz:languagechange")?.forEach(callback => callback({ detail: { language: next } }));
    },
    replaceGeneratedText(value) {
      generatedText.nodeValue = value;
      observe([{ type: "characterData", target: generatedText, addedNodes: [] }]);
    }
  };
}

function renderer(runtime, { appTitle = snapshot.title, canEdit = false, mode = "view" } = {}) {
  const instances = new Map();
  let active;
  function render(type, props = {}) {
    if (typeof type !== "function") return { type, props };
    const key = `${type.name}:${props.name || props.id || ""}`;
    if (!instances.has(key)) instances.set(key, { state: [], effects: new Set() });
    const previous = active;
    active = { ...instances.get(key), cursor: 0 };
    const result = type(props);
    active = previous;
    return result;
  }
  const React = {
    useState(initial) {
      const slot = active.cursor++;
      const state = active.state;
      if (!(slot in state)) state[slot] = typeof initial === "function" ? initial() : initial;
      return [state[slot], value => state[slot] = typeof value === "function" ? value(state[slot]) : value];
    },
    useEffect(callback) {
      const slot = active.cursor++;
      if (!active.effects.has(slot)) { active.effects.add(slot); callback(); }
    },
    useMemo(callback) { return callback(); },
    useRef(initial) { return this.useState(() => ({ current: initial }))[0]; }
  };
  const dataApp = new Proxy({
    useDataApp: () => ({
      snapshot, appTitle, canEdit, mode, setAppTitle: () => {},
      reviewedRows: id => snapshot.queries[id].rows,
    })
  }, { get(target, key) { return key in target ? target[key] : key; } });
  runtime.context.require = name => name === "react" ? React : name === "react/jsx-runtime" ? { jsx: render, jsxs: render } : dataApp;
  runtime.context.exports = {};
  vm.runInContext(authored, runtime.context);
  return () => render(runtime.context.exports.ReportContent);
}

function allNodes(value) {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(allNodes);
  return [value, ...allNodes(value.props?.children)];
}

function visibleCopy(tree) {
  return allNodes(tree).flatMap(node => {
    const props = node.props || {};
    return [props.value, props.title, props.description, props["aria-label"], props.children].flatMap(value =>
      typeof value === "string" ? [value] : Array.isArray(value) ? value.filter(item => typeof item === "string") : []);
  });
}

test("the authored report is valid JavaScript and has a complete Chinese narrative", () => {
  new vm.Script(program);
  const runtime = environment("zh");
  const tree = renderer(runtime)();
  const narrative = allNodes(tree).filter(node => node.type === "RichNarrative");
  assert.equal(narrative.length, 12);
  for (const block of narrative) {
    if (block.props.id === "std:figure-heading") assert.equal(block.props.value, "");
    else assert.match(block.props.value, /[\u3400-\u9fff]/, block.props.id);
  }
  const text = visibleCopy(tree).join("\n");
  assert.match(text, /技术|量化/);
  assert.match(text, /超过 7 万元人民币/);
  assert.doesNotMatch(text, /已经赚到了\*\*约合/);
  assert.doesNotMatch(text, /万元人民币以上|阈值|6\.74 万元/);
  assert.match(text, /从阀值到标准差：寻找数据规律/);
  assert.doesNotMatch(text, /\bSTD\b/);
  assert.match(text, /将有符号的局部偏离表示为\*\*标准差的倍数\*\*/);
  assert.doesNotMatch(text, /US\$10,000|My Quant project began|The cloud is elongated/);
  assert.match(text, /1,212/); assert.match(text, /1,000/); assert.match(text, /1,601/);
  assert.match(text, /0\.82/); assert.match(text, /0\.63/); assert.match(text, /0\.47/);
  assert.match(text, /样本方差分母是 n − 1/);
  assert.match(text, /点云呈长条形，而不是球形。/);
  assert.doesNotMatch(text, /拉长形/);
});

test("language round trips preserve the English text, camera, and reviewed data", () => {
  const runtime = environment("en");
  const render = renderer(runtime);
  let tree = render();
  assert.match(visibleCopy(tree).join("\n"), /more than US\$10,000/);
  const preset = allNodes(tree).find(node => node.type === "button" && node.props.children === "Slow–fast");
  preset.props.onClick();
  tree = render();
  const english = visibleCopy(tree);
  const positions = () => allNodes(tree).filter(node => node.type === "circle").map(node => [node.props.cx, node.props.cy, node.props.fill]);
  const camera = positions();
  runtime.setLanguage("zh");
  tree = render();
  assert.deepEqual(positions(), camera);
  assert.ok(allNodes(tree).some(node => node.type === "button" && node.props.children === "慢速–快速"));
  const axisTitles = allNodes(tree).filter(node => node.props?.className === "cloud-axis-title").map(node => node.props.children);
  assert.deepEqual(axisTitles.sort(), ["慢速标准差偏离", "快速标准差偏离"].sort());
  const density = allNodes(tree).find(node => node.type === "EvidenceChart");
  assert.equal(density.props.rows, snapshot.queries.threshold_density.rows);
  assert.equal(density.props.spec.x, "price"); assert.equal(density.props.spec.y, "density");
  assert.equal(density.props.spec.xLabel, "收盘价");
  assert.match(density.props.spec.annotations[0].label, /全局核密度网格峰值/);
  runtime.setLanguage("en");
  tree = render();
  const restored = visibleCopy(tree);
  assert.equal(restored.length, english.length);
  restored.forEach((value, index) => assert.equal(value, english[index], `restored text ${index}`));
  assert.deepEqual(positions(), camera);
  assert.equal(runtime.content.lang, "en"); assert.equal(runtime.downloads.lang, "en");
});

test("RMB uses the dated CFETS rate and retains English USD and unchanged percentage returns", () => {
  const runtime = environment("zh");
  const locale = runtime.context.__fzMethodI18n;
  assert.equal(locale.fx.date, "2026-09-30"); assert.equal(locale.fx.usdCny, 6.7351);
  assert.equal(locale.earningsThresholdCny, 67351);
  assert.match(locale.story("story:evidence", "", "zh"), /已经赚到了\*\*超过 7 万元人民币\*\*/);
  assert.equal(locale.translate("+12.34%", "zh"), "+12.34%");
  assert.match(locale.fx.source, /^https:\/\/www\.chinamoney\.com\.cn\//);
});

test("Chinese expands STD while distinguishing standard deviation from normalized deviation", () => {
  const runtime = environment("zh");
  const tree = renderer(runtime)();
  const axes = allNodes(tree).filter(node => node.props?.className === "cloud-axis-title").map(node => node.props.children);
  assert.deepEqual(axes.sort(), ["中速标准差偏离", "慢速标准差偏离", "快速标准差偏离"].sort());
  assert.doesNotMatch(visibleCopy(tree).join("\n"), /\bSTD\b/);
  const translate = runtime.context.__fzMethodI18n.translate;
  for (const label of ["The STD stage", "STD cloud & return labels · CSV ↗",
    "Figure 2 · The three-dimensional STD state space", "Three-dimensional STD state vector",
    "Interactive STD state space from the exact repository command", "STD coordinate",
    "Rotatable STD state space: 1,601 exact copied observations, colored by 20-day forward price return"]) {
    assert.match(translate(label, "zh"), /标准差/);
    assert.doesNotMatch(translate(label, "zh"), /\bSTD\b/);
    assert.equal(translate(label, "en"), label);
  }
  assert.match(translate("STD coordinate", "zh"), /偏离/);
});

test("generated inspector text and accessibility labels stay localized when values change", () => {
  const runtime = environment("zh");
  runtime.replaceGeneratedText("P0001 · Slow 1.234 · Medium -2.345 · Fast 3.456 · Forward return (20-day) +12.34%");
  assert.match(runtime.generatedText.nodeValue, /P0001 · 慢速 1\.234 · 中速 -2\.345/);
  runtime.replaceGeneratedText("P0002 · Slow 2.234 · Medium -1.345 · Fast 4.456 · Forward return (20-day) -2.00%");
  assert.match(runtime.generatedText.nodeValue, /P0002 · 慢速 2\.234/);
  runtime.setLanguage("en");
  assert.match(runtime.generatedText.nodeValue, /P0002 · Slow 2\.234/);
  runtime.setLanguage("zh");
  assert.match(runtime.generatedText.nodeValue, /P0002 · 慢速 2\.234/);
  assert.equal(runtime.document.title, "从阀值到标准差：寻找数据规律");
  assert.equal(runtime.content.lang, "zh-CN");
  assert.equal(runtime.description.getAttribute("content"), "从固定价格阀值到三维标准差偏离状态，记录我如何从数据中寻找规律。");
});

test("all source explanations and prose reproduction steps have Chinese translations", () => {
  const runtime = environment("zh");
  const translate = runtime.context.__fzMethodI18n.translate;
  for (const [id, query] of Object.entries(snapshot.queries)) {
    const descriptions = [query.source.label, ...query.source.filters,
      ...query.source.metricDefinitions.flatMap(metric => [metric.label, metric.definition]),
      ...query.source.evidenceFlow.flatMap(step => [step.title, step.detail]),
      ...query.methods.map(method => method.code)];
    for (const value of descriptions) {
      assert.match(translate(value, "zh"), /[\u3400-\u9fff]/, `${id}: ${value.slice(0, 65)}`);
      assert.doesNotMatch(translate(value, "zh"), /\bSTD\b/);
    }
  }
  // Human-readable instructions inside a code-styled panel localize; actual notation does not.
  runtime.generatedText.parentElement.closest = selector => selector === "pre, code";
  const source = snapshot.queries.threshold_density.methods[0].code;
  runtime.replaceGeneratedText(source);
  assert.match(runtime.generatedText.nodeValue, /^独立绘图/);
  runtime.setLanguage("en");
  assert.equal(runtime.generatedText.nodeValue, source);
  runtime.replaceGeneratedText("r(t,20) = x(t+20) / x(t) - 1");
  runtime.setLanguage("zh");
  assert.equal(runtime.generatedText.nodeValue, "r(t,20) = x(t+20) / x(t) - 1");
});

test("the highlight is bilingual, remains same-tab, and loads the localization before the report", () => {
  const homepage = fs.readFileSync(path.resolve(directory, "../../../index.html"), "utf8");
  assert.match(homepage, /Tech blog →/); assert.match(homepage, /技术博客 →/);
  assert.match(homepage, /金融 · 从阀值到标准差：寻找数据规律/);
  assert.match(homepage, /从数据中寻找规律。/);
  const finance = fs.readFileSync(path.resolve(directory, "../index.html"), "utf8");
  assert.match(finance, /从阀值到标准差：寻找数据规律/);
  assert.match(html, /02 · 阀值阶段/);
  assert.match(html, /03 · 标准差阶段/);
  assert.doesNotMatch(homepage.match(/<a href="\.\/pages\/finance\/quant-method-story\/"[^>]*>/)[0], /target=/);
  assert.ok(html.indexOf('src="./report-i18n.js?v=9"') < html.indexOf('id="data-app-reviewed-snapshot"'));
});

test("public privacy wording names ETF codes and names without an exchange-rate footnote", () => {
  const runtime = environment("zh");
  const tree = renderer(runtime)();
  const copy = visibleCopy(tree).join("\n");
  assert.match(copy, /移除 ETF 代码、名称和私人信息/);
  assert.match(copy, /不包含 ETF 代码与名称、逐条日期/);
  assert.doesNotMatch(copy, /身份标识|标的身份/);
  assert.doesNotMatch(localization, /身份标识|标的身份|method-fx-note/);
  assert.doesNotMatch(html, /method-fx-note|人民币金额按|1 美元 = 6\.7351/);
  assert.match(html, /remove ETF codes and names, along with private information/);
});

test("English and Chinese titles keep threshold-to-STD and data-patterns framing", () => {
  const english = "From a Threshold to STD: Finding Patterns in Data";
  const chinese = "从阀值到标准差：寻找数据规律";
  const runtime = environment("en");
  const render = renderer(runtime);
  const heading = tree => allNodes(tree).find(node => node.type === "h1").props.children;
  assert.equal(snapshot.title, english);
  assert.equal(runtime.document.title, english);
  assert.equal(heading(render()), english);
  assert.ok(html.includes(`<title>${english}</title>`));
  runtime.setLanguage("zh");
  assert.equal(runtime.document.title, chinese);
  assert.equal(heading(render()), chinese);
  runtime.setLanguage("en");
  assert.equal(runtime.document.title, english);
  assert.equal(heading(render()), english);
  assert.match(runtime.description.getAttribute("content"), /find patterns in data/);
  const homepage = fs.readFileSync(path.resolve(directory, "../../../index.html"), "utf8");
  const finance = fs.readFileSync(path.resolve(directory, "../index.html"), "utf8");
  assert.match(homepage, /Finance · From a threshold to STD: finding patterns in data/);
  assert.ok(finance.includes(english));
  for (const page of [html, homepage, finance, localization]) {
    assert.doesNotMatch(page, /Learning to Describe a Changing State|describing a changing state|learned to describe a changing market state/);
    assert.doesNotMatch(page, /build(?:ing)? trading strategies|构建交易策略/i);
  }
});

test("the reviewed snapshot hash remains valid after its title changes", () => {
  const raw = scripts.filter(match => /id="data-app-reviewed-snapshot"|data-app-snapshot-chunk/.test(match[1])).map(match => match[2]).join("");
  const expected = html.match(/name="data-app-snapshot-sha256" content="([^"]+)"/)[1];
  assert.equal(crypto.createHash("sha256").update(raw).digest("hex"), expected);
});

test("a saved authoring title cannot replace the published bilingual reader heading", () => {
  const runtime = environment("en");
  const render = renderer(runtime, {
    appTitle: "From a Threshold to STD: Learning to Describe a Changing State",
    canEdit: true, mode: "view",
  });
  const heading = tree => allNodes(tree).find(node => node.type === "h1").props.children;
  assert.equal(heading(render()), snapshot.title);
  runtime.setLanguage("zh");
  assert.equal(heading(render()), "从阀值到标准差：寻找数据规律");
  runtime.setLanguage("en");
  assert.equal(heading(render()), snapshot.title);
  const editor = renderer(environment("en"), { appTitle: "Draft article title", canEdit: true, mode: "edit" });
  assert.equal(heading(editor()), "Draft article title");
});
