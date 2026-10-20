const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const test = require('node:test');

const directory = path.resolve(__dirname, '../pages/finance/quant-engineering-trajectory');
const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
const encoded = html.match(/<template id="data-analytics-portable-artifact-payload-source"[^>]*>([\s\S]*?)<\/template>/)[1];
const payload = zlib.gunzipSync(Buffer.from(encoded.replace(/\s/g, ''), 'base64')).toString();

test('performance copy speaks in the author voice in both report renderers', () => {
  assert.doesNotThrow(() => JSON.parse(payload));
  for (const content of [html, payload]) {
    assert.doesNotMatch(content, /owner-provided/i);
    assert.match(content, /Ten-year result/);
    assert.match(content, /Five-year performance distribution/);
    assert.match(content, /These figures are my aggregate results, not independently audited calculations/);
    assert.match(content, /not guaranteed future returns or investment advice/);
  }
  const localization = fs.readFileSync(path.join(directory, 'report-i18n.js'), 'utf8');
  assert.match(localization, /\["Ten-year result", "十年结果"\]/);
  assert.doesNotMatch(localization, /owner-provided|所有者提供的/);
});
