# Wild Atlas 2.0 website: staging notes

Branch `preview/website-2-0` (cut from `origin/main`). Built from the 2026-10-28 brief
(`PetPeeper/marketing/launch-1-0-7/website-2.0-handoff/HANDOFF.md`). Staging only: do not merge or
deploy until Roger confirms 2.0 is released and the Super Spiders pack is live (wildatlas#1175).

## What is where

| Brief section | Files |
|---|---|
| 1. Facts | `index.html`, `js/translations.js` (numbers in all five blocks), `js/legal-translations.js` (age-suitability bullets), `partners.html`, `schools.html`, `content/calendar/*.md`, `content/press/app-store-description.md`, `print-sources/partners-one-pager.html` |
| 2. Hero + "Every page is a world" | `index.html`, `css/world.css`, `js/world.js`, `assets/v2/` |
| 3. Press page + kit | `press.html`, `press-release.html`, `press-fact-sheet.html`, `assets/press/`, `press-kit-staging/<locale>/` |
| 7. Background options | `js/world-bg.js` (all pages), `css/world.css` (A, B), `css/scenery.css` (C) |

## Strings for de / es / fr / zh (stubbed, falls back to English)

Add to each locale block in `js/translations.js`. `scripts/check-locale-coverage.sh` and the console
will list them until they land.

`hero.sub1`, `hero.sub2`, `hero.whatsnew`, `worlds.title`, `worlds.cap1`, `worlds.cap2`, `worlds.cap3`,
`worlds.count`, `packs.spider_world`. The pack rail reuses the existing `packs.*` keys, so the 13
existing pack names are already translated.

Not stubbed, needs a decision: `lang.desc` in de/es/fr/zh still lists five languages (the title and
bullets say six). There is no `en-GB` site locale (`supportedLocales` is en/de/es/fr/zh).

## Background options (staging comparison)

`?bg=a` Camp horizon · `?bg=b` Pack worlds band · `?bg=c` Scenery edges · `?bg=off`. Default is now A (sky, sun/moon, themed cloud, camp); the app-world strips under "Explore the Whole World" and the packs grid are always on.
A small "BG" switcher appears bottom-left on any host except `wildatlasapp.com` / `www.`; the choice
sticks for the tab. `?sky=dawn|day|dusk|night` previews a time of day for option A.
Everything is gated off on the production hostnames, so merging this branch cannot show a switcher.

When Josh picks one: set `DEFAULT_OPTION` in `js/world-bg.js`, delete the other two options' markup
and CSS, then delete the switcher.

## Known gaps

- `scene-layers/ocean_creatures/` and `scene-layers/spider_world/` were empty in the handoff, so option B
  cross-fades Dino Roars and Safari Stars instead of Dino and Ocean.
- No 2.0 size/weight screenshot was supplied, so the gorilla and great-white images in "How Big? How Heavy?"
  are still the old-app art.

- Hero is the approved J1 car reel (v22, signed off 2026-10-29): `assets/v2/reel/` (720x1280 mp4, 5.1 MB, fetched only when the visitor taps play; poster 15 KB webp). Portrait player, no phone bezel. The walkthrough and sun-to-moon loops are gone. Rail mascots reuse `assets/mascots/*` (the handoff `pack-mascots/` PNGs have a baked-in white/checker background).
- Reel strings `hero.reel.t1-t3`, `hero.reel.transcript` are English-only and still need the i18n skill and advisor pass; the play button's `aria-label` is a static English string in `index.html`. The 1080x1920 reel is for the press kit only.
