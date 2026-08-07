import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './render.js';
import { buildSitemap, buildRobots, buildLlmsTxt } from './seo.js';
import { verifyPage, verifyLinks } from './verify.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FRONT_MATTER = /^<!--(\{[\s\S]*?\})-->\s*/;
const REQUIRED_META = ['title', 'description', 'canonical', 'ogImage', 'schema'];

const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');

function parsePage(source, filename) {
  const match = FRONT_MATTER.exec(source);
  if (match === null) {
    throw new Error(`${filename}: missing front-matter comment block`);
  }
  let meta;
  try {
    meta = JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`${filename}: front-matter is not valid JSON — ${error.message}`);
  }
  for (const key of REQUIRED_META) {
    if (typeof meta[key] !== 'string') {
      throw new Error(`${filename}: front-matter is missing "${key}"`);
    }
  }
  return { meta, body: source.slice(match[0].length) };
}

const CITY_FIELDS = [
  'slug',
  'name',
  'metro',
  'county',
  'schools',
  'character',
  'neighborhoods',
  'priceBand',
];

// A city ships only when its record is complete. An incomplete record would render a
// near-duplicate stub, and 32 of those hurt rankings rather than help them — so it is
// dropped from the build and from the sitemap instead.
export function selectCities(cities) {
  const ready = [];
  const skipped = [];
  for (const city of cities) {
    const missing = CITY_FIELDS.filter((f) => {
      const v = city[f];
      return Array.isArray(v) ? v.length === 0 : typeof v !== 'string' || v.trim() === '';
    });
    if (missing.length > 0) {
      skipped.push({ slug: city.slug || '(no slug)', missing });
    } else {
      ready.push(city);
    }
  }
  return { ready, skipped };
}

// Four siblings in the same metro, chosen by position so every page links to a
// different set and the internal link graph does not collapse onto a few hubs.
export function nearbyFor(city, all) {
  const siblings = all.filter((c) => c.metro === city.metro && c.slug !== city.slug);
  const start = siblings.findIndex((c) => c.slug > city.slug);
  const from = start === -1 ? 0 : start;
  const picked = [];
  for (let i = 0; i < 4 && i < siblings.length; i += 1) {
    picked.push(siblings[(from + i) % siblings.length]);
  }
  return picked.map(({ slug, name, county }) => ({ slug, name, county }));
}

function buildCities(site, layout, partials, generated, index, indexable) {
  const all = JSON.parse(read('data', 'cities.json'));
  const { ready, skipped } = selectCities(all);

  for (const { slug, missing } of skipped) {
    console.warn(`skipped city ${slug}: missing ${missing.join(', ')}`);
  }

  const template = read('src', 'templates', 'city.html');
  const schemaTemplate = read('src', 'schema', 'city.json');

  for (const record of ready) {
    const city = {
      ...record,
      metroLabel: record.metro === 'DFW' ? 'Dallas-Fort Worth' : 'Houston',
      nearby: nearbyFor(record, ready),
    };

    const schema = render(schemaTemplate, { site, city });
    try {
      JSON.parse(schema);
    } catch (error) {
      throw new Error(`src/schema/city.json for ${city.slug}: invalid JSON — ${error.message}`);
    }

    const canonical = `/homes-for-sale/${city.slug}/`;
    const html = render(layout, {
      site,
      partials,
      page: {
        title: `Homes for Sale in ${city.name}, TX | Seeto Realty`,
        // Deliberately does not interpolate schools or county: several records hold
        // multi-district strings long enough to push this past the 155-character limit.
        description: `Homes for sale in ${city.name}, Texas. Neighborhood guidance, school district detail, and local pricing help from Seeto Realty.`,
        canonical,
        ogImage: '/images/og-home.jpg',
        schema,
        content: render(template, { site, city }),
      },
    });

    const outPath = join(ROOT, 'homes-for-sale', city.slug, 'index.html');
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    generated.set(`${canonical}index.html`, html);
    indexable.add(`${canonical}index.html`);
    index.push({
      loc: canonical,
      title: `Homes for sale in ${city.name}, TX`,
      summary: `${city.county}, ${city.metroLabel}. Served by ${city.schools}.`,
    });
  }

  console.log(`built ${ready.length} city page(s)`);
}

