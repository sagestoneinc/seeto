/**
 * Property data adapter.
 *
 * No IDX/MLS feed is connected. This module defines the shape the rest of the site
 * expects and exposes a single provider seam, so wiring a real feed later is a matter
 * of implementing `fetchListings` against it rather than touching any page.
 *
 * Identifiers held in data/site.json under `mls` name the brokerage to an MLS. They are
 * NOT credentials: a live feed additionally requires a signed IDX agreement and API
 * client credentials issued by each MLS.
 */

/**
 * @typedef {Object} Property
 * @property {string}   id            Provider's listing key
 * @property {string}   mlsNumber     Public MLS number, shown on the listing
 * @property {'for-sale'|'for-rent'|'pending'|'sold'} status
 * @property {number}   price         Whole dollars
 * @property {string}   street
 * @property {string}   city
 * @property {string}   state
 * @property {string}   postalCode
 * @property {number|null} beds
 * @property {number|null} baths
 * @property {number|null} sqft
 * @property {number|null} lotAcres
 * @property {number|null} yearBuilt
 * @property {string}   propertyType
 * @property {string}   description
 * @property {{url: string, alt: string, width: number, height: number}[]} images
 * @property {string}   listingOffice  Required attribution — MLS rules forbid display without it
 * @property {string}   listingAgent
 * @property {string}   updatedAt      ISO 8601. Feeds must refresh at least every 12h.
 */

/** Normalise one provider record into the shape above. */
export function normalizeListing(raw, map) {
  const pick = (key) => (map && map[key] ? raw[map[key]] : raw[key]);
  const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
  return {
    id: String(pick('id') ?? ''),
    mlsNumber: String(pick('mlsNumber') ?? ''),
    status: pick('status') ?? 'for-sale',
    price: num(pick('price')) ?? 0,
    street: pick('street') ?? '',
    city: pick('city') ?? '',
    state: pick('state') ?? 'TX',
    postalCode: String(pick('postalCode') ?? ''),
    beds: num(pick('beds')),
    baths: num(pick('baths')),
    sqft: num(pick('sqft')),
    lotAcres: num(pick('lotAcres')),
    yearBuilt: num(pick('yearBuilt')),
    propertyType: pick('propertyType') ?? '',
    description: pick('description') ?? '',
    images: Array.isArray(pick('images')) ? pick('images') : [],
    listingOffice: pick('listingOffice') ?? '',
    listingAgent: pick('listingAgent') ?? '',
    updatedAt: pick('updatedAt') ?? '',
  };
}

/** True when enough config exists to attempt a live fetch. */
export function isProviderConfigured(site) {
  const m = (site && site.mls) || {};
  return Boolean(m.provider && m.apiBaseUrl);
}

/**
 * Returns listings, or an explicit unconfigured result. Never invents inventory —
 * fabricated listings under a real brokerage's name misrepresent what is available.
 * @returns {Promise<{configured: boolean, listings: Property[], reason?: string}>}
 */
export async function fetchListings(site /*, query */) {
  if (!isProviderConfigured(site)) {
    return {
      configured: false,
      listings: [],
      reason:
        'No IDX provider configured. Set mls.provider and mls.apiBaseUrl in data/site.json ' +
        'and supply API credentials once the MLS approves the IDX agreement.',
    };
  }
  throw new Error(
    `IDX provider "${site.mls.provider}" is named in config but has no implementation yet. ` +
      'Add a fetch against its API here.'
  );
}

/** Attribution line the MLS requires beside every displayed listing. */
export function attributionFor(property, site) {
  const office = property.listingOffice || site.name;
  return `Listing courtesy of ${office}. Information deemed reliable but not guaranteed.`;
}
