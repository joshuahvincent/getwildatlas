# Riverbend concept screens — design note (round 2)

Deliverables, all in this folder:
- `run-home-places.png`, `run-pack-top.png`, `run-pack-lower.png` (1206x2622, screen only)
- `riverbend-flow.mp4` (24 s, 1206x2622, 30 fps)
- `source/` (generator scripts, assets, web copies)

## What changed in round 2

Josh's round 1 review notes, and how each was handled:

| Round 1 note | Change |
|---|---|
| Home: make "Add a place" smaller | Tile height 92 → 58 pt, icon 38x46 → 26x32, title 21 → 17, caption 13.5 → 12.5. Still a dashed tile, still ≥44 pt tall, still gate-first. |
| Pack page: the summary assumes the child visited that day | Header summary is now "Meet the animals that live at Riverbend, and discover more at home." |
| (Same logic, not requested) | Home caption "Meet the animals you saw today" → "Meet the animals that live here"; pill "Visited today" → "Visited". No copy claims a same-day visit any more. |
| Lower: add a ~140-character description above the stats | 118 characters under "About Riverbend": "A river-city aquarium where otters float, jellyfish glow and a giant ocean tank waits. Come meet the animals up close." Nunito 13.5 bold, warmBark 0.92. |
| Lower: remove "For grown-ups"; instead "Learn more" linking to the venue website behind an age gate | Card removed. A full-width **Learn more** pill replaces it: `utilityTealWash` fill, `utilityTeal` 2 pt stroke, warmBark Fredoka 19 and Nunito 12.5 text, 64 pt tall, lock icon, caption "Opens the website after a grown-up check". Reuses the F11 pair. |
| Lower: use a photo of the exhibit for every Top Exhibits card | Otter & Sea Lion Bay and Rainforest Gallery are now photos, like Jellyfish Hall. Two new Gemini photos (`otterbay.jpg`, `rainforest.jpg`) generated with the existing `gen_scenes.py`; prompt and model are saved next to each image in `aquarium/`. All five cards are now photos. |

Layout knock-on: the lower screen is rescrolled and the exhibit photos are slightly shorter so the description, stats, exhibits and Learn more still fit one screen. The paw card is partly scrolled under the status bar.

## How they were made (read first)

**Screens: drawn, not rendered from the app.** HTML/CSS built to the shipped components' specs, screenshotted headless at 402x874 @3x. Real fonts (Fredoka, Nunito), real pack mascots (`GeneratedPackMascots`), real animal hero art, and real back, lock, pin and treasure icons. It is "same standard", not pixel-identical. Regenerate with `python3 gen.py` then `shot.sh` in `source/`.