export function buildAll() {
  const site = JSON.parse(read('data', 'site.json'));

  const partials = {};
  for (const name of readdirSync(join(ROOT, 'src', 'partials')).filter((n) => n.endsWith('.html'))) {
    partials[name.replace(/\.html$/, '')] = render(read('src', 'partials', name), { site });
  }

  const layout = read('src', 'layouts', 'base.html');
  const pageFiles = readdirSync(join(ROOT, 'src', 'pages')).filter((n) => n.endsWith('.html'));
  const generated = new Map();
  const index = [];
  const indexable = new Set();

  // areas.html iterates these; every other page simply ignores them.
  const { ready: cities } = selectCities(JSON.parse(read('data', 'cities.json')));
  const byMetro = {
    dfw: cities.filter((c) => c.metro === 'DFW'),
    houston: cities.filter((c) => c.metro === 'Houston'),
  };

  for (const filename of pageFiles) {
    const { meta, body } = parsePage(read('src', 'pages', filename), filename);

    // Schema files are templates too, so the NAP has exactly one source (data/site.json).
    // They use raw {{{...}}} tokens because JSON-LD inside a <script> must not be
    // HTML-escaped. Parsing here turns a malformed template into a build failure rather
    // than invalid structured data shipped to Google.
    const schema = render(read('src', 'schema', `${meta.schema}.json`), { site });
    try {
      JSON.parse(schema);
    } catch (error) {
      throw new Error(`src/schema/${meta.schema}.json: renders to invalid JSON — ${error.message}`);
    }

    const html = render(layout, {
      site,
      partials,
      page: {
        ...meta,
        robots: meta.noindex === true ? 'noindex, follow' : 'index, follow',
        schema,
        content: render(body, { site, ...byMetro }),
      },
    });

    const outPath = join(ROOT, filename);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    generated.set(`/${filename}`, html);
    // noindex pages (the 404) still get link-verified, but stay out of the sitemap
    // and llms.txt — listing a page you have told crawlers to ignore is a mixed signal.
    if (meta.noindex !== true) {
      index.push({
        loc: filename === 'index.html' ? '/' : `/${filename}`,
        title: meta.title.split('|')[0].trim(),
        summary: meta.description,
      });
      indexable.add(`/${filename}`);
    }
    console.log(`built ${filename}`);
  }

  buildCities(site, layout, partials, generated, index, indexable);

  const entries = [...generated.keys()]
    .filter((loc) => indexable.has(loc))
    .map((loc) => ({
      loc: loc === '/index.html' ? '/' : loc.replace(/\/index\.html$/, '/'),
      priority: loc === '/index.html' ? '1.0' : '0.8',
    }));

  writeFileSync(join(ROOT, 'sitemap.xml'), buildSitemap(entries, site.baseUrl));
  writeFileSync(join(ROOT, 'robots.txt'), buildRobots(site.baseUrl));
  writeFileSync(join(ROOT, 'llms.txt'), buildLlmsTxt(site, index));
  console.log('built sitemap.xml, robots.txt, llms.txt');

  return { site, generated };
}

// Only run the build when invoked as a CLI. Tests import selectCities and nearbyFor
// from this module and must not trigger a full build as a side effect of importing.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { generated } = buildAll();
  const planned = JSON.parse(read('data', 'planned-pages.json'));

  const errors = [
    ...[...generated].flatMap(([path, html]) => verifyPage(html, path)),
    ...verifyLinks(generated, planned),
  ];

  if (errors.length > 0) {
    console.error(`\nVerification failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log(`\nVerification passed: ${generated.size} page(s) clean.`);
  if (planned.length > 0) {
    console.log(`${planned.length} link target(s) still pending — see data/planned-pages.json`);
  }
}
