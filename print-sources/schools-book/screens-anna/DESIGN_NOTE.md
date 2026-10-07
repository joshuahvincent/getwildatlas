# Pebble Brook school pack: concept screens and video — design note (round 3)

**Round 3 (2026-10-07), from Josh:** the pack is **school-wide, not per class**. The school and its kids pick the 18 animals once, and every class at the school uses the same pack, so no new pack per class. Renamed throughout: "Pebble Brook's Pack" (tile, page title, header), caption "The 18 animals our school picked", header line "Our school picked these animals. Let's meet them!", pills "Our school" and "18 animals", cue "From Pebble Brook's pack". No "Room 4" or "class" wording remains on the screens or in the video. Screens, video and poster remade; layout is unchanged from round 2 (class/school sits under My Places). Wherever the sections below say "Room 4", "class" or "class code", read "school" (the grown-up code idea still applies, now one school code). **The schools page copy, vote booklet and activity book still say Room 4 and class; they need the same change.**

**Round 2 (2026-10-07), from Josh:** the class lives under **My Places**, alongside zoos and aquariums, instead of a separate "My Class" section. Home now shows one My Places section (subtitle "Zoos, aquariums and schools") with the Riverbend Aquarium card and the Room 4's Pack card (NEW!), plus the small dashed "Add a place" tile. Screens, video and poster were remade. The Riverbend card is the same fictional-aquarium card from the partner screens, used here to show that places include schools; **it needs Josh's OK before it appears on the schools page.** The tap in the video still goes to the class tile. Q1 below is answered; the "My Class" wording in earlier sections is superseded.

Fictional school: **Pebble Brook Elementary, Room 4**. Concept only, nothing here is built.

## Deliverables (this folder)

- `school-home.png`: Home scrolled to the class tile (1206x2622)
- `school-pack-top.png`: class pack page, top (1206x2622)
- `school-animal.png`: Golden Retriever page with the "From Room 4's pack" cue (1206x2622)
- `school-flow.mp4`: 22.7 s, web version 604x1312, about 1.2 MB, no audio
- `school-flow-poster.jpg`: poster frame (604x1312), the class-tile Home screen
- `source/`: generator scripts, assets, and the 1206x2622 master video

## Real app footage vs drawn

