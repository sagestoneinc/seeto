# Seeto Realty — Design Specification

**Status:** Proposed. Awaiting approval before visual implementation.
**Brand source:** `Seeto-BrandKit.pdf` Rev. 01, August 2026 (8 pages).
**Figma source:** **None. Confirmed by the client 2026-08-08 — no Figma library exists for this brand.** The brand kit is therefore the sole source of truth for the design system.
**Last updated:** 2026-08-08

---

## 1. Open blockers

These must be resolved before the redesign can be called complete. Two of them block
finalisation outright.

| # | Blocker | Status | What I need |
|---|---|---|---|
| 1 | ~~Figma file key~~ | **CLOSED.** Client confirms no Figma library exists. The brand kit governs the design system. Nothing is inferred from an imagined library. | — |
| 2 | Logo files | **RESOLVED (with a caveat).** Client supplied `images/brand/seeto_realty_logo.jpeg` — 200×200, white background baked in, exactly the asset the brand kit criticises. Derived assets are generated from it (§18). **It is the only master available, so 200px is the ceiling.** | Optional but recommended: an original vector or ≥1000px version, so the header lockup can be sharper |
| 3 | Photography | **PARTLY RESOLVED.** 11 team headshots downloaded from seetorealty.com/about into `images/team/`. Still no property, neighbourhood, or office photography for the hero. | Hero-grade property/neighbourhood imagery, or approval to license stock |
| 4 | Testimonials | **RESOLVED.** Three real Google Business Profile reviews supplied (§15). | — (see caveat in §15) |
| 5 | Trust statistics | **PARTLY RESOLVED.** Licence-verified facts now available (§16). Still no transaction counts or doors-managed figures. | Optional: transactions closed, doors under management, total Google review count and average |
| 6 | TREC licence numbers | **RESOLVED for Michael Seeto** (§16). David Seeto's and the agents' licence numbers are still absent. | Licence numbers for David Seeto and any agent shown on the site |

---

## 2. Documented conflicts

Recorded rather than guessed, per the brief.

### 2.1 Office count — **RESOLVED in the client's favour**

| Source | Claim |
|---|---|
| Brand kit p.1 | "offices in Plano and Houston" |
| Brand kit p.3 (descriptor + boilerplate) | "Plano & Houston" |
| Brand kit p.7 (email signature) | "Seeto Realty · Plano & Houston" |
| **Brand kit p.7 (business card)** | **Plano address only — no Houston address anywhere in the kit** |
| **Client instruction, 2026-08-08** | **"We do not have office in Houston, we only have one office"** |

**Ruling:** One office — 700 W Spring Creek Pkwy #212, Plano, TX 75023. Houston is a
**market served**, never described as a location. The kit's own business card supports this;
no Houston street address appears anywhere in the document.

**Consequence:** the descriptor "Boutique brokerage · Plano & Houston · Since 2010" cannot be
used verbatim. **APPROVED replacement (client, 2026-08-08): "Boutique brokerage · Plano,
Texas · Since 2010"**, with reach expressed separately as "Serving DFW and Greater Houston".
This supersedes the brand kit's descriptor string.

### 2.2 Phone number — **RESOLVED**

Kit p.8 flags three numbers in circulation (972-509-7100, 214-228-2281, 844-898-9903) and
says to settle on one. Client confirms **972-509-7100 (office)** as the single line. Applied
everywhere. **Fax 972-509-7103 is CONFIRMED (client, 2026-08-08) and stays.** One voice line,
one fax line.

### 2.3 Zilla Slab

The kit restricts Zilla Slab to "wordmark & taglines only, never body copy". Once a real
logo SVG exists, the wordmark becomes an image, so Zilla Slab's only remaining live use is
taglines. That is intended, not an oversight.

---

## 3. Brand personality

Plain-spoken, numerate, unhurried. The voice of someone who has read a thousand settlement
statements and doesn't need to oversell.

| Trait | Meaning |
|---|---|
| **Direct** | Say the number, say the risk. |
| **Local** | Streets and ISDs, not "the market". |
| **Steady** | No urgency theatre, no hype. |
| **Warm** | A family firm, not a call centre. |

**Brand idea:** *The deal behind the door.* — anyone can show you a house; Seeto reads the
numbers underneath it.

**Tagline:** *For all your real estate needs. Texas-wide.*

**Say this:** "Priced right, your Plano home moves in the first two weeks. Here's the comp set."
**Not this:** "Your dream home awaits!" · "passionate about leveraging synergies" · "#1 in luxury service".

