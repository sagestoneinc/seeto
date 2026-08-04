import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, lookup, render } from '../build/render.js';

test('escapeHtml escapes all five HTML-significant characters', () => {
  assert.equal(escapeHtml(`<a href="x">&'`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
});

test('escapeHtml stringifies non-strings', () => {
  assert.equal(escapeHtml(42), '42');
});

test('lookup resolves a dot path', () => {
  assert.equal(lookup({ a: { b: { c: 'deep' } } }, 'a.b.c'), 'deep');
});

test('lookup returns undefined for a missing segment instead of throwing', () => {
  assert.equal(lookup({ a: {} }, 'a.b.c'), undefined);
});

test('render interpolates and escapes {{path}}', () => {
  assert.equal(render('<p>{{msg}}</p>', { msg: '<b>' }), '<p>&lt;b&gt;</p>');
});

test('render emits {{{path}}} raw', () => {
  assert.equal(render('<p>{{{msg}}}</p>', { msg: '<b>' }), '<p><b></p>');
});

test('render replaces a missing token with an empty string', () => {
  assert.equal(render('<p>{{nope}}</p>', {}), '<p></p>');
});

test('render iterates an each block addressing items via this', () => {
  const out = render(
    '<ul>{{#each items}}<li>{{this.label}}</li>{{/each}}</ul>',
    { items: [{ label: 'Buy' }, { label: 'Sell' }] }
  );
  assert.equal(out, '<ul><li>Buy</li><li>Sell</li></ul>');
});

test('render exposes outer context inside an each block', () => {
  const out = render(
    '{{#each items}}<a>{{site.name}}:{{this.id}}</a>{{/each}}',
    { site: { name: 'Seeto' }, items: [{ id: '1' }] }
  );
  assert.equal(out, '<a>Seeto:1</a>');
});

test('render emits nothing for an each block over a missing or empty list', () => {
  assert.equal(render('{{#each nope}}<li>x</li>{{/each}}', {}), '');
  assert.equal(render('{{#each items}}<li>x</li>{{/each}}', { items: [] }), '');
});

test('render escapes item values inside each blocks', () => {
  const out = render('{{#each items}}{{this.v}}{{/each}}', { items: [{ v: '<script>' }] });
  assert.equal(out, '&lt;script&gt;');
});
