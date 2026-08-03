# Seeto Realty Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dependency-free static-site build system, the editorial-minimal design system, a fully SEO-complete homepage, and a verification harness that fails on broken links or missing SEO tags.

**Architecture:** A small ESM Node build reads JSON data and HTML templates from `src/` and `data/`, renders them with a ~60-line string templating function, and writes plain static HTML to the repo root. Generated HTML is committed, so the site opens with no build step. A verifier runs over the generated output and exits non-zero on SEO or link defects.

**Tech Stack:** Node 25 (ESM), `node:test` + `node:assert/strict` for tests, zero runtime and zero production dependencies. Hand-written CSS with custom properties. No framework, no bundler, no CSS preprocessor.

This is **Plan 1 of 3**. Plan 2 adds the 13 remaining static pages; Plan 3 adds `cities.json` and the 32 city pages. Both depend on the machinery built here.

## Global Constraints

- **Zero dependencies.** `package.json` must have no `dependencies` and no `devDependencies`. Tests use the Node built-in runner.
- **ESM only.** `package.json` sets `"type": "module"`. All imports use `node:` prefixes for builtins.
- **Verified NAP, used verbatim everywhere.** Phone `972-509-7100`, fax `972-509-7103`, address `700 W Spring Creek Pkwy #212, Plano, TX 75023`, founder `Michael Seeto`. These live in `data/site.json` and are never hard-coded into a template.
- **Banned strings.** The build fails if generated HTML contains `555-SEETO`, `123 Main Street`, or `456 Market St`. These are the retired placeholder values.
- **Preserve these class names** — `js/main.js` queries them and breaks silently otherwise: `.header`, `.nav-menu`, `.mobile-menu-toggle`, `.chatbot-toggle`, `.chatbot-window`, `.chatbot-close`, `.search-form`, `.service-card`, `.listing-card`, `.testimonial-card`, `.feature-item`.
- **No emoji** in any markup, heading, alt text, or content string. The current footer uses `📍 📞 ✉️` and the chatbot uses `👋`; all are replaced with inline SVG or removed.
- **Banned typefaces:** Inter, Roboto, Open Sans. **Banned:** gradients on large surfaces, `box-shadow` above `0.05` opacity, pill-shaped primary buttons, colored hero backgrounds.
- **Every generated page** carries exactly one `<h1>`, a `<title>` of at most 60 characters, a `<meta name="description">` of at most 155 characters, a self-referencing canonical, Open Graph tags, and parseable JSON-LD.
- **Every `<img>`** carries `alt`, explicit `width`, and explicit `height`.
- **Base URL** is `https://www.seetorealty.com` — used for canonicals, OG URLs, and sitemap entries.
- **No `<meta name="keywords">`.** It is obsolete and is removed, not repopulated.

---

## File Structure

| Path | Responsibility |
|---|---|
| `package.json` | ESM flag, npm scripts. No deps. |
| `build/render.js` | Template string interpolation. Pure, no I/O. |
| `build/seo.js` | Generates `sitemap.xml`, `robots.txt`, `llms.txt` bodies. Pure, no I/O. |
| `build/verify.js` | SEO and link validators. Pure — takes HTML strings, returns error arrays. |
| `build/index.js` | The only file that touches disk. Reads `src/` + `data/`, writes output, runs verify. |
| `data/site.json` | NAP, socials, nav, global meta. Single source of truth. |
| `src/layouts/base.html` | Full page shell. |
| `src/partials/header.html` | Nav. Owns `.header`, `.nav-menu`, `.mobile-menu-toggle`. |
| `src/partials/footer.html` | Footer + NAP block. |
| `src/partials/chatbot.html` | Chatbot widget markup. Owns `.chatbot-*`. |
| `src/pages/index.html` | Homepage body content only. |
| `css/style.css` | Rewritten. Tokens + components. |
| `test/*.test.js` | One test file per build module. |

Tasks 1, 6, and 7 build pure functions and are test-driven. Tasks 2–5 produce HTML/CSS whose correctness is asserted by the Task 7 verifier running over real output.

---

### Task 1: Template renderer

