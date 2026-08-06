# Placeholder content inventory

The site builds 50 pages and passes verification, but the items below are unverified,
illustrative, or not yet connected to a data source. Resolve them before launch.

## Blockers — must be resolved before this site goes live

| Item | Where | What is needed |
|---|---|---|
| No MLS/IDX feed | `listings.html`, `listing-detail.html`, `search.html` | Property search returns nothing and no listings are displayed. These pages say so plainly rather than showing invented inventory. Connect a feed. |
| Contact form is not wired | `contact.html` | The form posts nowhere. Submissions are silently lost. Connect a backend or form service. |
| Legal pages are not lawyer-reviewed | `privacy.html`, `terms.html` | Both are placeholder text carrying a visible "Sample" tag. A Texas attorney must draft or approve them, including TREC-required disclosures. |
| TREC disclosures missing | site-wide | Texas Real Estate Commission requires the Information About Brokerage Services notice and Consumer Protection Notice. Neither is published yet. |
| `og:image` does not exist | all pages | `/images/og-home.jpg` is referenced by Open Graph tags but the file is absent. Create it at 1200x630 or social shares render without a preview card. |

## Unverified business data

| Item | Current value | Status |
|---|---|---|
| Email | info@seetorealty.com | Not confirmed on the live site. Assumed. |
| Geo coordinates | 33.0709, -96.7350 | Approximate for the Plano office. Confirm before submitting to Google Business Profile. |
| Houston office | Omitted | The original repo listed "456 Market St, Houston", unconfirmed and removed. Houston is treated as a served market, not a location. **Confirm with the client** — a real Houston address means a second `LocalBusiness` entity and a second map-pack target. |

## Verified business data

Read from the live site on 2026-08-03 and held only in `data/site.json`:
phone 972-509-7100, fax 972-509-7103, 700 W Spring Creek Pkwy #212, Plano, TX 75023,
founder Michael Seeto, operating since 2010.

## Illustrative, not real data

| Item | Where | Note |
|---|---|---|
| City price ranges | all 32 city pages | Carry a visible "Sample" tag and a sentence stating they are not live market data. Replace with MLS-derived figures. |
| Team roster | `team.html` | Only Michael Seeto is listed. Agent biographies, photographs, and Texas licence numbers must come from the brokerage. |
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
