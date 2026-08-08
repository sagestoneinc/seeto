# Placeholder content inventory

The site builds 50 pages and passes verification, but the items below are unverified,
illustrative, or not yet connected to a data source. Resolve them before launch.

## Blockers — must be resolved before this site goes live

| Item | Where | What is needed |
|---|---|---|
| No MLS/IDX feed for **sales** | `listings.html`, `listing-detail.html`, `search.html` | For-sale search returns nothing. These pages say so plainly rather than showing invented inventory. Connect an IDX feed. **Rentals are already live** via AppFolio on `rentals.html`. |
| Contact form is not wired | `contact.html` | The form posts nowhere. Submissions are silently lost. Connect a backend or form service. |
| Legal pages are not lawyer-reviewed | `privacy.html`, `terms.html` | Both are placeholder text carrying a visible "Sample" tag. A Texas attorney must draft or approve them, including TREC-required disclosures. |
| TREC disclosures missing | site-wide | Texas Real Estate Commission requires the Information About Brokerage Services notice and Consumer Protection Notice. Neither is published yet. |
| `og:image` does not exist | all pages | `/images/og-home.jpg` is referenced by Open Graph tags but the file is absent. Create it at 1200x630 or social shares render without a preview card. |

## Unverified business data

| Item | Current value | Status |
|---|---|---|
| Email | info@seetorealty.com | Not confirmed on the live site. Assumed. |
| Geo coordinates | 33.0709, -96.7350 | Approximate for the Plano office. Confirm before submitting to Google Business Profile. |
| Houston office street address | Named but no address | **The brand kit confirms the Houston office is real** ("offices in Plano and Houston"), correcting the earlier assumption that Houston was only a served market. The kit gives no Houston street address, so the office is named in copy but carries no address in schema. Supply it to add a second `LocalBusiness` entity and win a second map-pack listing. |
| One phone line | 972-509-7100 | The brand kit flags three numbers in circulation (972-509-7100, 214-228-2281, 844-898-9903) and says to settle on one. This site uses 972-509-7100 throughout. Confirm that is the right main line. |

## Verified business data

Read from the live site on 2026-08-03 and held only in `data/site.json`:
phone 972-509-7100, fax 972-509-7103, 700 W Spring Creek Pkwy #212, Plano, TX 75023,
founder Michael Seeto, operating since 2010.

## Illustrative, not real data

| Item | Where | Note |
|---|---|---|
| City price ranges | all 32 city pages | Carry a visible "Sample" tag and a sentence stating they are not live market data. Replace with MLS-derived figures. |
| Headshots and TREC licence numbers | `team.html` | Michael Seeto and David Seeto are listed with real bios from the brand kit. Photographs and TREC licence numbers are still missing — the brand kit names these as the site's absent trust signals. |
| Blog topics | `blog.html` | Planned topics, not published articles. Deliberately not links, since no article pages exist. |

City facts that are **not** placeholders: county, school district, and neighborhood names
are real and were written per city. Descriptive copy is unique across all 32 records, which
`test/cities.test.js` enforces.

## Removed fabricated content

| Item | Action |
|---|---|
| "100% Client Satisfaction" statistic | Deleted. Unsupported. |
| Testimonials from "Sarah & John Martinez", "David Chen", "Rebecca Thompson" | Deleted. Invented. |
| Listings at $585,000 Plano / $425,000 Houston / $325,000 Dallas | Deleted. Fictional. |
| Fake NAP `(972) 555-SEETO`, `123 Main Street`, `456 Market St` | Deleted. The build fails if any reappears. |

## Resolved since the foundation build

- `data/planned-pages.json` is now empty. Every internal link resolves to a real generated page.
- The temporary legacy-palette shim in `css/style.css` is gone, along with roughly 900 lines
  of dead CSS that `js/search.js`, `js/contact.js`, and `js/mortgage-calculator.js` injected
  against the retired palette.

## Applied from the brand kit (Rev. 01, August 2026)

Colour, type, and voice now follow `Seeto-BrandKit.pdf`:

- **Palette** — Seeto Red `#8E1B1B`, Roofline Ink `#17130F`, Bone `#F5F1EA`, Sand `#EFE9DE`,
  Stone `#6E665C`, Prairie Gold `#C9A227`, held to the kit's ~70/20/8/2 ratio. Red is
  emphasis only, never a large background field.
- **Type** — Archivo for headlines, labels and data; Source Serif 4 for body and long-form;
  Zilla Slab reserved for the wordmark and taglines, never body copy.
- **Voice** — "The deal behind the door." leads the homepage and about page. No urgency
  theatre, no "dream home awaits".

Facts the kit corrected, which had been assumptions before:

- The Houston office **is real**. Earlier builds treated Houston as a served market only.
- **David Seeto** leads the Houston division as Associate Broker. Earlier the roster was
  Michael Seeto alone and flagged as incomplete.
- Michael Seeto's background (University of Oklahoma, Smith Barney, Prudential Ultima) is
  now on the site rather than a generic bio.
- The firm handles **eight** capability areas, not five — leasing, renovation and
  construction, and in-house legal counsel had been missing.
- "20+ years combined" replaces the invented "13+ years" figure.
