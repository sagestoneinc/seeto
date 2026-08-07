import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSitemap, buildRobots, buildLlmsTxt } from '../build/seo.js';

const BASE = 'https://www.seetorealty.com';

test('buildSitemap emits one url element per entry with an absolute loc', () => {
  const xml = buildSitemap(
    [
      { loc: '/', priority: '1.0' },
      { loc: '/buy.html', priority: '0.8' },
    ],
    BASE
  );
  assert.equal(xml.match(/<url>/g).length, 2);
  assert.match(xml, /<loc>https:\/\/www\.seetorealty\.com\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/www\.seetorealty\.com\/buy\.html<\/loc>/);
});

test('buildSitemap declares the xml prolog and sitemap namespace', () => {
  const xml = buildSitemap([{ loc: '/', priority: '1.0' }], BASE);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.match(xml, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
});

test('buildSitemap never emits a doubled slash in a loc', () => {
  const xml = buildSitemap([{ loc: '/buy.html', priority: '0.8' }], 'https://www.seetorealty.com/');
  assert.ok(!/seetorealty\.com\/\//.test(xml));
});

test('buildRobots allows all crawlers and points at the sitemap', () => {
  const txt = buildRobots(BASE);
  assert.match(txt, /User-agent: \*/);
  assert.match(txt, /Allow: \//);
  assert.match(txt, /Sitemap: https:\/\/www\.seetorealty\.com\/sitemap\.xml/);
});

test('buildRobots in demo mode disallows everything and omits the sitemap', () => {
  const txt = buildRobots(BASE, true);
  assert.match(txt, /Disallow: \//);
  assert.ok(!/Allow: \//.test(txt));
  assert.ok(!/Sitemap:/.test(txt), 'a disallowed site must not advertise a sitemap');
});

test('the shipped site.json keeps demo mode on', () => {
  const site = JSON.parse(readFileSync('data/site.json', 'utf8'));
  assert.equal(site.demo, true, 'this is a pitch demo carrying a real brokerage name');
  assert.equal(typeof site.demoUrl, 'string');
});

test('buildLlmsTxt leads with the business name as an h1 and lists entries as links', () => {
  const txt = buildLlmsTxt(
    { name: 'Seeto Realty', tagline: 'Texas real estate', phone: '972-509-7100' },
    [{ loc: '/buy.html', title: 'Buying', summary: 'How to buy' }]
  );
  assert.ok(txt.startsWith('# Seeto Realty'));
  assert.match(txt, /- \[Buying\]\(\/buy\.html\): How to buy/);
  assert.match(txt, /972-509-7100/);
});
