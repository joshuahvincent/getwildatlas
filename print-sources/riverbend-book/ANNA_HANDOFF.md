# Handoff prompt for Anna (app-side Design Lead)

Copy everything below the line into Anna's session.

---

Anna, I need you to draw three high-fidelity app screens for a partner pitch. They show a **venue ("Run tier") experience** inside Wild Atlas for a **fictional** aquarium, **Riverbend Aquarium**. They are marketing mockups of a feature that does not exist yet, so nothing here is a build request. Please work from your own system: load the `wild-atlas-design` skill, `docs/design/DESIGN_SYSTEM.md` and `DESIGN_PRINCIPLES.md`, and run your checklist before you show me anything.

## Why

The partner page at `wildatlasapp.com/partners` (draft PR joshuahvincent/getwildatlas#55) needs real-looking screens that show a zoo or aquarium inside the app: a "My Places" section on Home, and a venue pack page. Today those screens are stand-ins I produced by editing real screenshots with Gemini and by drawing HTML. They are good enough to review but not good enough to ship. You own how this should look.

## The three screens (iPhone, portrait, with status bar 9:41)

1. **Home, scrolled to My Places.** Order on Home, top to bottom: hero (mascot, rails, "Wild Atlas", greeting), **My Packs** (the user's owned packs), a dashed divider, **My Places** (zoos and aquariums the child has visited), a second dashed divider, then **Explore More Animal Worlds** (today's shop tiles, locked, plus the single peachPop "Unlock more worlds" CTA). The screenshot should be scrolled so My Places and the **Riverbend Aquarium** tile sit in the middle of the screen: lower row of pack tiles above, Explore More Animal Worlds starting below.
   - My Places tile for Riverbend: venue emblem as the art, title "Riverbend Aquarium", caption "Meet the animals you saw today", pills "Visited today" and "9 animals", a NEW! capsule (GameDenCardBadge look).
   - A dashed "Add a place" tile under it ("Ask a grown-up to help"): adding a place means a link-out, so it sits behind the parental gate (AR-1).
2. **Riverbend pack page, top.** Back button, title, venue header card (emblem where the mascot would be, title, "The animals you met today, and a few more to discover at home.", pills "27 animals" and "9 exhibits"), **Meet the Animals** as a 3x3 AnimalTile grid, and **three page buttons (1, 2, 3)** because the pack has 27 animals (like Dino Roars, which has 1, 2). Page 1 shows: Octopus, Sea Otter, Jellyfish, Sea Lion, Starfish, Sloth, Poison Dart Frog, Axolotl, Green Anaconda. Use the app's real animal art for the tiles.
3. **Riverbend pack page, lower.** Paw-print progress card, then **About Riverbend** (four kid-editorial fact tiles, big number plus short label: "27 kinds of animals live here", "9 exhibits to explore", "1 giant ocean tank", "365 days a year, open every day"), then **Top Exhibits** (a horizontal row of exhibit cards, each with art, a name, one line, and a "Find it on the map" pill): Otter & Sea Lion Bay, Jellyfish Hall, Rainforest Gallery, Touch Pool, Ocean Tunnel. Finish with a **For grown-ups** utility card (hours, address, tickets; opens after a parental gate; utilityTeal on the F11 wash, no mascot there per TC-4b).

Facts and exhibit text are **sample content for a fictional venue**; strings would go through the i18n skill in any real build. Exhibit structure is modelled on how a real aquarium presents itself (sea lions, jellyfish, rainforest, frogs, touch pool), but all names are fictional.

## Hard constraints

- Every animal shown must exist in Wild Atlas **and** be confirmed at Vancouver Aquarium (checked on vanaqua.org): octopus, jellyfish (moon jelly), sea otter, sea lion (Steller), starfish (sea star), sloth, poison dart frog (golden poison frog), axolotl, green anaconda. **No dolphins, whales, belugas or sharks** (Vancouver ended its cetacean program; aquariums don't keep great whites).
- Do not use any real venue's name, logo, brand colors or map in the screens. Riverbend is fictional (emblem and wordmark below).
- Use the app's palette, Fredoka and Nunito only, 2pt warmBark kid outlines, radius clusters, timid shadows. peachPop only on the one primary action. Contrast on any new text/fill pair computed, not eyeballed. Don't extend known deviation F1.
- Compliance: link-outs and adult info behind the parental gate (AR-1); no third-party SDKs or data (AR-2); commerce addressed to parents (AR-3).
- Kid-first: a 3-year-old should be able to find "my places" and the aquarium tile without reading (TC-1, TC-7).

## Open design questions for you (flag, don't decide)

- Is "My Places" the right label (vs "My Visits")?
- Should the venue pack page show a small map preview card above Top Exhibits?
- Does the "Add a place" tile belong on Home at all, or only on the grown-up side?
- Is a venue emblem in a circle the right art for the tile, or should the venue get a mascot-style illustration?

## What to deliver

- Three final PNGs at iPhone 16 Pro size (1206x2622), screen only, no device frame: `run-home-places.png`, `run-pack-top.png`, `run-pack-lower.png`.
- Real app rendering preferred (SwiftUI preview or simulator with a throwaway debug view, never merged), otherwise drawn to the same standard. Say which.
- A short design note with the checklist results (rule IDs / file:line), anything you deviated on, and your answers to the open questions.
- Put the PNGs where I can reach them (any folder, tell me the path) and I will wire them into the partner page: the hero phone, the "Your zoo, inside the app" section, and the one-pager. Nothing is merged or published until I approve.

## Reference material (all on this machine)

Website repo worktree: `/Users/joshuahv/Documents/Codex Projects/getwildatlas-wt-partners/`

- **My design review (HTML, scrollable, the content spec):** https://claude.ai/artifact/9i3Yw92QcjDiZZLXXr563S ; source and images in `print-sources/riverbend-book/design-review/` (`index.html`, `render-home-full.png`, `render-pack-full.png`).
- **Layout crops** I cut from that design for each screen: `print-sources/riverbend-book/refs/layout-home-places.png`, `layout-pack-top.png`, `layout-pack-lower.png`.
- **Real app screenshots for style:** `assets/press/ss-home.jpg`, `assets/press/ss-dino-pack.jpg` (marketing frames) and the cropped screens `refs/home-ref.png`, `refs/pack-ref.png`.
- **Rough Gemini concepts (not final, for direction only):** `print-sources/riverbend-book/screens/final-*.jpg` and `run-*.jpg`. Treat any text in them as unreliable.
- **Riverbend emblem and logo (fictional):** `print-sources/riverbend-book/riverbend-emblem.svg|png`, `riverbend-logo.svg|png`.
- **Imaginary aquarium photos** (Gemini): `print-sources/riverbend-book/aquarium/*.jpg` (entrance, tunnel, jellies, touchpool), usable on exhibit cards.
- **Where the screens will be used:** hero image `assets/partners/hero-riverbend.jpg` (a phone with the Home screen in front of the aquarium), and the Run section of `partners.html`.
- **Example book the screens sit beside:** `assets/downloads/riverbend-coloring-activity-book.pdf`.
