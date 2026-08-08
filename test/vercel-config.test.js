import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// A "_comment" key placed inside a header entry once broke four consecutive production
// deploys. Vercel rejects vercel.json with additional properties BEFORE the build runs, so
// it produces no build logs and looks like auto-deploy silently not firing. These tests
// catch a malformed config locally instead.
const cfg = JSON.parse(readFileSync('vercel.json', 'utf8'));

test('vercel.json is valid JSON with the expected top-level keys', () => {
  const allowed = new Set([
    '$schema', 'framework', 'buildCommand', 'outputDirectory', 'cleanUrls',
    'trailingSlash', 'headers', 'redirects', 'rewrites', 'installCommand',
    'devCommand', 'regions', 'ignoreCommand',
  ]);
  for (const key of Object.keys(cfg)) {
    assert.ok(allowed.has(key), `unknown top-level vercel.json key "${key}"`);
  }
});

test('every header rule has only source and headers', () => {
  for (const rule of cfg.headers ?? []) {
    assert.deepEqual(
      Object.keys(rule).sort(),
      ['headers', 'source'],
      `header rule for "${rule.source}" has unexpected keys`
    );
  }
});

test('every header entry has exactly key and value — nothing else', () => {
  for (const rule of cfg.headers ?? []) {
    for (const entry of rule.headers) {
      assert.deepEqual(
        Object.keys(entry).sort(),
        ['key', 'value'],
        `header "${entry.key ?? JSON.stringify(entry)}" under "${rule.source}" ` +
          'has additional properties; Vercel rejects the whole deployment for this'
      );
      assert.equal(typeof entry.key, 'string');
      assert.equal(typeof entry.value, 'string');
    }
  }
});

test('demo deployment still sends X-Robots-Tag noindex', () => {
  const all = (cfg.headers ?? []).flatMap((r) => r.headers);
  const robots = all.find((h) => h.key === 'X-Robots-Tag');
  assert.ok(robots, 'X-Robots-Tag missing — the demo would become crawlable');
  assert.match(robots.value, /noindex/);
});
