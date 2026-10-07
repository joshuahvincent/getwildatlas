# Riverbend concept screens — design note

**Round 2 (2026-10-06), from Josh's review notes:** "Add a place" smaller; pack-page and Home copy no longer assume a same-day visit ("Meet the animals that live at Riverbend…", pill "Visited"); 118-character place description above the stats; For grown-ups card replaced by a **Learn more** pill (website, behind the parental gate, same F11 teal pair, 7.61:1); every Top Exhibits card is now a photo (two new Gemini photos via `gen_scenes.py`: `otterbay`, `rainforest`). Sections below describing the For grown-ups card and the duo animal tiles are superseded by this round.

Three PNGs, 1206x2622, screen only: `run-home-places.png`, `run-pack-top.png`, `run-pack-lower.png`.

## How they were made (read first)

**Drawn, not rendered from the app.** HTML/CSS built to the shipped components' specs, screenshotted headless at 402x874 @3x. It uses the app's real fonts (Fredoka, Nunito), real pack mascots (`GeneratedPackMascots`), real animal hero art, and the real back, lock, pin and treasure icons. It is not a SwiftUI render, so it is "same standard", not pixel-identical. Source and generator are in `source/` (`python3 gen.py`, then `shot.sh`).

The status bar is drawn. A cream scrim sits under it on Home so the scrolled-out Happy Hounds row doesn't collide with the clock. The app has no such scrim, so this is a cosmetic liberty.

I omitted the "Sample facts for a fictional venue" caption from your layout, since the app wouldn't show it. **The partner page should label these as concept.**

## Checklist

**A. System**
- Palette: pass. All AppTheme tokens, plus a manifest-style venue pack palette (accent `#1F6A85`, wash `#EAF6FB`), which pack surfaces are meant to have (DESIGN_SYSTEM §1 "Off-token by design"). peachPop is not used anywhere. That is correct, because the Home CTA is off-screen and no new primary action exists.
- Fonts: pass. Fredoka and Nunito only. Nunito 600 renders as 700 (only Regular and Bold ship).
- Radius/stroke/shadow: pass.
  - Home tiles r10, gradient + offset base (HomeView.swift:2480-2560).
  - Places card r20, GameDen style (GameDenView.swift:643).
  - Fact and exhibit cards r16/r22 with 2pt warmBark.
  - Shadows 0.08–0.14.
- Canonical components reused:
  - Pack tile (HomeView.swift ~2470).
  - GameDenCardLayout, pill and NEW! capsule (GameDenView.swift:643-814).
  - Pack hero header (PackAndAnimalPages.swift:2650).
  - 3x3 grid (:3100).
  - PageDots (PageDots.swift).
  - Paw progress card (:5585).
  - Back button.
  - Utility card = F11 pair.
- **Doc drift found:** DESIGN_SYSTEM §4 says AnimalTile is r10 with a 2pt warmBark stroke. `AnimalTile.swift` was deleted in #689. The shipped grid tile (PackAndAnimalPages.swift:3338-3350) is white, **r24, 1pt warmBark@0.15**, Nunito bold 12. I matched the shipped code, not the doc, so the pack page looks like the real Dino page. New cards (fact tiles, exhibits, Places) use the documented 2pt warmBark idiom. DESIGN_SYSTEM §4 and §7 need an update (separate thread).

**B. Kids**
- Pass, TC-1/TC-7:
  - The map-pin icon plus the NEW! capsule find "My Places" with no reading.
  - The Riverbend tile is the only emblem tile on Home.
  - The whole card is the tap target, far above 44pt.
  - Page dots are 46pt.
  - The "Find it on the map" pill is 44pt, with a pin icon.
- Page 1 is exactly the 9 animals the child "met today". They carry the shipped visited checkmark, and the paw card shows 9/27. It is consistent with the "9 animals" pill on Home.
- Nothing needs reading to proceed. The "Add a place" tile only opens a gate.

**C. Compliance**
- AR-1: pass. "Add a place" and "For grown-ups" are gate-first (AR-1), reusing `ParentalGateController`. No new gate is invented.
- AR-2: **open item.** "Find it on the map" must open a bundled, venue-supplied illustrated map. A third-party maps SDK or tile service would violate AR-2. In a build this needs Ingrid's first-party design.
- AR-3: pass. The ticket copy is addressed to grown-ups, and no commerce is shown to the child.
- Strings: this skill wrote none for production. All copy is sample copy and would go through the i18n skill.

**D. Accessibility (contrast computed, not eyeballed)**
- warmBark on the utilityTeal wash `#D5EDEC`: **7.61:1** (the F11 pair).
- warmBark on sunnySounds, NEW! text: **6.86:1**.
- warmBark on skyTweeter, active page number: **5.86:1**.
- Venue accent `#1F6A85` on its 12% pill wash: **5.11:1**.
- White check on the accent paw dot: **~6.1:1**.
- Subtitle text is warmBark at 0.92 on pack tiles. This avoids F3.

**Deviations from the shipped look (all to avoid extending F-findings):**
1. **NEW! text is warmBark, not white.** White on sunnySounds is F2 at 1.36:1. The shape and star match GameDenCardBadge.
2. **Active page-dot numeral is warmBark, not white.** Shipped white on skyTweeter is **1.59:1**. This is an **unregistered finding in the F1/F2 family**, worth adding to the register.
3. **Pack-tile subtitles are 0.92 opacity, not 0.78** (F3).
4. Unvisited paw dots use warmBark 0.55 glyphs as shipped. That is decorative, and the caption carries the meaning (AX-5).

**E. Motion:** n/a (static). In a build the Places tile would use the standard `DelightPressStyle` only, with no throb, because the single attention motion stays on the Home CTA (MO-2).

**F. Session/ethics:** pass. No streaks and no urgency. "Visited today" is a statement, not a timer. The NEW! capsule is not a countdown.

**TC-4b:** the For grown-ups card has no mascot. It uses the gold lock icon, which is the shipped "locked pack" art. See the question below.

## Open questions

1. **"My Places" vs "My Visits":** keep **My Places**. It is a noun that matches the pin icon. For a pre-reader the pin does the work (TC-1), and "Visits" is an abstract event word. Needs Josh if he prefers the other.
2. **Map preview card above Top Exhibits:** **no.** It adds a third vertical block, so the page scrolls more (F9). The per-exhibit pills already open the map. A map would belong on the exhibit sheet, not the pack page.
3. **"Add a place" on Home:** **keep it in the pitch, but not in a build.** For the pitch it shows how places arrive. In a real build I'd show it only when My Places is empty (first-run), and move the persistent entry to the grown-up side (rail or settings). A permanent gate-only tile on the kid surface is a mine-sweep dead end (NN-5), though it is harmless because it only opens the gate. Needs Josh.
4. **Emblem in a circle vs a mascot-style illustration:** the emblem is a logo, which reads as adult brand. Kids bond with characters (TC-4). For the pitch the emblem is right, because the venue stays recognisable. For a build I'd commission a venue buddy in the pack-mascot style (octopus is natural), with the emblem as the small corner mark. **Needs Josh.**

## One more flag

The gold padlock on the For grown-ups card reads as "locked pack" elsewhere in the app. A teal-tinted or outline lock would fit the utility language better. This is cosmetic and I left the shipped art in.