| Piece | Real or drawn |
|---|---|
| Home top: mascot, rails, My Packs tiles | **Real** app screenshot (simulator, screenshot mode) |
| Home greeting | **Real**, with the profile name **repainted out**: "Good afternoon, <name>!" became "Good afternoon!" so no name appears anywhere |
| Home from the class section down (My Class, Explore More tiles) | **Drawn** (HTML to the app's component specs; real fonts, mascots and icons) |
| Class pack page, pages 1 and 2 | **Drawn**, using the real animal art |
| Golden Retriever page (screen and video scroll) | **Real** capture and screen recording of the app |
| "From Room 4's pack" cue on that page | **Drawn** overlay, tracked to the page scroll |
| Tap ripples, push transitions | **Added** (presentation only, not proposed app motion) |

Capture setup: a throwaway simulator running the existing debug build in screenshot mode (no debug bars), free Happy Hounds pack only, no unlocks, no analytics. It has been deleted. No school photos, student names, teacher names or child data are used. The visited checkmarks (3 of 18) are synthetic demo state.

## Checklist

**A. System**
- Palette: pass. AppTheme tokens plus a manifest-style class-pack palette taken from the school emblem (accent `#2F6B4F`, wash `#EAF5EE`, tint `#C9E6D3`), the same way pack surfaces get their own palette (DESIGN_SYSTEM §1). peachPop appears nowhere on the three screens.
- Fonts: Fredoka and Nunito only. Pass.
- Shape and stroke: Home tiles r10 with offset base (HomeView.swift ~2480-2560); class card r20, Game Den style (GameDenView.swift:643) with 2 pt accent stroke; header card r22; animal tiles r24 with a 1 pt hairline, which is the **shipped** tile (PackAndAnimalPages.swift:3338-3350); emblem ring 2.5 pt warmBark. Shadows 0.08–0.14.
- Reused components: pack tile, GameDenCardLayout with pill and NEW! capsule, pack hero header (PackAndAnimalPages.swift:2650), 3x3 grid (:3100), PageDots, paw progress card (:5585), back button.
- Doc drift (carried over): DESIGN_SYSTEM §4 still describes the deleted `AnimalTile` (r10, 2 pt stroke).
- **New fidelity gap found:** the real pack page background is a faint tiled pattern of pack mascots (seen in the Happy Hounds capture). My drawn pack pages (here and in the Riverbend screens) use a dot pattern. Cosmetic; not fixed.

**B. Kids**
- A pre-reader finds the class tile by the school emblem, which also sits next to the section title, plus the NEW! capsule. The whole card is the tap target (TC-1, TC-7).
- Page buttons are 46 pt, not 44 pt targets squeezed.
- Nothing on the three screens needs reading to proceed. The class code is not shown to the child (see Q2).
- The cue "From Room 4's pack" is an emblem plus a short phrase, so the picture carries it.

**C. Compliance**
- AR-1: the class code redemption (families, "PEBBLEBROOK") is a grown-up action and sits behind the parental gate, reusing `ParentalGateController`. It is not drawn on these screens.
- AR-2: no third-party SDKs or data. The mockup involves no tracking and no student data.
- AR-3: no commerce is shown to the child.
- Strings: all copy is sample copy and would go through the i18n skill.

**D. Contrast (computed)**
- Accent `#2F6B4F` on its 12% pill wash: **5.30:1**. White check on accent: **6.29:1**. Accent on `#EAF5EE`: 5.63:1.
- warmBark on white 9.32:1; on the wash `#EAF5EE` 8.34:1; on the tint `#C9E6D3` 6.98:1.
- NEW! text, warmBark on sunnySounds: **6.86:1** (not the shipped white at 1.36:1, F2).
- Active page number, warmBark on skyTweeter: **5.86:1** (shipped white is 1.59:1, unregistered F1/F2-family finding, still open).
- The drawn "Unlock more worlds" button (off-screen in the screens, visible nowhere in the video) uses warmBark on peachPop, 4.63:1, not the shipped white (F1).

**E. Motion:** static screens; video transitions are presentation only. **F. Session/ethics:** no streaks, no urgency, nothing implies a visit or a child's activity.

## Open questions (flagged, not decided)

1. **Class section label on Home. ANSWERED by Josh: the class sits under My Places.** (Round 1 used My Class.) Reason: "My Places" (the zoo and aquarium label) names a location, while a class is a group of friends, and "My Class" is concrete and matches the school emblem I put next to the title. A proper classroom icon doesn't exist in the app today, so the emblem stands in. **Needs Josh.**
2. **Class code in the pack header?** My recommendation: **keep it out of the child's view.** It is a redemption credential for grown-ups, a code on a kid screen invites copying and sharing, and it is not needed after redemption. It stays on the grown-up side behind the gate. **Needs Josh.**
3. **Emblem in a circle vs a mascot-style illustration.** For the pitch the emblem is right: it makes the school recognisable, and the app's logo-style assets already show up in circles. For a build I'd let the class pack use the app's own mascot style, for example the class's #1 animal as the pack mascot, with the emblem as a small corner mark. **Needs Josh.**

## Flags to carry forward

- **Names:** the real capture's greeting contained a profile name, which I repainted out. The **Riverbend video that is already on the partners page** also shows "Hey Zuzu, still exploring!" in its first seconds (the profile name on my test simulator). That name isn't student data, but if it is a real child's name you may want to swap it. Say the word and I'll remake that video.
- **Animal page tint:** the real Golden Retriever page is tinted with Happy Hounds' peach palette. A class pack would use the class palette (green). Not recoloured.
- **Cue logic:** Golden Retriever also lives in the free Happy Hounds pack. Whether the cue shows depends on the entry path (opened from Room 4's pack). That behaviour isn't designed; the cue's placement (hero-card corner here) is a proposal.
- **Redemption:** I believe the app already has an offer-code redemption sheet (PR #630) and that class codes could ride on it, but I have **not verified** that a custom class pack is possible with it. Needs scoping.
- **Content model:** how a class's top 18 are entered, validated and published, and who hosts the pack, is unscoped.
