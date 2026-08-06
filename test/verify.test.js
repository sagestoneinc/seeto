import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyPage, verifyLinks, BANNED_STRINGS } from '../build/verify.js';

const good = `<!DOCTYPE html><html><head>
<title>Seeto Realty | Homes in DFW</title>
<meta name="description" content="Search homes for sale across Dallas-Fort Worth and Houston with Seeto Realty.">
<link rel="canonical" href="https://www.seetorealty.com/">
</head><body><h1>Find your place</h1>
<img src="/a.jpg" alt="A home" width="800" height="600">
</body></html>`;

test('verifyPage passes a well-formed page', () => {
  assert.deepEqual(verifyPage(good, '/index.html'), []);
});

test('verifyPage flags a missing title', () => {
  const errors = verifyPage(good.replace(/<title>.*<\/title>/, ''), '/index.html');
  assert.ok(errors.some((e) => e.includes('title')));
});

test('verifyPage flags a title longer than 60 characters', () => {
  const long = `<title>${'x'.repeat(61)}</title>`;
  const errors = verifyPage(good.replace(/<title>.*<\/title>/, long), '/index.html');
  assert.ok(errors.some((e) => e.includes('60')));
});

test('verifyPage flags a description longer than 155 characters', () => {
  const long = `<meta name="description" content="${'x'.repeat(156)}">`;
  const errors = verifyPage(good.replace(/<meta name="description"[^>]*>/, long), '/index.html');
  assert.ok(errors.some((e) => e.includes('155')));
});

test('verifyPage flags a missing canonical', () => {
  const errors = verifyPage(good.replace(/<link rel="canonical"[^>]*>/, ''), '/index.html');
  assert.ok(errors.some((e) => e.includes('canonical')));
});

test('verifyPage flags zero and multiple h1 elements', () => {
  assert.ok(verifyPage(good.replace(/<h1>.*<\/h1>/, ''), '/x').some((e) => e.includes('h1')));
  assert.ok(
    verifyPage(good.replace('</body>', '<h1>Second</h1></body>'), '/x').some((e) =>
      e.includes('h1')
    )
  );
});

test('verifyPage flags an image missing alt, width, or height', () => {
  assert.ok(verifyPage(good.replace(/ alt="A home"/, ''), '/x').some((e) => e.includes('alt')));
  assert.ok(verifyPage(good.replace(/ width="800"/, ''), '/x').some((e) => e.includes('width')));
  assert.ok(verifyPage(good.replace(/ height="600"/, ''), '/x').some((e) => e.includes('height')));
});

test('verifyPage flags retired placeholder NAP values', () => {
  const errors = verifyPage(good.replace('Find your place', 'Call 555-SEETO'), '/x');
  assert.ok(errors.some((e) => e.includes('555-SEETO')));
});

test('verifyPage flags an emoji in the markup', () => {
  const errors = verifyPage(good.replace('Find your place', 'Find your place 🏠'), '/x');
  assert.ok(errors.some((e) => e.includes('emoji')));
});

test('BANNED_STRINGS covers every retired placeholder value', () => {
  assert.ok(BANNED_STRINGS.includes('555-SEETO'));
  assert.ok(BANNED_STRINGS.includes('123 Main Street'));
  assert.ok(BANNED_STRINGS.includes('456 Market St'));
});

test('verifyLinks resolves an internal link that exists', () => {
  const pages = new Map([
    ['/index.html', '<a href="/buy.html">Buy</a>'],
    ['/buy.html', '<a href="/index.html">Home</a>'],
  ]);
  assert.deepEqual(verifyLinks(pages, []), []);
});

test('verifyLinks reports a broken internal link', () => {
  const pages = new Map([['/index.html', '<a href="/ghost.html">Ghost</a>']]);
  const errors = verifyLinks(pages, []);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes('/ghost.html'));
});

test('verifyLinks ignores external, mailto, tel, and hash links', () => {
  const pages = new Map([
    [
      '/index.html',
      '<a href="https://x.com">x</a><a href="mailto:a@b.c">m</a><a href="tel:+1">t</a><a href="#main">h</a>',
    ],
  ]);
  assert.deepEqual(verifyLinks(pages, []), []);
});

test('verifyLinks treats a directory link as satisfied by its index.html', () => {
  const pages = new Map([
    ['/index.html', '<a href="/homes-for-sale/plano-tx/">Plano</a>'],
    ['/homes-for-sale/plano-tx/index.html', '<h1>Plano</h1>'],
  ]);
  assert.deepEqual(verifyLinks(pages, []), []);
});

test('verifyLinks does not report a link listed as planned', () => {
  const pages = new Map([['/index.html', '<a href="/buy.html">Buy</a>']]);
  assert.deepEqual(verifyLinks(pages, ['/buy.html']), []);
});

test('verifyLinks still reports a broken link that is not planned', () => {
  const pages = new Map([['/index.html', '<a href="/ghost.html">Ghost</a>']]);
  assert.equal(verifyLinks(pages, ['/buy.html']).length, 1);
});

test('verifyLinks accepts a root link even though the key is /index.html', () => {
  const pages = new Map([['/index.html', '<a href="/">Home</a>']]);
  assert.deepEqual(verifyLinks(pages, []), []);
});

test('verifyLinks strips query strings before resolving', () => {
  const pages = new Map([
    ['/index.html', '<a href="/contact.html?type=valuation">Value</a>'],
    ['/contact.html', '<h1>Contact</h1>'],
  ]);
  assert.deepEqual(verifyLinks(pages, []), []);
});
