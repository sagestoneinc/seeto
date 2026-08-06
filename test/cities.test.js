import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectCities, nearbyFor } from '../build/index.js';

const complete = (over = {}) => ({
  slug: 'plano-tx',
  name: 'Plano',
  metro: 'DFW',
  county: 'Collin County',
  schools: 'Plano ISD',
  character: 'A large built-out city.',
  neighborhoods: ['West Plano'],
  priceBand: '$400K - $900K',
  ...over,
});

test('selectCities accepts a complete record', () => {
  const { ready, skipped } = selectCities([complete()]);
  assert.equal(ready.length, 1);
  assert.deepEqual(skipped, []);
});

test('selectCities rejects a record missing a required field', () => {
  const { ready, skipped } = selectCities([complete({ schools: undefined })]);
  assert.equal(ready.length, 0);
  assert.equal(skipped.length, 1);
  assert.ok(skipped[0].missing.includes('schools'));
});

test('selectCities rejects a blank string and an empty array', () => {
  assert.equal(selectCities([complete({ character: '   ' })]).ready.length, 0);
  assert.equal(selectCities([complete({ neighborhoods: [] })]).ready.length, 0);
});

test('nearbyFor returns four siblings from the same metro and never the city itself', () => {
  const all = JSON.parse(readFileSync('data/cities.json', 'utf8'));
  const { ready } = selectCities(all);
  for (const city of ready) {
    const near = nearbyFor(city, ready);
    assert.equal(near.length, 4, `${city.slug} should link to 4 siblings`);
    assert.ok(!near.some((n) => n.slug === city.slug), `${city.slug} links to itself`);
    const metros = new Set(near.map((n) => ready.find((c) => c.slug === n.slug).metro));
    assert.deepEqual([...metros], [city.metro], `${city.slug} links outside its metro`);
    assert.equal(new Set(near.map((n) => n.slug)).size, 4, `${city.slug} has duplicate links`);
  }
});

test('every city in data/cities.json is complete and uniquely slugged', () => {
  const all = JSON.parse(readFileSync('data/cities.json', 'utf8'));
  const { ready, skipped } = selectCities(all);
  assert.deepEqual(skipped, [], 'incomplete city records would be dropped from the build');
  assert.equal(ready.length, 32);
  assert.equal(new Set(ready.map((c) => c.slug)).size, 32);
});

test('city descriptive copy is unique across records', () => {
  const all = JSON.parse(readFileSync('data/cities.json', 'utf8'));
  assert.equal(new Set(all.map((c) => c.character)).size, all.length);
});
