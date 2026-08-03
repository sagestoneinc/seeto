# Seeto Realty — Site Revamp & SEO Design

**Date:** 2026-08-03
**Status:** Approved — ready for implementation planning

## Purpose

Rebuild the Seeto Realty static site as a **pitch demo**: a redesigned, SEO-complete
version of seetorealty.com used to show the client what a revamp delivers. It is not
deployed as-is and does not need to preserve the live site's URLs.

Two problems drive the work:

1. **The site is broken.** Navigation and footer link to ten pages that do not exist
   (`services`, `buy`, `sell`, `foreclosures`, `investments`, `property-management`,
   `listings`, `team`, `blog`, plus `listing-detail`, `privacy`, `terms`). Only
   `index`, `about`, `contact`, `search`, and `mortgage-calculator` are present.
2. **The SEO is hollow.** Business identity data is fabricated, and the live site's
   single biggest organic asset — 32 city-level landing pages — has no equivalent here.

## Success criteria

- Zero broken internal links. Every `href` resolves to a real page.
- Every page carries real NAP data, a unique title and meta description, one H1, and
  valid schema.
- 32 city landing pages exist, each with unique body content.
- `sitemap.xml`, `robots.txt`, and `llms.txt` are present and correct.
- The visual language reads as boutique/editorial, distinct from the current template look.
- No fabricated content is presented as genuine.

## Verified business facts

Sourced from the live site on 2026-08-03. These replace the placeholder values
currently in the repo and must be identical on every page.

| Field | Value |
|---|---|
| Business name | Seeto Realty |
| Phone | 972-509-7100 |
| Fax | 972-509-7103 |
| Address | 700 W Spring Creek Pkwy #212, Plano, TX 75023 |
| Founder / broker | Michael Seeto |
| Live tagline | DFW's Home Buying and Selling Authority |
| Markets | Dallas–Fort Worth, Houston |

Values currently in the repo that are **wrong and must be removed**: phone
`(972) 555-SEETO`, address `123 Main Street, Suite 200`, and the second
`456 Market St, Houston` office. The Houston office is not confirmed on the live site;
Houston is treated as a served market, not a physical location, until confirmed.

Email is not confirmed from the live site. Use `info@seetorealty.com` and record it in
`PLACEHOLDER_CONTENT.md` as unverified.

## Architecture

### Build approach

A small Node build script compiles source templates into plain static HTML. No runtime
dependencies, no framework, no client-side rendering. The published output is ordinary
HTML that can be hosted anywhere — identical in nature to what exists today.

This exists because the site grows from 5 pages to roughly 50. Duplicating the header
and footer into 50 files makes any nav change a 50-file edit, and hand-authoring 32 city
pages is not realistic.

```
src/
  layouts/base.html        # shell: <head>, header, footer, schema slots
  partials/                # nav, footer, cta, listing-card, faq
  pages/                   # one source file per static page
  templates/city.html      # single template, rendered 32 times
data/
  site.json                # NAP, socials, global meta — single source of truth
  cities.json              # 32 city records
  faqs.json
build.js                   # renders src/ + data/ -> repo root
```

Rules:

- The build is **idempotent and destructive only within generated paths.** It writes
  `*.html` at the repo root and under `homes-for-sale/`. It must never delete `src/`,
  `data/`, `docs/`, `js/`, or `images/`.
- Generated HTML is committed to the repo, so the site works with no build step for
  anyone who just wants to open it.
- Templating is simple string interpolation (`{{token}}` and a loop construct). No
  template engine dependency.
- Existing `js/*.js` files are reused as-is. They are not rewritten by this work.

### Page inventory

**Revamped (5):** `index`, `about`, `contact`, `search`, `mortgage-calculator`

**New — service (6):** `services`, `buy`, `sell`, `foreclosures`, `investments`,
`property-management`

**New — content (4):** `listings`, `team`, `blog`, `listing-detail`

`blog.html` is an index of sample post cards only — individual post pages are **not**
built. `listing-detail.html` is one page that reads `?id=` and renders from sample data;
there is no per-listing file.

**New — legal (2):** `privacy`, `terms`

**New — hub (1):** `areas.html`, linking all 32 city pages grouped by metro.

**New — city (32):** `homes-for-sale/{slug}-tx/index.html`

DFW (20): Allen, Carrollton, Coppell, Dallas, Flower Mound, Frisco, Garland,
Grand Prairie, Irving, Lewisville, Little Elm, McKinney, Mesquite, Plano, Prosper,
Richardson, Rowlett, Sachse, The Colony, Wylie

Houston (12): Conroe, Cypress, Houston, Humble, Katy, Kingwood, Missouri City,
Pearland, Spring, Stafford, Sugar Land, The Woodlands

**Total: 50 pages.**

Exact typeface and accent-color values are chosen during implementation under the
editorial-minimal direction below; the spec fixes the direction, not the hex codes.

## Design system

Direction: **editorial minimal.** Warm monochrome, typographic contrast, flat surfaces,
photography carrying the visual weight. Replaces the current navy-and-gold template look.

