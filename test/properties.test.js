import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  normalizeListing, isProviderConfigured, fetchListings, attributionFor,
} from '../build/data/properties.js';

const site = JSON.parse(readFileSync('data/site.json', 'utf8'));

test('MLS identifiers are recorded and internally consistent', () => {
  const m = site.mls;
  assert.equal(m.brokerLicense, '496025-B');
  assert.equal(m.agentMlsId, '0496025');
  assert.equal(m.officeMlsId, 'SEET01');
  // The MLS agent id is the TREC licence number without its suffix, zero-padded.
  assert.equal(m.agentMlsId.replace(/^0+/, ''), m.brokerLicense.split('-')[0]);
});

test('the full NTREIS identity set is recorded', () => {
  const m = site.mls;
  assert.equal(m.mls, 'NTREIS');
  assert.equal(m.association, 'MAR');
  assert.equal(m.officeMlsId, 'SEET01');
  assert.equal(m.memberId, 'MTX9315');
});

test('Houston is not silently assumed to be covered', () => {
  assert.deepEqual(site.mls.associations, ['NTREIS']);
  assert.ok(!site.mls.associations.includes('HARMLS'),
    'HARMLS needs its own membership and IDX agreement; do not imply coverage');
});

test('identifiers alone never make the provider look configured', () => {
  // Every id can be present and the feed is still not usable. Guards against someone
  // reading a full-looking mls block as "connected".
  assert.equal(isProviderConfigured(site), false);
  assert.equal(site.mls.apiBaseUrl, '');
  assert.equal(site.mls.idxAgreementOnFile, null);
});

test('AppFolio is recorded as widget-only until API credentials exist', () => {
  assert.equal(site.appfolio.widget, true);
  assert.equal(site.appfolio.apiCredentials, false);
});

test('no IDX provider is configured, so nothing claims to be live', () => {
  assert.equal(isProviderConfigured(site), false);
});

test('fetchListings reports unconfigured rather than inventing listings', async () => {
  const res = await fetchListings(site);
  assert.equal(res.configured, false);
  assert.deepEqual(res.listings, []);
  assert.match(res.reason, /No IDX provider configured/);
});

test('fetchListings throws if a provider is named but unimplemented', async () => {
  const withProvider = { ...site, mls: { ...site.mls, provider: 'ntreis', apiBaseUrl: 'https://x.test' } };
  assert.equal(isProviderConfigured(withProvider), true);
  await assert.rejects(() => fetchListings(withProvider), /has no implementation yet/);
});

test('normalizeListing coerces types and defaults safely', () => {
  const p = normalizeListing({
    id: 123, mlsNumber: 20990001, price: '450000', beds: '4', baths: '2.5',
    sqft: '', city: 'Plano', listingOffice: 'Seeto Realty',
  });
  assert.equal(p.id, '123');
  assert.equal(p.price, 450000);
  assert.equal(p.beds, 4);
  assert.equal(p.sqft, null, 'empty string must become null, not 0');
  assert.equal(p.state, 'TX');
  assert.deepEqual(p.images, []);
});

test('normalizeListing honours a field map for provider-specific keys', () => {
  const p = normalizeListing(
    { ListingKey: 'abc', ListPrice: 300000, City: 'Katy' },
    { id: 'ListingKey', price: 'ListPrice', city: 'City' }
  );
  assert.equal(p.id, 'abc');
  assert.equal(p.price, 300000);
  assert.equal(p.city, 'Katy');
});

test('attribution names the listing office, which MLS rules require', () => {
  const line = attributionFor({ listingOffice: 'Other Brokerage LLC' }, site);
  assert.match(line, /Listing courtesy of Other Brokerage LLC/);
  assert.match(line, /deemed reliable but not guaranteed/);
});
