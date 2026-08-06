# Placeholder content inventory

Everything below is unverified or sample data. Replace before any production use.

## Unverified business data

| Item | Current value | Status |
|---|---|---|
| Email | info@seetorealty.com | Not confirmed on the live site. Assumed. |
| Geo coordinates | 33.0709, -96.7350 | Approximate for the Plano office. Confirm before submitting to Google Business Profile. |
| Houston office | Omitted | The prior repo listed "456 Market St, Houston" — unconfirmed and removed. Houston is treated as a served market, not a location. **Confirm with the client:** a real Houston address means a second `LocalBusiness` entity and a second map-pack target. |

## Verified business data

Read from the live site on 2026-08-03 and now held in `data/site.json`:
phone 972-509-7100, fax 972-509-7103, 700 W Spring Creek Pkwy #212, Plano, TX 75023,
founder Michael Seeto, operating since 2010.

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
Create it at 1200x630 before launch, or social shares render without a preview card.

## Pages not yet rebuilt

`about.html`, `contact.html`, `search.html`, and `mortgage-calculator.html` are still the
original hand-written files. They carry the old navigation, the old stylesheet's class
names, and the retired fake NAP (`(972) 555-SEETO`, `123 Main Street`). Plan 2 converts
them into `src/pages/` sources. Until then they are listed in `data/planned-pages.json` so
link verification passes, but **they are not fit to show a client.**