- **Color** — warm off-white ground, near-black warm ink for text, a range of warm grays
  for hierarchy, and a single deep accent reserved exclusively for primary CTAs and
  active states. No gradients.
- **Type** — a serif display face for headings paired with a clean sans for body and UI.
  The scale jump between H1 and body is large; that contrast is the design. Body copy
  at 1.125rem base.
- **Surface** — flat. Hairline borders replace card shadows. Border radius is minimal.
- **Layout** — asymmetric bento grids for listings and city tiles. Generous section
  padding. Content max-width tuned for reading measure, not full-bleed text.
- **Motion** — restrained: opacity and small translate on scroll-in, honoring
  `prefers-reduced-motion`.

`css/style.css` is rewritten around a new token set. Tokens are defined once in `:root`;
no hard-coded colors or spacing in component rules.

### Navigation

Top level drops from 8 items to 5: **Buy · Sell · Search · Areas · About**, plus a single
primary CTA. Everything else (Team, Blog, Property Management, Foreclosures, Investments,
Mortgage Calculator, legal) lives in a structured four-column footer.

Mobile: slide-out panel, 48px minimum tap targets.

## SEO

### Local

- `RealEstateAgent` schema on the homepage with verified NAP, `areaServed` covering both
  metros, `founder` as a `Person` (Michael Seeto), and `geo` coordinates for the Plano office.
- Identical NAP string in the footer of every page, marked up so it is machine-readable
  and consistent.
- `LocalBusiness` schema on the contact page.

### City pages

Each of the 32 pages carries:

- Title: `Homes for Sale in {City}, TX | Seeto Realty`
- One H1: `Homes for Sale in {City}, Texas`
- Unique intro copy driven by per-city fields in `cities.json` (county, character,
  school district, typical price band, notable neighborhoods). Fields are per-city, so
  no two pages produce the same prose.
- A market-stats block, a sample-listings block, and a city-specific FAQ.
- Internal links to 4–6 sibling cities in the same metro, plus up to the `areas.html` hub.
- `Place` + `BreadcrumbList` schema.

**Thin-content guard:** a city page ships only when its `cities.json` record has all
required fields populated. Any city missing data is excluded from the build and from the
sitemap rather than shipped as a near-duplicate stub.

### Technical

- Unique `<title>` (≤60 chars) and `<meta name="description">` (≤155 chars) per page,
  authored per page — never templated from a single pattern for the static pages.
- Self-referencing `<link rel="canonical">` on every page.
- Open Graph and Twitter Card tags on every page.
- `BreadcrumbList` schema on every page below the root.
- `sitemap.xml` generated by the build from the actual page list, so it cannot drift.
- `robots.txt` allowing full crawl and pointing at the sitemap.
- Semantic heading order with exactly one H1 per page.
- Explicit `width`/`height` on all images to prevent layout shift; `loading="lazy"`
  below the fold; descriptive alt text on every image.
- The obsolete `<meta name="keywords">` tag is removed.

### GEO / AI search

- `llms.txt` at the root describing the business, service areas, and key page URLs.
- `FAQPage` schema on the homepage, each service page, and each city page.
- Answer-shaped content: every FAQ opens with a direct, self-contained one-sentence
  answer before elaborating, so an LLM can lift a citable passage without surrounding context.
- Factual, attributable statements about service areas and specialties rather than
  marketing abstraction.

## Content integrity

The repo currently contains invented testimonials, an unsupported "100% Client
Satisfaction" statistic, and fictional property listings. Because this is a demo for a
**real** business, that content must not be capable of being mistaken for genuine.

- Sample testimonials, listings, team members, and blog posts are visibly labeled as
  sample content in the rendered page.
- Unverifiable statistics ("100% Client Satisfaction") are removed rather than restyled.
  Only claims traceable to the live site are stated as fact.
- `PLACEHOLDER_CONTENT.md` at the repo root inventories every placeholder, its location,
  and what real data must replace it before any production use.
- Stock photography is referenced with its source recorded, for license review before use.

## Accessibility

- WCAG AA contrast for all text and interactive states.
- Visible keyboard focus indicators.
- Landmark elements (`header`, `nav`, `main`, `footer`) and a skip-to-content link.
- Accessible names on all icon-only controls.
- `prefers-reduced-motion` honored.

## Verification

The build script includes a check mode that fails on:

1. Any internal `href` that does not resolve to a generated file.
2. Any page missing a title, meta description, canonical, or H1.
3. More than one H1 on a page.
4. Any image missing `alt`.
5. Any occurrence of the retired placeholder NAP values.
6. Any city record missing a required field.
7. Any title over 60 or description over 155 characters.

Additionally: JSON-LD on every page validates as parseable JSON, and `sitemap.xml`
entry count equals the generated page count.

## Out of scope

- MLS/IDX integration. Listings are sample data.
- Working chatbot backend. The widget stays presentational.
- User accounts, saved searches, favorites.
- Map-based search.
- Deployment, DNS, or redirects from the live site.
- Rewriting the existing `js/` modules beyond selector updates needed by new markup.