---

## 4. Visual direction

**Editorial, not portal.** The current site's failure mode — and the reference site's — is
looking like a listings database with a logo on top. Seeto's differentiator is judgment, so
the design should read like a firm that publishes considered material, not a search box.

Three devices carry it:

1. **The red rule.** A 2px Seeto Red hairline under section headings, lifted straight from
   the brand kit's own layout. It is the cheapest, most repeatable brand signal available and
   costs no imagery.
2. **Bone as the page, Ink as the anchor.** Full-bleed Ink panels are reserved for two or
   three moments per page (hero underlay, one proof band, the final CTA). Their scarcity is
   what makes them read as premium.
3. **Numerate typography.** Prairie Gold figures at display size for real statistics only.
   The brand's claim is that it reads numbers, so numbers should be visually first-class.

**Deliberately avoided:** rounded card grids repeated down the page, gradients,
glassmorphism, parallax, stock-looking hero collages, and any layout that could be mistaken
for a Real Geeks or E&G template.

---

## 5. Colour tokens

Exact values from brand kit p.6. **No new brand colours.** Tints and shades are derived only
from these.

```css
:root {
  /* Brand — literal, from the kit */
  --seeto-red:    #8E1B1B;  /* primary, headings, rules */
  --brick:        #6B1212;  /* hover / pressed red */
  --roofline-ink: #17130F;  /* text, dark fields */
  --bone:         #F5F1EA;  /* page background */
  --sand:         #EFE9DE;  /* secondary surface */
  --stone:        #6E665C;  /* muted text */
  --prairie-gold: #C9A227;  /* accent — figures and emphasis only */

  /* Semantic — required by the brief */
  --color-primary:        var(--seeto-red);
  --color-primary-hover:  var(--brick);
  --color-secondary:      var(--roofline-ink);
  --color-accent:         var(--prairie-gold);
  --color-background:     var(--bone);
  --color-surface:        #FFFFFF;
  --color-surface-alt:    var(--sand);
  --color-surface-invert: var(--roofline-ink);
  --color-text-primary:   var(--roofline-ink);
  --color-text-secondary: var(--stone);
  --color-text-invert:    var(--bone);
  --color-border:         #E1DACE;  /* Bone/Sand shade — derived, not new */
  --color-border-strong:  #CFC6B8;  /* derived */
  --color-focus:          var(--seeto-red);
}
```

**Ratio (enforced):** ~70% Bone · 20% Ink · 8% Seeto Red · 2% Prairie Gold.
**Red is never a large background field** except the wordmark lockup and the primary button.

**Contrast — verified against WCAG AA:**

| Pair | Ratio | Verdict |
|---|---|---|
| Ink `#17130F` on Bone `#F5F1EA` | ~16.4:1 | Pass AAA |
| Seeto Red `#8E1B1B` on Bone | ~8.0:1 | Pass AAA |
| Bone on Seeto Red (button) | ~8.0:1 | Pass AAA |
| Stone `#6E665C` on Bone | ~5.0:1 | Pass AA normal text |
| **Prairie Gold `#C9A227` on Bone** | **~2.1:1** | **FAILS — large decorative figures only, never body text, never a lone carrier of meaning** |

That last row is a hard rule: Prairie Gold is for display-size figures that are also labelled
in Ink or Stone text.

---

## 6. Typography

From brand kit p.7. Both faces are free and web-licensed via Google Fonts.

| Role | Face | Weights | Use |
|---|---|---|---|
| Display / headlines / labels / data | **Archivo** | 400, 600, 700, 800 | Headings, eyebrows, buttons, stats, nav |
| Body / listings / long-form | **Source Serif 4** | 400, 400i, 600 | All body copy, listing detail, articles |
| Wordmark & taglines **only** | **Zilla Slab** | 600, 700 | Never body copy |

**Fallbacks (from the kit):** Archivo → Helvetica Neue. Source Serif 4 → Georgia.
No Inter, Roboto, or Arial as a primary face.

**Scale** (kit: Display 54–82 / Head 27–40 / Body 16–20 / Label 12–13 uppercase):

```css
--text-label:   0.8125rem;  /* 13px, uppercase */
--text-sm:      0.9375rem;  /* 15px */
--text-base:    1.125rem;   /* 18px — body floor is 16px, never lower */
--text-lg:      1.25rem;    /* 20px lede */
--text-xl:      1.75rem;    /* 28px */
--text-head:    2.5rem;     /* 40px  h2 ceiling */
--text-display: 5.125rem;   /* 82px  h1 ceiling, clamped down on mobile */
```

