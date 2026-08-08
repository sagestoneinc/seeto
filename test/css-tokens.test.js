import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('css/style.css', 'utf8');

// A var(--roofline-ink) reference against a token actually named --ink silently resolved
// to nothing, so a full-width Ink band rendered transparent and its Bone text became
// invisible. CSS fails quietly like this, so the check has to be explicit.
test('every var() reference resolves to a defined custom property', () => {
  const used = new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]));
  const defined = new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
  const missing = [...used].filter((v) => !defined.has(v)).sort();
  assert.deepEqual(missing, [], `undefined CSS custom properties: ${missing.join(', ')}`);
});

test('the brand palette keeps the exact hex values from the brand kit', () => {
  const expected = {
    '--seeto-red': '#8E1B1B',
    '--brick': '#6B1212',
    '--ink': '#17130F',
    '--bone': '#F5F1EA',
    '--sand': '#EFE9DE',
    '--stone': '#6E665C',
    '--prairie-gold': '#C9A227',
  };
  for (const [token, hex] of Object.entries(expected)) {
    const found = new RegExp(`${token}\\s*:\\s*(#[0-9A-Fa-f]{6})`).exec(css);
    assert.ok(found, `brand token ${token} is missing`);
    assert.equal(found[1].toUpperCase(), hex, `${token} drifted from the brand kit`);
  }
});

test('the semantic token layer the brief requires exists', () => {
  for (const t of ['--color-primary', '--color-secondary', '--color-accent',
                   '--color-background', '--color-surface', '--color-text-primary',
                   '--color-text-secondary', '--color-border']) {
    assert.match(css, new RegExp(`${t}\\s*:`), `missing semantic token ${t}`);
  }
});

test('no off-brand colour families are introduced', () => {
  // Brand rule: no generic blue real-estate styling, no purple gradients.
  const hexes = [...css.matchAll(/#([0-9A-Fa-f]{6})\b/g)].map((m) => m[1].toLowerCase());
  const offBrand = hexes.filter((h) => {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 40) return false;            // near-neutral is fine
    return b === max && b - r > 40;              // blue/purple dominant
  });
  assert.deepEqual(offBrand, [], `off-brand blue/purple hex values: ${offBrand.join(', ')}`);
});
