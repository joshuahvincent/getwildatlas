# Wild Atlas — Launch Checklist

Editorial, brand, and strategic work derived from the *Wild Atlas Marketing Launch Plan v2* (May 12 2026). Items here are intentionally **not** GitHub Issues — they're conversational, iterative, and live closer to the code than an issue thread would. Anything that grows scope or needs scoped engineering gets promoted to a GitHub issue at that moment.

**Companion tracking:** small mechanical fixes and new-page builds live as GitHub Issues (10 total — see `../create-launch-issues.sh` for what was filed).

**Migration note:** Until [getwildatlas#2](https://github.com/joshuahvincent/getwildatlas/issues/2) cuts over, most of these items land first in `wildatlas/website/` (the currently-deployed site) and migrate here later. Don't pre-emptively split work into this repo just because of the intended end state — see `CLAUDE.md`.

---

## Current live site — small polish (lands in `wildatlas/website/` today)

- [ ] **Fix the "150+ Beautiful Animals" overpromise.** The animal strip shows the same 7 animals duplicated. Either expand the strip to ~20+ distinct animals before the duplicate-for-loop, or change the headline to match what's shown. Audience is high-skepticism; this mismatch reads as overpromise.
- [ ] **Verify pack mascot filenames against in-app names.** Some pairs drift (`bird-buddies.png` → "Feathered Friends", `hoppy-amphibians.png` → "Rainforest Explorers", `arctic-adventures.png` → "Planet Pioneers"). Either rename images or update the `<h4>` to match the canonical iOS app pack names.
- [ ] **Move "Available in 4 Languages" higher in the page order.** Day-one multilingual reach is a strategic advantage per the brief. Currently buried mid-page; should land on the second scroll or be integrated into the under-hero trust strip.

## The brand pivot — bolting "Raise explorers, not scrollers" onto the page

This is the central editorial work for launch. The page today is a competent feature sheet; the brief asks it to be a brand. These items are iterative — expect drafts, voice review, and multiple passes per item.

- [ ] **Add the tagline to the hero.** "Raise explorers, not scrollers" should anchor the page. Two treatments to consider — promote to H1 with current headline as eyebrow kicker; OR keep current H1 and place tagline as oversized strap below. Lean toward the first. Must also propagate to `<title>`, meta description, OG, and Twitter card. Localize to DE/ES/FR.
- [ ] **Add the "no ads / no algorithms / no reading / COPPA-compliant" trust strip.** Slim horizontal bar directly under the hero. Four pillars, each with a small icon. Conscious-parent audience needs to see these credentials inside the first scroll. Today they're buried as bullet 5 in the For Parents section.
- [ ] **Add the "Two children" emotional hook section.** Per brief §14, the campaign narrative is "Every parent has seen both children" — the glazed one and the wide-eyed one. Validates the screen-time guilt before resolving it. ~80–120 words between hero and feature grid. This is the emotional pivot that separates Wild Atlas from feature-led competitors.
- [ ] **Add the "digital antidote" / nature-deficit framing section.** Short editorial section invoking Louv, the 30-minutes-outdoors stat, and the Attenborough Effect. ~60–80 words. Links to a long-form blog post (depends on the `/journal` issue). This is the PR hook journalists will pick up.
- [ ] **Reframe the email signup as the "Tiny Explorer Club."** Today it's a transactional $2.99 unlock code. Same mechanism (Formspree still works), new framing — community + content, not transaction. Welcome message reframed too. Per brief §15, this is the retention/advocacy play, not a discount mechanic.
- [ ] **Reorder sections to a brand-led funnel.** Today's order is product-led: hero → features → discover → scale → map → languages → packs → animals → parents → signup. Brand-led order: hero (with tagline) → trust strip → "Two children" hook → 3-up differentiation → product proof → packs → social proof/press → For Parents → For Educators → Tiny Explorer Club signup → footer. Depends on the tagline/trust strip/two-children items landing first so there's a new top of the page to anchor against.

## Visual / asset work

- [ ] **Replace the mascot-only hero visual with a "discovery moment" composition.** The brief is explicit — the hero should be a child mid-discovery, not a mascot on a blank background. Until real UGC arrives, an in-app screen composited with a child's hand/expression context is the minimum. Mascot stays in the design system but moves to a secondary placement.
- [ ] **Add real in-app product screenshots.** At least 4 screens at App Store dimensions: home/pack picker, world map, size comparison, an animal page with the TTS speaker visible. Currently there isn't a single actual iPhone/iPad screen on the page. Coordinate with the iOS app team for build version + locale.

## Parked (revisit closer to launch)

- [ ] **Build 3 ASO Custom Product Pages (Wonder / Safety / Education).** Per brief §15.3. Mostly App Store Connect work, not website code — the matching website query paths (UTM-tagged) are the small half. Parked until closer to launch when App Store Connect submission is in flight.

## Pre-launch — China readiness

Updated 2026-05-13: Josh confirmed China is a launch market, not post-launch. The website-source-code piece of this (zh-Hans i18n bundle, language picker, "Available in 5 Languages" copy) **landed in `wildatlas/website/` on 2026-05-13** and is awaiting native review + the operational items below.

- [x] **Add zh-Hans to the website i18n bundle.** Done — full translation block in `js/translations.js`, picker shows 中文, flag emoji added to languages section, 81/81 keys covered per the coverage validator.
- [ ] **Native Chinese translator review of the entire zh-Hans block.** The current strings are my draft. Tagline uses "刷屏族" which is real Chinese internet slang for compulsive screen-scrollers — worth a native gut-check that it lands as intended and doesn't read as too colloquial for a premium brand.
- [ ] **Confirm mainland-China hosting viability.** Cloudflare Pages does not perform well from inside mainland China without specific peering arrangements. Decide pre-launch whether to (a) accept slow load times, (b) front with a China-friendly CDN, or (c) host a mirror inside China. Each option has a different timeline.
- [ ] **ICP filing / regulatory.** Foreign-hosted sites serving Chinese audiences operate in a grey zone for kids products. Confirm legal posture — domestic ICP registration, content review obligations under the 2021 update, age-rating compliance — before pushing CN-targeted ads or PR.
- [ ] **PIPL (Personal Information Protection Law) compliance review.** Affects email signup form, analytics, any data collection from Chinese users. Likely needs a separate Chinese-language privacy notice referenced from the Chinese version of the page.
- [ ] **App Store China presence.** Verify the app is listed on the mainland China App Store (separate listing from the worldwide store) and that the website's "Download on the App Store" badge can route Chinese users to it. Out of website-side scope but blocks the China launch funnel.

## Post-launch — language expansion order

Tracked here so we don't lose the sequencing. Confirmed with Josh 2026-05-13.

- [ ] **Brazilian Portuguese (pt-BR).** Confirmed as the first post-launch language addition. Both app and website. ~215M speakers, lines up with the brief's LATAM target. Revisit at the 90-day post-launch review based on actual LATAM install data.
- [ ] **Future contenders, ranked:** Italian → LATAM Spanish variants (es-MX) → others. Each decision should be data-led from install/retention numbers, not from brief speculation.

## Locale drift — decided

Surfaced by `website/scripts/check-locale-coverage.sh` (run from website root):

- [x] **`en-GB` on the website — declined.** The iOS app ships an `en-GB.lproj` for British English copy variations; the website does not and will not. Cost of maintaining a fifth English variant exceeds the value — `en` covers both audiences, the locale resolver falls back `en-GB → en` automatically, and the brand voice doesn't lean on -our/-er spelling differences for differentiation. Decision made by Josh 2026-05-13. The drift-check script should be updated to suppress this specific warning (treat as documented intentional drift, not a finding).

---

## How to use this list

1. Pick an item. Talk through it with Cowork (or Claude Code if it's grown teeth).
2. Iterate on copy/design until it's ready to ship.
3. Land the change as a commit (in `wildatlas/website/` if current-site, here if forward-looking).
4. Check the box.
5. If the item turns out to need scoped engineering work, design discussion across multiple sessions, or a PR thread that benefits from history — promote it to a GitHub issue and reference it back here.

When the migration (#2) lands, the current-site items in this list either get retired (because they shipped) or move to the new home. Either way the list survives.