**Tracking:** labels 0.14–0.2em · display −0.02em · body normal.
**Line height:** display 1.05 · heads 1.1 · body 1.6.

---

## 7. Spacing, radius, elevation

```css
--space-1: 0.5rem;  --space-2: 1rem;   --space-3: 1.5rem;
--space-4: 2rem;    --space-5: 3rem;   --space-6: 4rem;
--space-7: 6rem;    --space-section: 7rem;   /* 4.5rem under 880px */

--radius-sm:   3px;   /* inputs, tags */
--radius:      4px;   /* buttons */
--radius-card: 6px;   /* cards, panels — deliberately restrained */
--radius-full: 9999px; /* small pills only, never containers */

--shadow-subtle: 0 1px 2px rgba(23,19,15,0.04);
--shadow-hover:  0 2px 8px rgba(23,19,15,0.06);
```

Structure comes from **hairline borders and whitespace**, not shadow. No shadow above 0.06
opacity. No rounded-card soup.

---

## 8. Component system

Built as reusable partials, not one-off sections. Names map to Figma once the library is
available (§12).

| Component | Variants / states | Notes |
|---|---|---|
| `Button` | primary, secondary, ghost, link · default/hover/focus/active/disabled | Primary = Seeto Red on Bone text |
| `SectionHeading` | with/without red rule, with/without eyebrow | The signature brand device |
| `PathwayCard` | buyer, seller, investor, owner | Audience routing — icon-free, type-led |
| `ServiceCard` | default, featured | Outcome-led copy, not feature lists |
| `StatBlock` | gold figure + Ink label | **Real figures only** |
| `PropertyCard` | for-sale, rental, sold · image/status/price/location | Mirrors kit p.8 listing card |
| `ProcessStep` | numbered 1–n | Three to five steps |
| `Testimonial` | quote + attribution | **Renders nothing unless real content supplied** |
| `CTABand` | light, invert | Ink invert reserved for page end |
| `Field` | text, select, textarea · default/focus/error/success | Labels always visible, never placeholder-only |
| `Disclosure` | FAQ accordion | Native `<details>` for keyboard support |

---

## 9. Navigation

- Logo lockup left (image asset once supplied; text wordmark is a stopgap only).
- Five items maximum: **Buy · Sell · Rentals · Areas · About**.
- One prominent primary CTA in the header.
- Sticky header **retained** — it keeps the CTA and phone reachable on long city and listing
  pages, which is a genuine usability gain here rather than decoration.
- Mobile: full-height slide-out panel, 48px minimum targets, focus trapped while open,
  `Esc` closes, focus returns to the toggle.

---

## 10. Responsive behaviour

Tested at **375 / 768 / 1024 / 1440**.

| Breakpoint | Behaviour |
|---|---|
| < 640 | Single column. Display type clamps to ~3.25rem. Section padding 4.5rem. Hero image sits above copy rather than behind it, so text never sits on an unreadable photo. |
| 640–1023 | Two-column pathway and service grids. Nav collapses below 880. |
| 1024–1439 | Full grid. Hero becomes an asymmetric split. |
| ≥ 1440 | Content caps at 1180px; Ink and Sand bands run full-bleed behind it. |

Mobile is a **transformation**, not a squeezed desktop — the hero recomposes rather than
shrinking.

---

## 11. Motion

- Hero: one staged reveal — opacity + 12px rise, 600ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
- Hover/focus: 200ms colour and border transitions only.
- Scroll reveals: `IntersectionObserver`, opacity/transform only, no layout properties.
- **Banned:** parallax, scroll-jacking, counters that animate, carousels that auto-advance.
- `prefers-reduced-motion: reduce` disables all of it and forces final state visible.
  *Note:* `js/main.js` sets inline `opacity:0` for its reveal and ignores the media query, so
  the reduced-motion rule must use `!important` to beat the inline style. Already handled.

---

## 12. Figma mapping — **NOT APPLICABLE**

**There is no Figma library for this brand.** Confirmed by the client on 2026-08-08.

The brief's Figma requirements were template boilerplate rather than a description of an
existing asset. Rather than invent a design system and present it as "approved", the
component system in §8 is derived directly from `Seeto-BrandKit.pdf`, which is unusually
complete — it specifies colour with hex values and a usage ratio, three typefaces with
weights, a type scale, tracking rules, fallbacks, logo lockups with clear-space and minimum
size, voice with say/don't-say examples, and a worked listing-card pattern on p.8.