**Video: part real, part drawn.**
- **Real:** the Home top (mascot, rails, greeting, My Packs) is a real app screenshot. The Sea Otter page is a real screen recording of the app (Legends of the Wild pack), including its scrolling.
- **Drawn:** Home from My Places down, and the whole Riverbend pack page, from the same drawn assets as the PNGs. There is a faint seam below the My Packs row.
- **Added:** tap ripples and push transitions.
- **Sea Otter capture:** Sea Otter lives in the paid Legends pack, which was locked on the booted test sim. I captured it on a throwaway simulator using the Debug Tools unlock for that one pack, launched in screenshot mode (so the debug language bar and Mix pill don't show), with analytics declined. That simulator is deleted. The existing sims were not touched.
- In the pack-page scroll the top bar (back, title, chest) scrolls away with the content and only the status bar stays pinned. Whether the real app pins it was not checked.
- Fixed after review: the pack-page scroll briefly showed the paw card twice. The video was rebuilt; the PNGs were never affected.

The status bar is drawn. A cream scrim sits under it on Home so scrolled-out content doesn't collide with the clock. The app has no such scrim.

I omitted the "Sample facts for a fictional venue" caption from the screens, since the app wouldn't show it. **The partner page should label these as concept.**

## Checklist

**A. System**
- Palette: pass. AppTheme tokens plus a manifest-style venue pack palette (accent `#1F6A85`, wash `#EAF6FB`), which pack surfaces are meant to have (DESIGN_SYSTEM §1 "Off-token by design"). peachPop is not on any screen. The only peachPop element anywhere is the Home "Unlock more worlds" button in the video's drawn Home scroll, and it sits off-screen.
- Fonts: pass. Fredoka and Nunito only. Nunito 600 renders as 700 (only Regular and Bold ship).
- Radius/stroke/shadow: pass.
  - Home tiles r10, gradient + offset base (HomeView.swift:2480-2560).
  - Places card r20, GameDen style (GameDenView.swift:643).
  - Fact and exhibit cards r16/r22 with 2 pt warmBark.
  - Learn more is a capsule.
  - Shadows 0.08–0.14.
- Canonical components reused:
  - Pack tile (HomeView.swift ~2470).
  - GameDenCardLayout, pill and NEW! capsule (GameDenView.swift:643-814).
  - Pack hero header (PackAndAnimalPages.swift:2650).
  - 3x3 grid (:3100).
  - PageDots (PageDots.swift).
  - Paw progress card (:5585).
  - Back button.
  - Utility row pair (F11) for Learn more.
- **Doc drift found:** DESIGN_SYSTEM §4 says AnimalTile is r10 with a 2 pt warmBark stroke. `AnimalTile.swift` was deleted in #689. The shipped grid tile (PackAndAnimalPages.swift:3338-3350) is white, **r24, 1 pt warmBark@0.15**, Nunito bold 12. I matched the shipped code. A real Legends pack page captured during the video work confirms this. New cards (fact tiles, exhibits, Places) use the documented 2 pt warmBark idiom. DESIGN_SYSTEM §4 and §7 need an update (separate thread).

**B. Kids**
- Pass, TC-1/TC-7:
  - The map-pin icon plus the NEW! capsule find "My Places" with no reading.
  - The Riverbend card is the only emblem tile on Home, and the whole card is the tap target.
  - Page dots are 46 pt. The "Find it on the map" pill is 44 pt with a pin icon.
  - All five exhibits are now photos, so a pre-reader can tell them apart by picture.
- Page 1 shows 9 animals with the shipped visited checkmark, and the paw card shows 9/27. The "9 animals" pill on Home matches. The checkmark now means "found in the app", not "seen today".
- Nothing needs reading to proceed. "Add a place" and "Learn more" only open a gate.

**C. Compliance**
- AR-1: pass. "Add a place" and "Learn more" both sit behind the parental gate, reusing `ParentalGateController`. No new gate is invented.
- AR-2: **open item.** "Find it on the map" must open a bundled, venue-supplied illustrated map, not a third-party maps SDK or tile service. **Learn more** is a link-out to the venue's own website after the gate, opened outside the app, with no embedded web view and no SDK. In a build this needs Ingrid's first-party design.
- AR-3: pass. The ticket copy that was on the old For grown-ups card is gone, so no commerce wording remains on these screens.
- Strings: this skill wrote none for production. All copy is sample copy and would go through the i18n skill.
- **Photo constraint flag (new):** the brief says no dolphins, whales, belugas or sharks. The Ocean Tunnel photo (`aquarium/tunnel.jpg`, generated in round 1) was prompted with "sharks and a manta ray". The Ocean Tunnel card is the fifth card in the horizontal row, so it is **not visible in any delivered PNG or in the video**. If the row is ever shown scrolled, or the photo is reused, regenerate it with the tunnel prompt minus sharks.

**D. Accessibility (contrast computed, not eyeballed)**
- warmBark on the utilityTeal wash `#D5EDEC` (Learn more): **7.61:1**.
- warmBark on sunnySounds, NEW! text: **6.86:1**.
- warmBark on skyTweeter, active page number: **5.86:1**.
- Venue accent `#1F6A85` on its 12% pill wash: **5.11:1**.
- White check on the accent paw dot: **~6.1:1**.
- Subtitle text is warmBark at 0.92 on pack tiles. This avoids F3.
- Description text is warmBark 0.92 on the venue wash `#EAF6FB`; the same pairing as the other body text (warmBark on `#EAF6FB` = 8.46:1 at full opacity).

**Deviations from the shipped look (all to avoid extending F-findings):**
1. **NEW! text is warmBark, not white.** White on sunnySounds is F2 at 1.36:1. The shape and star match GameDenCardBadge.
2. **Active page-dot numeral is warmBark, not white.** Shipped white on skyTweeter is **1.59:1**. This is an **unregistered finding in the F1/F2 family**, worth adding to the register.
3. **Pack-tile subtitles are 0.92 opacity, not 0.78** (F3).
4. Unvisited paw dots use warmBark 0.55 glyphs as shipped. That is decorative, and the caption carries the meaning (AX-5).
5. The drawn "Unlock more worlds" button in the video's Home scroll uses warmBark text (4.63:1), not the shipped white (F1, 2.01:1). It is not visible in the video.

**E. Motion:** the PNGs are static. The video's ripples and push transitions are presentation only, not proposed app motion. In a build the Places tile would use the standard `DelightPressStyle` only, with no throb, because the single attention motion stays on the Home CTA (MO-2).

**F. Session/ethics:** pass. No streaks and no urgency. Round 2 also removed the "today" claims, so nothing implies a visit that may not have happened. The NEW! capsule is not a countdown.

**TC-4b:** no mascot on the Learn more pill. It uses the gold padlock icon, which is the shipped "locked pack" art. See the flag below.

## Open questions (my recommendations; Josh's votes so far: label up, map up)

1. **"My Places" vs "My Visits":** keep **My Places**. It is a noun that matches the pin icon. For a pre-reader the pin does the work (TC-1), and "Visits" is an abstract event word. Josh voted thumbs up on the recommendation.
2. **Map preview card above Top Exhibits:** **no.** It adds another vertical block, so the page scrolls more (F9). The per-exhibit pills already open the map. Josh voted thumbs up on the recommendation.
3. **"Add a place" on Home:** keep it in the pitch, shown smaller. In a real build I'd show it only when My Places is empty (first-run), and move the persistent entry to the grown-up side (rail or settings). A permanent gate-only tile on the kid surface is a mine-sweep dead end (NN-5), though it only opens the gate. **Needs Josh.**
4. **Emblem in a circle vs a mascot-style illustration:** the emblem is a logo, which reads as adult brand. Kids bond with characters (TC-4). For the pitch the emblem is right, because the venue stays recognisable. For a build I'd commission a venue buddy in the pack-mascot style (octopus is natural), with the emblem as the small corner mark. **Needs Josh.**

## One more flag

The gold padlock on the Learn more pill reads as "locked pack" elsewhere in the app. A teal-tinted or outline lock would fit the utility language better. This is cosmetic and I left the shipped art in.