**Files:**
- Create: `package.json`
- Create: `build/render.js`
- Test: `test/render.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `escapeHtml(value: unknown): string`
  - `lookup(context: object, path: string): unknown` — dot-path lookup, returns `undefined` on any missing segment
  - `render(template: string, context: object): string` — supports `{{path}}` (HTML-escaped), `{{{path}}}` (raw), and `{{#each path}}…{{/each}}` where the loop body addresses the current item as `{{this.prop}}`. Nested `each` blocks are **not** supported.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "seeto-realty",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Seeto Realty static site",
  "scripts": {
    "build": "node build/index.js",
    "test": "node --test test/"
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `test/render.test.js`:

```js
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/render.js'`

- [ ] **Step 4: Implement the renderer**

Create `build/render.js`:

```js
const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const EACH_BLOCK = /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/;
const RAW_TOKEN = /\{\{\{\s*([\w.]+)\s*\}\}\}/g;
const TOKEN = /\{\{\s*([\w.]+)\s*\}\}/g;

// Guards against a malformed template looping forever.
const MAX_BLOCK_EXPANSIONS = 1000;

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function lookup(context, path) {
  return path
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), context);
}

export function render(template, context) {
  let output = template;

  for (let i = 0; i < MAX_BLOCK_EXPANSIONS; i += 1) {
    const match = EACH_BLOCK.exec(output);
    if (match === null) break;

    const [full, path, body] = match;
    const items = lookup(context, path);
    const rendered = (Array.isArray(items) ? items : [])
      .map((item) => render(body, { ...context, this: item }))
      .join('');

    output =
      output.slice(0, match.index) + rendered + output.slice(match.index + full.length);
  }

  output = output.replace(RAW_TOKEN, (_, path) => {
    const value = lookup(context, path);
    return value == null ? '' : String(value);
  });

  return output.replace(TOKEN, (_, path) => {
    const value = lookup(context, path);
    return value == null ? '' : escapeHtml(value);
  });
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 11 tests passing, 0 failing.

- [ ] **Step 6: Commit**

```bash
git add package.json build/render.js test/render.test.js
git commit -m "Add dependency-free template renderer with tests"
```

---

### Task 2: Site data and page assembly

**Files:**
- Create: `data/site.json`
- Create: `src/layouts/base.html`
- Create: `src/pages/index.html`
- Create: `build/index.js`

**Interfaces:**
- Consumes: `render()` from Task 1.
- Produces:
  - `data/site.json` shape — consumed by every later task and both later plans.
  - `build/index.js` writes `index.html` at the repo root.
  - Each file in `src/pages/` begins with an HTML comment front-matter block holding that page's `title`, `description`, `canonical` path, `ogImage`, and `schema` filename.

- [ ] **Step 1: Create `data/site.json` with the verified business facts**

```json
{
  "name": "Seeto Realty",
  "legalName": "Seeto Realty",
  "baseUrl": "https://www.seetorealty.com",
  "tagline": "DFW's home buying and selling authority",
  "founded": "2010",
  "founder": "Michael Seeto",
  "phone": "972-509-7100",
  "phoneHref": "+19725097100",
  "fax": "972-509-7103",
  "email": "info@seetorealty.com",
  "address": {
    "street": "700 W Spring Creek Pkwy #212",
    "locality": "Plano",
    "region": "TX",
    "postalCode": "75023",
    "country": "US"
  },
  "geo": { "latitude": "33.0709", "longitude": "-96.7350" },
  "areasServed": ["Dallas-Fort Worth", "Houston", "Plano", "Frisco", "McKinney", "Katy", "Sugar Land"],
  "nav": [
    { "label": "Buy", "href": "/buy.html" },
    { "label": "Sell", "href": "/sell.html" },
    { "label": "Search", "href": "/search.html" },
    { "label": "Areas", "href": "/areas.html" },
    { "label": "About", "href": "/about.html" }
  ],
  "footerServices": [
    { "label": "Buy a home", "href": "/buy.html" },
    { "label": "Sell your home", "href": "/sell.html" },
    { "label": "Foreclosures", "href": "/foreclosures.html" },
    { "label": "Investments", "href": "/investments.html" },
    { "label": "Property management", "href": "/property-management.html" }
  ],
  "footerCompany": [
    { "label": "About", "href": "/about.html" },
    { "label": "Our team", "href": "/team.html" },
    { "label": "Blog", "href": "/blog.html" },
    { "label": "Areas we serve", "href": "/areas.html" },
    { "label": "Contact", "href": "/contact.html" }
  ],
  "footerResources": [
    { "label": "Property search", "href": "/search.html" },
    { "label": "Featured listings", "href": "/listings.html" },
    { "label": "Mortgage calculator", "href": "/mortgage-calculator.html" },
    { "label": "Privacy policy", "href": "/privacy.html" },
    { "label": "Terms of service", "href": "/terms.html" }
  ],
  "social": [
    { "label": "Facebook", "href": "https://www.facebook.com/seetorealty" },
    { "label": "LinkedIn", "href": "https://www.linkedin.com/company/seeto-realty" }
  ]
}
```

Note: `nav` deliberately holds five items, down from eight. `geo` coordinates are the Plano office. `email` is unverified and gets recorded in `PLACEHOLDER_CONTENT.md` in Task 5.

- [ ] **Step 2: Create `src/layouts/base.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{page.title}}</title>
<meta name="description" content="{{page.description}}">
<link rel="canonical" href="{{site.baseUrl}}{{page.canonical}}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{{site.name}}">
<meta property="og:title" content="{{page.title}}">
<meta property="og:description" content="{{page.description}}">
<meta property="og:url" content="{{site.baseUrl}}{{page.canonical}}">
<meta property="og:image" content="{{site.baseUrl}}{{page.ogImage}}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{page.title}}">
<meta name="twitter:description" content="{{page.description}}">
<meta name="twitter:image" content="{{site.baseUrl}}{{page.ogImage}}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
<script type="application/ld+json">{{{page.schema}}}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
{{{partials.header}}}
<main id="main">
{{{page.content}}}
</main>
{{{partials.footer}}}
{{{partials.chatbot}}}
<script src="/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create `src/pages/index.html` as a stub with front-matter**

The real homepage content arrives in Task 5. This stub proves the pipeline end to end.

```html
<!--{
  "title": "Seeto Realty | Homes for Sale in DFW & Houston, TX",
  "description": "Search homes for sale across Dallas-Fort Worth and Houston. Seeto Realty has helped Texas families buy, sell, and invest since 2010.",
  "canonical": "/",
  "ogImage": "/images/og-home.jpg",
  "schema": "home"
}-->
<h1>Find your place in Texas</h1>
```

- [ ] **Step 4: Create `build/index.js`**

```js
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './render.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FRONT_MATTER = /^<!--(\{[\s\S]*?\})-->\s*/;

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
  for (const key of ['title', 'description', 'canonical', 'ogImage', 'schema']) {
    if (typeof meta[key] !== 'string') {
      throw new Error(`${filename}: front-matter is missing "${key}"`);
    }
  }
  return { meta, body: source.slice(match[0].length) };
}

export function buildAll() {
  const site = JSON.parse(read('data', 'site.json'));

  const partialNames = readdirSync(join(ROOT, 'src', 'partials'))
    .filter((name) => name.endsWith('.html'))
    .map((name) => name.replace(/\.html$/, ''));

  const partials = {};
  for (const name of partialNames) {
    partials[name] = render(read('src', 'partials', `${name}.html`), { site });
  }

  const layout = read('src', 'layouts', 'base.html');
  const pageFiles = readdirSync(join(ROOT, 'src', 'pages')).filter((n) => n.endsWith('.html'));

  const generated = new Map();

  for (const filename of pageFiles) {
    const { meta, body } = parsePage(read('src', 'pages', filename), filename);
    const schema = read('src', 'schema', `${meta.schema}.json`);
    const context = {
      site,
      partials,
      page: { ...meta, schema, content: render(body, { site }) },
    };
    const html = render(layout, context);
    const outPath = join(ROOT, filename);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    generated.set(`/${filename}`, html);
    console.log(`built ${filename}`);
  }

  return { site, generated };
}

buildAll();
```

- [ ] **Step 5: Create `src/schema/home.json`**

```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": "https://www.seetorealty.com/#organization",
  "name": "Seeto Realty",
  "url": "https://www.seetorealty.com",
  "telephone": "972-509-7100",
  "faxNumber": "972-509-7103",
  "email": "info@seetorealty.com",
  "foundingDate": "2010",
  "founder": { "@type": "Person", "name": "Michael Seeto" },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "700 W Spring Creek Pkwy #212",
    "addressLocality": "Plano",
    "addressRegion": "TX",
    "postalCode": "75023",
    "addressCountry": "US"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "33.0709", "longitude": "-96.7350" },
  "areaServed": [
    { "@type": "City", "name": "Dallas" },
    { "@type": "City", "name": "Plano" },
    { "@type": "City", "name": "Frisco" },
    { "@type": "City", "name": "Houston" }
  ],
  "priceRange": "$$"
}
```

- [ ] **Step 6: Create the three partials as minimal stubs**

Real markup arrives in Task 4. Create `src/partials/header.html`, `src/partials/footer.html`, and `src/partials/chatbot.html`, each containing a single HTML comment such as `<!-- header -->`, so the build resolves.

- [ ] **Step 7: Run the build**

Run: `npm run build`
Expected: prints `built index.html`, and `index.html` at the repo root now contains `<title>Seeto Realty | Homes for Sale in DFW & Houston, TX</title>`, a canonical of `https://www.seetorealty.com/`, and the `RealEstateAgent` JSON-LD.

Verify no placeholder leaked:

Run: `grep -c "555-SEETO" index.html`
Expected: `0`

- [ ] **Step 8: Commit**

```bash
git add package.json data/ src/ build/index.js index.html
git commit -m "Add data-driven page assembly with verified business data"
```

---

### Task 3: Design tokens and base stylesheet

**Files:**
- Modify: `css/style.css` (full rewrite, 1217 lines replaced)

**Interfaces:**
- Consumes: nothing.
- Produces: the token names below. Every later task and both later plans style exclusively through these; no later rule hard-codes a color or a spacing value.

- [ ] **Step 1: Replace the `:root` block and reset**

Replace the entire contents of `css/style.css` with the following, then continue adding to it in Step 2.

```css
/* ===================================
   Seeto Realty — editorial minimal
   =================================== */

:root {
  /* Canvas & surface — warm monochrome */
  --canvas: #FBFBFA;
  --canvas-alt: #F7F6F3;
  --surface: #FFFFFF;
  --border: #EAEAEA;
  --border-strong: #DAD9D6;

  /* Ink */
  --ink: #111111;
  --ink-body: #2F3437;
  --ink-muted: #787774;

  /* Accent — reserved for primary CTA and active state only */
  --accent: #111111;
  --accent-hover: #333333;
  --on-accent: #FFFFFF;

  /* Muted pastels — tags and badges only */
  --pastel-blue-bg: #E1F3FE;
  --pastel-blue-ink: #1F6C9F;
  --pastel-green-bg: #EDF3EC;
  --pastel-green-ink: #346538;
  --pastel-yellow-bg: #FBF3DB;
  --pastel-yellow-ink: #956400;

  /* Type */
  --font-display: 'Newsreader', 'Lyon Text', Georgia, serif;
  --font-sans: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', ui-monospace, 'JetBrains Mono', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1.125rem;
  --text-lg: 1.375rem;
  --text-xl: 1.875rem;
  --text-2xl: 2.5rem;
  --text-3xl: 3.5rem;
  --text-4xl: 4.5rem;

  /* Space */
  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-4: 2rem;
  --space-5: 3rem;
  --space-6: 4rem;
  --space-section: 7.5rem;

  /* Form */
  --radius: 6px;
  --radius-card: 12px;
  --shadow-hover: 0 2px 8px rgba(0, 0, 0, 0.04);
  --measure: 68ch;
  --container: 1180px;

  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}

*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }

html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--ink-body);
  background: var(--canvas);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-wrap: balance;
}

h1 { font-size: clamp(2.75rem, 6vw, var(--text-4xl)); }
h2 { font-size: clamp(2rem, 4vw, var(--text-3xl)); }
h3 { font-size: var(--text-lg); }

h4, h5, h6 {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

p { max-width: var(--measure); }
img { max-width: 100%; height: auto; display: block; }
a { color: var(--ink); text-decoration-thickness: 1px; text-underline-offset: 3px; }

:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: var(--space-2);
  top: var(--space-2);
  z-index: 100;
  padding: var(--space-1) var(--space-2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.container {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--space-3);
}

section { padding-block: var(--space-section); }

.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
}
```

- [ ] **Step 2: Append the component rules**

Append to `css/style.css`:

```css
/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.875rem 1.5rem;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  border: 1px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  text-decoration: none;
  transition: background-color 200ms var(--ease), transform 200ms var(--ease);
}
.btn-primary { background: var(--accent); color: var(--on-accent); }
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline { background: transparent; color: var(--ink); border-color: var(--border-strong); }
.btn-outline:hover { border-color: var(--ink); }
.btn:active { transform: scale(0.98); }

/* --- Header --- */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(251, 251, 250, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 72px;
}
.logo-text {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  letter-spacing: -0.01em;
  text-decoration: none;
  color: var(--ink);
}
.nav-menu {
  display: flex;
  gap: var(--space-3);
  list-style: none;
}
.nav-menu a {
  font-size: var(--text-sm);
  color: var(--ink-body);
  text-decoration: none;
  padding-block: var(--space-1);
  border-bottom: 1px solid transparent;
}
.nav-menu a:hover, .nav-menu a.active {
  color: var(--ink);
  border-bottom-color: var(--ink);
}
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
}
.mobile-menu-toggle span {
  display: block;
  width: 22px;
  height: 1.5px;
  background: var(--ink);
}

/* --- Cards: flat, hairline borders --- */
.service-card, .listing-card, .testimonial-card, .feature-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-4);
  transition: box-shadow 200ms var(--ease);
}
.service-card:hover, .listing-card:hover { box-shadow: var(--shadow-hover); }
.listing-card { padding: 0; overflow: hidden; }
.listing-details { padding: var(--space-3); }
.listing-price {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--ink);
}

/* --- Tags --- */
.tag {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 9999px;
  background: var(--pastel-blue-bg);
  color: var(--pastel-blue-ink);
}
.tag-sample { background: var(--pastel-yellow-bg); color: var(--pastel-yellow-ink); }

/* --- Bento grid --- */
.bento {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-3);
}
.bento-wide { grid-column: span 2; }

/* --- Footer --- */
.footer {
  background: var(--canvas-alt);
  border-top: 1px solid var(--border);
  padding-block: var(--space-6) var(--space-4);
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr);
  gap: var(--space-4);
}
.footer h4 { margin-bottom: var(--space-2); }
.footer ul { list-style: none; display: grid; gap: 0.625rem; }
.footer a { font-size: var(--text-sm); color: var(--ink-body); text-decoration: none; }
.footer a:hover { text-decoration: underline; }
.footer-bottom {
  margin-top: var(--space-5);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
  font-size: var(--text-xs);
  color: var(--ink-muted);
}

/* --- Chatbot --- */
.chatbot-widget { position: fixed; right: var(--space-3); bottom: var(--space-3); z-index: 60; }
.chatbot-toggle {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
  cursor: pointer;
}
.chatbot-window {
  position: absolute;
  right: 0;
  bottom: 64px;
  width: min(340px, calc(100vw - var(--space-4)));
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
}
.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  border-bottom: 1px solid var(--border);
}
.chatbot-close { background: none; border: none; font-size: var(--text-lg); cursor: pointer; }
.chatbot-body { padding: var(--space-2); font-size: var(--text-sm); }
.chatbot-input { display: flex; gap: var(--space-1); padding: var(--space-2); border-top: 1px solid var(--border); }
.chatbot-input input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  font: inherit;
  font-size: var(--text-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

/* --- Utility --- */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* --- Motion --- */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  /* js/main.js:184-190 sets inline opacity:0 and translateY(20px) on these classes
     for its IntersectionObserver reveal, and does not consult prefers-reduced-motion.
     Only an !important rule beats an inline style, so this is deliberate — without it
     these cards animate for users who asked for no motion, and stay invisible entirely
     if the observer never fires. */
  .service-card, .listing-card, .testimonial-card, .feature-item {
    opacity: 1 !important;
    transform: none !important;
  }
}

/* --- Responsive --- */
@media (max-width: 880px) {
  :root { --space-section: 4.5rem; }
  .mobile-menu-toggle { display: flex; }
  .nav-menu {
    display: none;
    position: absolute;
    inset-inline: 0;
    top: 100%;
    flex-direction: column;
    gap: 0;
    padding: var(--space-2);
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .nav-menu.active { display: flex; }
  .nav-menu a { display: block; padding: var(--space-2); }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .bento-wide { grid-column: span 1; }
}
```

- [ ] **Step 3: Confirm no banned values remain**

Run: `grep -nE "Open Sans|Roboto|'Inter'|linear-gradient|#1B4F8C|#C9A227" css/style.css`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "Replace stylesheet with editorial-minimal design tokens"
```

---

### Task 4: Header, footer, and chatbot partials

**Files:**
- Modify: `src/partials/header.html`
- Modify: `src/partials/footer.html`
- Modify: `src/partials/chatbot.html`

**Interfaces:**
- Consumes: `site` context from Task 2; token names from Task 3.
- Produces: markup carrying the class names `js/main.js` requires.

- [ ] **Step 1: Write `src/partials/header.html`**

```html
<header class="header">
  <nav class="container" aria-label="Main">
    <div class="nav-wrapper">
      <a href="/" class="logo-text">Seeto Realty</a>
      <button class="mobile-menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-menu">
        {{#each site.nav}}<li><a href="{{this.href}}">{{this.label}}</a></li>{{/each}}
      </ul>
      <a href="/contact.html" class="btn btn-primary">Talk to an agent</a>
    </div>
  </nav>
</header>
```

- [ ] **Step 2: Write `src/partials/footer.html`**

Note the NAP block uses no emoji and pulls every value from `site.json`.

```html
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <p class="logo-text">Seeto Realty</p>
        <p style="margin-top: var(--space-2); font-size: var(--text-sm); color: var(--ink-muted);">
          Helping Texas families buy, sell, and invest across Dallas-Fort Worth and Houston since {{site.founded}}.
        </p>
      </div>
      <div>
        <h4>Services</h4>
        <ul>{{#each site.footerServices}}<li><a href="{{this.href}}">{{this.label}}</a></li>{{/each}}</ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>{{#each site.footerCompany}}<li><a href="{{this.href}}">{{this.label}}</a></li>{{/each}}</ul>
      </div>
      <div>
        <h4>Contact</h4>
        <address style="font-style: normal; font-size: var(--text-sm); color: var(--ink-body);">
          {{site.address.street}}<br>
          {{site.address.locality}}, {{site.address.region}} {{site.address.postalCode}}<br>
          <a href="tel:{{site.phoneHref}}">{{site.phone}}</a><br>
          <a href="mailto:{{site.email}}">{{site.email}}</a>
        </address>
        <ul style="margin-top: var(--space-2);">
          {{#each site.footerResources}}<li><a href="{{this.href}}">{{this.label}}</a></li>{{/each}}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 {{site.name}}. Licensed in Texas. Equal Housing Opportunity.</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Write `src/partials/chatbot.html`**

The `👋` emoji from the current markup is removed. Class names are preserved for `js/main.js`.

**Critical:** the window must carry a literal `style="display: none;"`. `js/main.js:36` toggles
with `chatbotWindow.style.display === 'none' ? 'block' : 'none'`, which reads the *inline*
style. Using the `hidden` attribute instead leaves `style.display` as `''` on first click, so
the toggle sets it to `'none'` and the panel needs two clicks to open.

```html
<div class="chatbot-widget" id="chatbot">
  <button class="chatbot-toggle" aria-label="Open chat">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
  </button>
  <div class="chatbot-window" style="display: none;">
    <div class="chatbot-header">
      <h4>Chat with us</h4>
      <button class="chatbot-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="chatbot-body">
      <p>Looking for homes in DFW or Houston? We can help you search, schedule a tour, or connect you with an agent.</p>
    </div>
    <div class="chatbot-input">
      <label class="visually-hidden" for="chat-message">Your message</label>
      <input type="text" id="chat-message" placeholder="Type your message">
      <button class="btn btn-primary">Send</button>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Rebuild and confirm the NAP renders**

Run: `npm run build && grep -c "700 W Spring Creek Pkwy" index.html`
Expected: `1`

Run: `grep -cE "555-SEETO|123 Main Street|456 Market St" index.html`
Expected: `0`

- [ ] **Step 5: Commit**

```bash
git add src/partials/ index.html
git commit -m "Add header, footer, and chatbot partials with verified NAP"
```

---

### Task 5: Homepage content

**Files:**
- Modify: `src/pages/index.html`
- Create: `PLACEHOLDER_CONTENT.md`

**Interfaces:**
- Consumes: `site` context, Task 3 tokens, Task 4 partials.
- Produces: the finished homepage body. Establishes the section patterns Plan 2 reuses.

- [ ] **Step 1: Write the homepage body**

Replace everything below the front-matter block in `src/pages/index.html`. Keep the front-matter exactly as written in Task 2.

```html
<section class="hero">
  <div class="container">
    <p class="eyebrow">Dallas-Fort Worth &amp; Houston &middot; Since {{site.founded}}</p>
    <h1>Find your place in Texas.</h1>
    <p style="font-size: var(--text-lg); margin-top: var(--space-3);">
      Seeto Realty is a boutique brokerage covering both of Texas's largest metros. We help
      buyers, sellers, and investors move with a clear read on the market.
    </p>
    <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-4);">
      <a href="/search.html" class="btn btn-primary">Search homes</a>
      <a href="/contact.html?type=valuation" class="btn btn-outline">What's my home worth?</a>
    </div>
  </div>
</section>

<section class="quick-search" style="background: var(--canvas-alt); border-block: 1px solid var(--border);">
  <div class="container">
    <form class="search-form" action="/search.html" method="get">
      <h2>Search homes in DFW &amp; Houston</h2>
      <div class="bento" style="margin-top: var(--space-3);">
        <label class="visually-hidden" for="q-location">Location</label>
        <input type="text" id="q-location" name="location" placeholder="City, neighborhood, or ZIP">
        <label class="visually-hidden" for="q-type">Property type</label>
        <select id="q-type" name="type">
          <option value="">Property type</option>
          <option value="house">House</option>
          <option value="condo">Condo</option>
          <option value="townhouse">Townhouse</option>
          <option value="land">Land</option>
        </select>
        <label class="visually-hidden" for="q-price">Price range</label>
        <select id="q-price" name="price">
          <option value="">Price range</option>
          <option value="0-300000">Under $300K</option>
          <option value="300000-500000">$300K - $500K</option>
          <option value="500000-750000">$500K - $750K</option>
          <option value="750000+">$750K+</option>
        </select>
        <button type="submit" class="btn btn-primary">Search</button>
      </div>
    </form>
  </div>
</section>

<section>
  <div class="container">
    <h2>What we do</h2>
    <div class="bento" style="margin-top: var(--space-4);">
      <article class="service-card">
        <h3>Buying</h3>
        <p>Guidance from first search through closing, with a realistic view of what your budget buys in each submarket.</p>
        <a href="/buy.html">Explore buying</a>
      </article>
      <article class="service-card">
        <h3>Selling</h3>
        <p>Pricing strategy, preparation, and negotiation built around what comparable homes actually closed at.</p>
        <a href="/sell.html">Explore selling</a>
      </article>
      <article class="service-card">
        <h3>Foreclosures</h3>
        <p>Distressed and bank-owned listings, with the diligence work these purchases require.</p>
        <a href="/foreclosures.html">Explore foreclosures</a>
      </article>
      <article class="service-card">
        <h3>Investments</h3>
        <p>Rental and multi-family acquisition analysis grounded in local rent comps and carrying costs.</p>
        <a href="/investments.html">Explore investments</a>
      </article>
      <article class="service-card">
        <h3>Property management</h3>
        <p>Tenant placement, maintenance coordination, and reporting for owners holding Texas rentals.</p>
        <a href="/property-management.html">Explore management</a>
      </article>
      <article class="service-card">
        <h3>Mortgage tools</h3>
        <p>Estimate payments including Texas property tax and insurance before you tour anything.</p>
        <a href="/mortgage-calculator.html">Open the calculator</a>
      </article>
    </div>
  </div>
</section>

<section style="background: var(--canvas-alt); border-block: 1px solid var(--border);">
  <div class="container">
    <h2>Where we work</h2>
    <p style="margin-top: var(--space-2);">Two metros, thirty-two cities. Start with the areas we know best.</p>
    <div class="bento" style="margin-top: var(--space-4);">
      <a class="service-card" href="/homes-for-sale/plano-tx/"><h3>Plano</h3><p>Collin County</p></a>
      <a class="service-card" href="/homes-for-sale/frisco-tx/"><h3>Frisco</h3><p>Collin &amp; Denton County</p></a>
      <a class="service-card" href="/homes-for-sale/dallas-tx/"><h3>Dallas</h3><p>Dallas County</p></a>
      <a class="service-card" href="/homes-for-sale/houston-tx/"><h3>Houston</h3><p>Harris County</p></a>
    </div>
    <p style="margin-top: var(--space-3);"><a href="/areas.html">See all 32 areas we serve</a></p>
  </div>
</section>

<section>
  <div class="container">
    <h2>Common questions</h2>
    <div style="margin-top: var(--space-4); max-width: var(--measure);">
      <details style="border-bottom: 1px solid var(--border); padding-block: var(--space-3);">
        <summary><strong>What areas does Seeto Realty serve?</strong></summary>
        <p style="margin-top: var(--space-2);">Seeto Realty serves the Dallas-Fort Worth and Houston metropolitan areas, covering 32 cities across both regions. The brokerage is based at 700 W Spring Creek Pkwy #212 in Plano, Texas.</p>
      </details>
      <details style="border-bottom: 1px solid var(--border); padding-block: var(--space-3);">
        <summary><strong>How long has Seeto Realty been in business?</strong></summary>
        <p style="margin-top: var(--space-2);">Seeto Realty has operated in Texas real estate since 2010. The brokerage was founded by Michael Seeto.</p>
      </details>
      <details style="border-bottom: 1px solid var(--border); padding-block: var(--space-3);">
        <summary><strong>Does Seeto Realty work with first-time buyers?</strong></summary>
        <p style="margin-top: var(--space-2);">Yes. Seeto Realty works with first-time buyers across DFW and Houston, including guidance on Texas-specific costs such as property tax rates and homestead exemptions.</p>
      </details>
    </div>
  </div>
</section>

<section style="background: var(--canvas-alt); border-block: 1px solid var(--border);">
  <div class="container" style="text-align: center;">
    <h2>Ready to make a move?</h2>
    <p style="margin: var(--space-3) auto 0;">Tell us what you're looking for and we'll come back with a plan.</p>
    <div style="display: flex; gap: var(--space-2); justify-content: center; margin-top: var(--space-4);">
      <a href="/contact.html" class="btn btn-primary">Talk to an agent</a>
      <a href="/search.html" class="btn btn-outline">Browse listings</a>
    </div>
  </div>
</section>
```

Note: the sample testimonials, invented statistics, and fictional listings from the current homepage are **not** carried over. The "100% Client Satisfaction" claim is deleted rather than restyled, per the spec.

- [ ] **Step 2: Replace `src/schema/home.json` entirely**

Both entities go in one `@graph`. Overwrite the whole file with this — do not hand-splice it.

The FAQ answer text matches the rendered `<details>` copy word for word. Mismatched schema
is a structured-data violation, so if you change one, change both.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": "https://www.seetorealty.com/#organization",
      "name": "Seeto Realty",
      "url": "https://www.seetorealty.com",
      "telephone": "972-509-7100",
      "faxNumber": "972-509-7103",
      "email": "info@seetorealty.com",
      "foundingDate": "2010",
      "founder": { "@type": "Person", "name": "Michael Seeto" },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "700 W Spring Creek Pkwy #212",
        "addressLocality": "Plano",
        "addressRegion": "TX",
        "postalCode": "75023",
        "addressCountry": "US"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": "33.0709", "longitude": "-96.7350" },
      "areaServed": [
        { "@type": "City", "name": "Dallas" },
        { "@type": "City", "name": "Plano" },
        { "@type": "City", "name": "Frisco" },
        { "@type": "City", "name": "Houston" }
      ],
      "priceRange": "$$"
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.seetorealty.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What areas does Seeto Realty serve?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Seeto Realty serves the Dallas-Fort Worth and Houston metropolitan areas, covering 32 cities across both regions. The brokerage is based at 700 W Spring Creek Pkwy #212 in Plano, Texas."
          }
        },
        {
          "@type": "Question",
          "name": "How long has Seeto Realty been in business?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Seeto Realty has operated in Texas real estate since 2010. The brokerage was founded by Michael Seeto."
          }
        },
        {
          "@type": "Question",
          "name": "Does Seeto Realty work with first-time buyers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Seeto Realty works with first-time buyers across DFW and Houston, including guidance on Texas-specific costs such as property tax rates and homestead exemptions."
          }
        }
      ]
    }
  ]
}
```

- [ ] **Step 3: Create `PLACEHOLDER_CONTENT.md`**

```markdown
# Placeholder content inventory

Everything below is unverified or sample data. Replace before any production use.

## Unverified business data

| Item | Current value | Status |
|---|---|---|
| Email | info@seetorealty.com | Not confirmed on the live site. Assumed. |
| Geo coordinates | 33.0709, -96.7350 | Approximate for the Plano office. Confirm before submitting to Google Business Profile. |
| Social URLs | facebook.com/seetorealty, linkedin.com/company/seeto-realty | Assumed handles. Not verified. |
| Houston office | Omitted | The prior repo listed "456 Market St, Houston" — unconfirmed and removed. Houston is treated as a served market, not a location. Confirm with the client. |

## Removed fabricated content

| Item | Action |
|---|---|
| "100% Client Satisfaction" statistic | Deleted. Unsupported. |
| Testimonials from "Sarah & John Martinez", "David Chen", "Rebecca Thompson" | Deleted. Invented. |
| Listings at $585,000 Plano / $425,000 Houston / $325,000 Dallas | Deleted. Fictional. |

## Sample content added in later plans

Any sample listing, agent bio, or testimonial reintroduced in Plan 2 or Plan 3 must carry a
visible `.tag-sample` badge reading "Sample" in the rendered page.

## Images

`/images/og-home.jpg` is referenced by the homepage Open Graph tags but does not exist yet.
Create it at 1200x630 before launch, or social shares will render without a preview card.
```

- [ ] **Step 4: Rebuild and check**

Run: `npm run build`
Expected: `built index.html`

Run: `node -e "const m=require('node:fs').readFileSync('index.html','utf8').match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/); JSON.parse(m[1]); console.log('schema parses')"`
Expected: `schema parses`

- [ ] **Step 5: Commit**

```bash
git add src/ index.html PLACEHOLDER_CONTENT.md
git commit -m "Build editorial-minimal homepage with FAQ schema"
```

---

### Task 6: SEO artifact generation

**Files:**
- Create: `build/seo.js`
- Test: `test/seo.test.js`
- Modify: `build/index.js`

**Interfaces:**
- Consumes: `site` object from Task 2.
- Produces:
  - `buildSitemap(entries: Array<{loc: string, priority: string}>, baseUrl: string): string`
  - `buildRobots(baseUrl: string): string`
  - `buildLlmsTxt(site: object, entries: Array<{loc: string, title: string, summary: string}>): string`

- [ ] **Step 1: Write the failing tests**

Create `test/seo.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSitemap, buildRobots, buildLlmsTxt } from '../build/seo.js';

const BASE = 'https://www.seetorealty.com';

test('buildSitemap emits one url element per entry with an absolute loc', () => {
  const xml = buildSitemap([{ loc: '/', priority: '1.0' }, { loc: '/buy.html', priority: '0.8' }], BASE);
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

test('buildLlmsTxt leads with the business name as an h1 and lists entries as links', () => {
  const txt = buildLlmsTxt(
    { name: 'Seeto Realty', tagline: 'Texas real estate', phone: '972-509-7100' },
    [{ loc: '/buy.html', title: 'Buying', summary: 'How to buy' }]
  );
  assert.ok(txt.startsWith('# Seeto Realty'));
  assert.match(txt, /- \[Buying\]\(\/buy\.html\): How to buy/);
  assert.match(txt, /972-509-7100/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/seo.js'`

- [ ] **Step 3: Implement `build/seo.js`**

```js
const trimSlash = (url) => url.replace(/\/+$/, '');

export function buildSitemap(entries, baseUrl) {
  const base = trimSlash(baseUrl);
  const urls = entries
    .map(({ loc, priority }) =>
      [
        '  <url>',
        `    <loc>${base}${loc}</loc>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    )
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildRobots(baseUrl) {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${trimSlash(baseUrl)}/sitemap.xml`,
    '',
  ].join('\n');
}

export function buildLlmsTxt(site, entries) {
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.tagline}`,
    '',
    `${site.name} is a real estate brokerage serving the Dallas-Fort Worth and Houston`,
    `metropolitan areas in Texas. Phone: ${site.phone}.`,
    '',
    '## Pages',
    '',
  ];
  for (const { loc, title, summary } of entries) {
    lines.push(`- [${title}](${loc}): ${summary}`);
  }
  lines.push('');
  return lines.join('\n');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all render and seo tests passing.

- [ ] **Step 5: Wire the artifacts into `build/index.js`**

Add the import at the top of `build/index.js`:

```js
import { buildSitemap, buildRobots, buildLlmsTxt } from './seo.js';
```

Then, inside `buildAll()`, immediately before `return { site, generated };`, insert:

```js
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
      [...generated.keys()].map((loc) => ({
        loc: loc === '/index.html' ? '/' : loc,
        title: site.name,
        summary: 'Homes for sale across Dallas-Fort Worth and Houston.',
      }))
    )
  );
  console.log('built sitemap.xml, robots.txt, llms.txt');
```

- [ ] **Step 6: Rebuild and confirm the artifacts**

Run: `npm run build && cat sitemap.xml robots.txt`
Expected: `sitemap.xml` contains `<loc>https://www.seetorealty.com/</loc>`; `robots.txt` ends with the `Sitemap:` line.

- [ ] **Step 7: Commit**

```bash
git add build/seo.js test/seo.test.js build/index.js sitemap.xml robots.txt llms.txt
git commit -m "Generate sitemap, robots.txt, and llms.txt from the page list"
```

---

### Task 7: Verification harness

**Files:**
- Create: `build/verify.js`
- Create: `data/planned-pages.json`
- Test: `test/verify.test.js`
- Modify: `build/index.js`

**Interfaces:**
- Consumes: HTML strings produced by Task 2.
- Produces:
  - `BANNED_STRINGS: string[]`
  - `verifyPage(html: string, path: string): string[]` — returns human-readable error strings; empty array means the page passed
  - `verifyLinks(generated: Map<string, string>, planned: string[]): string[]` — cross-page internal link resolution

**Why `planned-pages.json` exists.** The Task 4 header and footer link to `/buy.html`,
`/areas.html`, and a dozen other pages that Plans 2 and 3 build. Without an allowlist,
`verifyLinks` reports every one of them as broken and Plan 1 can never go green — which
would train whoever runs it to ignore the verifier, defeating its purpose. Planned paths
are skipped and reported as a pending count instead.

Plans 2 and 3 delete entries from this file as they build the real pages. **Plan 3's
definition of done is that `data/planned-pages.json` contains an empty array** — at which
point every internal link on the site is genuinely verified.

- [ ] **Step 1: Write the failing tests**

Create `test/verify.test.js`:

```js
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
  assert.ok(verifyPage(good.replace('</body>', '<h1>Second</h1></body>'), '/x').some((e) => e.includes('h1')));
});

test('verifyPage flags an image missing alt, width, or height', () => {
  assert.ok(verifyPage(good.replace(/ alt="A home"/, ''), '/x').some((e) => e.includes('alt')));
  assert.ok(verifyPage(good.replace(/ width="800"/, ''), '/x').some((e) => e.includes('width')));
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
    ['/index.html', '<a href="https://x.com">x</a><a href="mailto:a@b.c">m</a><a href="tel:+1">t</a><a href="#main">h</a>'],
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/verify.js'`

- [ ] **Step 3: Implement `build/verify.js`**

```js
export const BANNED_STRINGS = ['555-SEETO', '123 Main Street', '456 Market St'];

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const IMG_TAG = /<img\b[^>]*>/g;
const HREF = /<a\b[^>]*\bhref="([^"]*)"/g;
const EXTERNAL = /^(https?:|mailto:|tel:|#|javascript:)/i;

export function verifyPage(html, path) {
  const errors = [];
  const fail = (message) => errors.push(`${path}: ${message}`);

  const title = /<title>([\s\S]*?)<\/title>/.exec(html);
  if (title === null || title[1].trim() === '') {
    fail('missing <title>');
  } else if (title[1].length > 60) {
    fail(`title is ${title[1].length} characters, over the 60 limit`);
  }

  const description = /<meta name="description" content="([^"]*)"/.exec(html);
  if (description === null || description[1].trim() === '') {
    fail('missing meta description');
  } else if (description[1].length > 155) {
    fail(`description is ${description[1].length} characters, over the 155 limit`);
  }

  if (!/<link rel="canonical" href="[^"]+"/.test(html)) {
    fail('missing canonical link');
  }

  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) {
    fail(`found ${h1Count} h1 elements, expected exactly 1`);
  }

  for (const tag of html.match(IMG_TAG) || []) {
    if (!/\balt="/.test(tag)) fail(`img missing alt: ${tag.slice(0, 60)}`);
    if (!/\bwidth="/.test(tag)) fail(`img missing width: ${tag.slice(0, 60)}`);
    if (!/\bheight="/.test(tag)) fail(`img missing height: ${tag.slice(0, 60)}`);
  }

  for (const banned of BANNED_STRINGS) {
    if (html.includes(banned)) fail(`contains retired placeholder "${banned}"`);
  }

  if (EMOJI.test(html)) {
    fail('contains an emoji; use an inline SVG icon instead');
  }

  return errors;
}

export function verifyLinks(generated, planned = []) {
  const errors = [];
  const pending = new Set(planned);
  const exists = (target) =>
    generated.has(target) ||
    generated.has(`${target.replace(/\/$/, '')}/index.html`);

  for (const [path, html] of generated) {
    for (const match of html.matchAll(HREF)) {
      const href = match[1];
      if (href === '' || EXTERNAL.test(href)) continue;
      const target = href.split(/[?#]/)[0];
      if (target === '/' || exists(target) || pending.has(target)) continue;
      errors.push(`${path}: broken internal link to ${target}`);
    }
  }
  return errors;
}
```

Note the `target === '/'` guard: the logo and several CTAs link to `/`, which is served by
`index.html` but never appears as a generated key under that name.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all render, seo, and verify tests passing.

- [ ] **Step 5: Create `data/planned-pages.json`**

Every path the Task 4 header and footer link to that Plan 2 or Plan 3 will build.

```json
[
  "/about.html",
  "/contact.html",
  "/search.html",
  "/mortgage-calculator.html",
  "/buy.html",
  "/sell.html",
  "/areas.html",
  "/foreclosures.html",
  "/investments.html",
  "/property-management.html",
  "/team.html",
  "/blog.html",
  "/listings.html",
  "/privacy.html",
  "/terms.html",
  "/homes-for-sale/plano-tx/",
  "/homes-for-sale/frisco-tx/",
  "/homes-for-sale/dallas-tx/",
  "/homes-for-sale/houston-tx/"
]
```

The first four already exist as hand-written files in the repo, but `verifyLinks` only knows
about pages the **build** generated, so they must be listed here too or Plan 1 fails. Plan 2
converts them into `src/pages/` sources and removes them from this list at that point.

- [ ] **Step 6: Wire verification into the build**

In `build/index.js`, add the import:

```js
import { verifyPage, verifyLinks } from './verify.js';
```

Replace the final `buildAll();` call at the bottom of the file with:

```js
const { generated } = buildAll();
const planned = JSON.parse(readFileSync(join(ROOT, 'data', 'planned-pages.json'), 'utf8'));

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
```

- [ ] **Step 7: Run the build and confirm verification passes**

Run: `npm run build`
Expected: `Verification passed: 1 page(s) clean.` followed by `19 link target(s) still pending`, exit code 0.

- [ ] **Step 8: Prove the verifier actually fails on a defect**

A verifier that has never failed is not known to work. Break the page deliberately:

```bash
printf '\n<h1>Duplicate heading</h1>\n' >> src/pages/index.html
npm run build; echo "exit=$?"
```

Expected: `Verification failed with 1 error(s)`, the message `found 2 h1 elements, expected exactly 1`, and `exit=1`.

Now confirm the banned-string check fires:

```bash
git checkout src/pages/index.html
printf '\n<p>Call 555-SEETO today</p>\n' >> src/pages/index.html
npm run build; echo "exit=$?"
```

Expected: `contains retired placeholder "555-SEETO"` and `exit=1`.

Restore and confirm green:

```bash
git checkout src/pages/index.html && npm run build; echo "exit=$?"
```

Expected: `Verification passed` and `exit=0`.

- [ ] **Step 9: Commit**

```bash
git add build/verify.js test/verify.test.js build/index.js data/planned-pages.json
git commit -m "Add SEO and link verification that fails the build on defects"
```

---

## Definition of done for Plan 1

- [ ] `npm test` passes with zero failures (11 render + 5 seo + 16 verify tests).
- [ ] `npm run build` exits 0 and prints `Verification passed`.
- [ ] The verifier has been observed **failing** on a deliberate defect (Task 7 Step 8), not just passing.
- [ ] `package.json` lists no dependencies of any kind.
- [ ] `grep -rE "555-SEETO|123 Main Street|456 Market St" index.html` returns nothing.
- [ ] `grep -rE "Open Sans|Roboto|linear-gradient" css/style.css` returns nothing.
- [ ] `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, and `PLACEHOLDER_CONTENT.md` all exist at the repo root.
- [ ] Opening `index.html` in a browser shows a styled homepage with a working mobile menu and chatbot toggle.

## Open question carried forward

The Houston office address is unconfirmed. `PLACEHOLDER_CONTENT.md` records this. If the
client confirms a real Houston location, `data/site.json` gains a `locations` array and
`src/schema/home.json` gains a second `LocalBusiness` entity — a change isolated to those
two files by design.