Every token in §5–§7 traces to a specific page of that document. Nothing here is inferred
from a library that does not exist.

---

## 13. Accessibility requirements

- WCAG **AA** minimum for all text and interactive states; most brand pairs clear AAA.
- Prairie Gold never carries meaning alone (§5).
- Visible focus: 2px Seeto Red outline, 3px offset. Never `outline: none` without replacement.
- Semantic landmarks (`header`/`nav`/`main`/`footer`), one `h1` per page, no skipped levels.
- Skip-to-content link.
- All form fields have persistent visible labels, programmatic association, inline error text
  tied via `aria-describedby`, and a success state.
- Every meaningful image has descriptive alt text; decorative images `alt=""`.
- Explicit `width`/`height` on images to prevent layout shift.
- Full keyboard operability, including the mobile menu and FAQ disclosures.

---

## 14. Do and don't

**Do**
- Let Bone dominate; spend red deliberately.
- Use the red rule to mark section starts.
- Put real numbers in Prairie Gold at display size.
- Write in streets and ISDs — "Plano ISD", "Collin County", not "the market".
- State the risk plainly, including on foreclosure and investment pages.
- Label every placeholder visibly.

**Don't**
- Introduce any colour outside §5, including "just a lighter blue for links".
- Set body copy in Zilla Slab, or the wordmark in anything else.
- Place the logo JPEG on a coloured field — the baked-in white box will show.
- Stretch, recolour, outline, or shadow the mark.
- Invent statistics, testimonials, awards, licence numbers, or listings.
- Use urgency theatre, superlatives, or unearned rankings.
- Ship a rounded-card grid repeated four sections deep.

---

## 15. Approved testimonials

Three real reviews from the Google Business Profile, supplied by the client 2026-08-08.
**These are the only testimonials that may appear on the site.** No others may be written.

| Reviewer | Rating | Age | Substance |
|---|---|---|---|
| Christopher Gilbert | 5★ | ~1 year | Tenant. Responsive on maintenance, informative. "We have used about 10 different property management companies and they have been the best." |
| Dezaree Taylor | 5★ | ~1 year | Rental placement. Credits **Natalie** with booking showings and flagging new properties. |
| Olivia Rosales (Local Guide) | 5★ | ~3 years | Turned down by four mortgage companies; credits **Dan** with closing a purchase in 45 days. |

**Two caveats worth your decision:**

1. **"Natalie" does not appear on the current team roster.** If she has left the firm, quoting
   a review that credits her by name may confuse visitors. Options: use the quote and trim the
   name, use it in full, or drop it.
2. **Two of the three reviews are property-management / rental experiences**, and the third is
   a purchase that started as a rental search. That is a real signal: the firm's strongest
   proof is in management and leasing, not luxury sales. The homepage structure in §17 leans
   into that rather than fighting it.

Attribution will read "via Google" with the star rating shown as text, not as a fabricated
aggregate. **No `AggregateRating` schema** will be emitted — that requires a verified total
review count and average, which we do not have.

---

## 16. Verified credentials

From `lic_history_496025-B.pdf`, Texas Real Estate Commission, current as of 08/08/2026.

| Field | Value |
|---|---|
| Name | Seeto, Michael |
| Licence type | Broker Individual |
| **Licence number** | **496025-B** |
| Status | **Active** |
| Original licence date | **05/06/2002** |
| Expiration | 09/30/2026 |
| Disciplinary actions (10 yr) | **None on record** |

**This corrects a fact the site currently implies.** Michael Seeto has been licensed since
**2002** — 24 years — while the firm was founded in 2010. The brand kit's "20+ years combined"
is therefore conservative and defensible. The site may state "Texas broker since 2002" and
"Seeto Realty founded 2010" as separate, verifiable facts.

Continuing education on record includes Broker Responsibility (2014–2024, repeatedly),
Property Management and Managing Risk, Property Management Essentials, and Commercial and
Investment Real Estate — genuine support for the distressed/investment/management positioning.

**Do not publish** the expiration date (it dates the page and expires in weeks) or the full
course history. Licence number and active status are the useful trust signals.

---

## 17. Team roster (from seetorealty.com/about, 2026-08-08)

Thirteen people, not the two in the brand kit. Headshots for 11 are in `images/team/`.

