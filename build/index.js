import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
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

export function buildAll() {
  const site = JSON.parse(read('data', 'site.json'));

  const partials = {};
  for (const name of readdirSync(join(ROOT, 'src', 'partials')).filter((n) => n.endsWith('.html'))) {
    partials[name.replace(/\.html$/, '')] = render(read('src', 'partials', name), { site });
  }

  const layout = read('src', 'layouts', 'base.html');
  const pageFiles = readdirSync(join(ROOT, 'src', 'pages')).filter((n) => n.endsWith('.html'));
  const generated = new Map();

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
      page: { ...meta, schema, content: render(body, { site }) },
    });

    const outPath = join(ROOT, filename);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    generated.set(`/${filename}`, html);
    console.log(`built ${filename}`);
  }

  const entries = [...generated.keys()].map((loc) => ({
    loc: loc === '/index.html' ? '/' : loc,
    priority: loc === '/index.html' ? '1.0' : '0.8',
  }));

  writeFileSync(join(ROOT, 'sitemap.xml'), buildSitemap(entries, site.baseUrl));
  writeFileSync(join(ROOT, 'robots.txt'), buildRobots(site.baseUrl));
  writeFileSync(
    join(ROOT, 'llms.txt'),
    buildLlmsTxt(
      site,
      entries.map(({ loc }) => ({
        loc,
        title: site.name,
        summary: 'Homes for sale across Dallas-Fort Worth and Houston.',
      }))
    )
  );
  console.log('built sitemap.xml, robots.txt, llms.txt');

  return { site, generated };
}

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