| Name | Role | Headshot |
|---|---|---|
| Michael Seeto | Broker / Owner | ✓ |
| David Seeto | Associate Broker | ✓ |
| Jennifer Kirk | Investment Specialist & DFW Agent | ✓ |
| Dan Greer | DFW Agent | ✓ |
| Steven Situ | DFW Agent | ✓ |
| Thomas Kunnumpurath | DFW Agent | ✓ |
| Sharon Bartlett | DFW Agent | — |
| John Choi | DFW Agent | ✓ |
| Michael Hancock | DFW Agent | ✓ |
| Mio Yamada | **Houston Agent** | — |
| Anthony Thien Nguyen | DFW Agent | ✓ |
| Chao Gao | **Houston Realtor** | ✓ |
| Carlos Figueroa | DFW Agent | — |

Also appearing on the page without a clear role: Melanie (headshot present), Susanna Leung,
Heco Chen. **Needs confirmation** before publishing.

**This settles the Houston question cleanly.** Two agents cover Houston, but there is no
Houston office. Correct phrasing: *"Agents on the ground in DFW and Greater Houston. One
office, in Plano."* — accurate, and turns the single-office fact into a boutique strength
rather than a gap.

Several agents use personal Gmail addresses rather than `@seetorealty.com`. Brand kit p.8
flags this as housekeeping. **Recommend showing a single firm contact route** on the site
rather than publishing mixed personal addresses.

---

## 19. Hero photography

Source: `sunset-g296d65247_1920.jpg`, already hosted on the client's live site — the same
Dallas skyline the client supplied. Original 1920×751.

Delivered as `images/hero/dallas-skyline-{480,768,1280,1920}.{webp,jpg}` — WebP first with a
progressive JPEG fallback, served via `<picture>` + `srcset`/`sizes`. Total 472 KB across all
eight files. Explicit `width`/`height` prevent layout shift.

**Scrim opacity is measured, not chosen.** The brightest pixel inside the headline region of
the photograph is effectively white, giving Bone text 1.12:1 over the raw image — a clear
failure. Compositing Roofline Ink over it at:

| Scrim | Bone contrast | |
|---|---|---|
| 0.60 | 4.32:1 | fails AA |
| 0.65 | 5.08:1 | AA |
| **0.75** | **7.34:1** | **AAA** |

The desktop gradient therefore never drops below **0.76** across the text column
(0.90 → 0.82 → 0.76 → 0.32 left to right, so the skyline stays visible on the right).
On mobile the gradient rotates to vertical and strengthens, because the headline would
otherwise sit over bright sky rather than the darker foreground.

`images/og-home.jpg` (1200×630) is cropped from the same photograph, closing the last
social-preview gap.

## 20. Deviations from the brand kit

Recorded rather than silently applied.

| Deviation | Reason |
|---|---|
| **Display floor 42px below 640px**, against the kit's 54–82 scale | 54px is a desktop figure. At 375px it cost three lines and pushed both CTAs below the fold. The 54px floor still applies from 640px up. |
| Header CTA hidden below 900px | It overflowed a 375px viewport. The hero's primary CTA carries the action on mobile. |
| Prairie Gold used for hero eyebrow and contact-band labels | Gold fails on Bone (2.1:1) but measures **7.64:1 on Ink**, so it is confined to Ink fields. |

## 21. UI/UX Pro Max — conflicts, and what was taken

The skill's `--design-system` output was **not applied to the visual system**, because it
contradicts both the brand kit and the client's stated non-negotiables:

| Skill recommended | Conflict |
|---|---|
| Palette `#0F766E` teal / `#0369A1` blue | Brief: "Do not use generic blue real estate styling"; brand is Seeto Red |
| Cinzel + Josefin Sans | Brand kit specifies Archivo + Source Serif 4 + Zilla Slab |
| Skeuomorphism, rated "Performance ❌ Poor" | Brief: avoid heavy decoration; kit is flat with hairline borders |
| Pattern "Real-Time / Operations Landing" | Wrong product type for a brokerage |

**What was taken from the skill:** its accessibility, touch-target, performance, layout and
motion checklists, which drove the measured scrim, the 44px hit-area pass, the WebP/`srcset`
work, the single staged hero reveal, and the 375/768/1024/1440 sweep.

## 22. Guards added

Two defects reached production or near-production because nothing checked them locally.
Both now have tests.

- `test/vercel-config.test.js` — a `_comment` key inside a `vercel.json` header entry broke
  four consecutive production deploys, failing before the build so it produced no logs.
- `test/css-tokens.test.js` — `var(--roofline-ink)` against a token named `--ink` resolved to
  nothing, rendering a full-width Ink band transparent with invisible text. Also asserts the
  brand hex values have not drifted and that no blue/purple hex is introduced.
