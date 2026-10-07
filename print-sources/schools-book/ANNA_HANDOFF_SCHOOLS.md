# Handoff prompt for Anna (app-side Design Lead): school concept screens + walkthrough video

Copy everything below the line into Anna's session.

---

Anna, same drill as the Riverbend Aquarium screens, now for **schools**. I need three high-fidelity concept screens plus a short walkthrough video showing a **class pack** inside Wild Atlas for a **fictional** school, **Pebble Brook Elementary** (Room 4, Pre-K to Grade 1). These are marketing mockups of a feature that does not exist yet, so nothing here is a build request. Work from your own system: load the `wild-atlas-design` skill, `docs/design/DESIGN_SYSTEM.md` and `DESIGN_PRINCIPLES.md`, and run your checklist before showing me anything.

## Why
The schools page (`wildatlasapp.com/schools`, getwildatlas PR #58) mirrors the zoo/aquarium/museum partner page. Its "Run" section ("Your class pack, inside the app") currently shows real app screens from other packs as stand-ins. It should show the real idea: a pack of the **18 animals one class picked**, free for the class and families, where kids play with the animals they chose and learn about them. Same treatment as `run-home-phone.png`, `run-pack-phone.png`, `run-pack2-phone.png` and the Riverbend walkthrough video.

## The concept
A class votes (picture booklet, tick the favorites). The teacher tallies. The top 18 animals become a custom Wild Atlas pack for the class, redeemed by families with a class code (`PEBBLEBROOK`). It sits on the child's Home screen like a "My Places" tile, but for a class.

## Screens (iPhone portrait, 9:41, 1206x2622, screen only)
1. `school-home.png` Home, scrolled so the class tile sits mid-screen. Show the tile for **Room 4 at Pebble Brook** (school emblem as the art: `print-sources/schools-book/school-emblem*.png`), caption like "The 18 animals our class picked", pills "18 animals" and a NEW! capsule. Decide the section label (e.g. "My Class" vs "My Places") and flag it.
2. `school-pack-top.png` The class pack page, top: back button, title, header card (emblem, "Room 4's Pack", one kid-friendly line), **Meet the Animals** 3x3 grid with page buttons 1 and 2 (18 animals = 2 pages of 9). Use the real app animal art. The 18 are in `print-sources/schools-book/build_vote_booklet.py` as `EXAMPLE_WINNERS`; page 1 can be the first nine.
3. `school-animal.png` One animal page from that pack (use the lion or the golden retriever) with a small "From Room 4's pack" cue, so it is clear the class chose it.

Video: ~20-25 seconds in the style of `riverbend-flow.mp4`: Home scrolls to the class tile, the pack opens, an animal page follows. Say which parts are real app footage and which are drawn.

## Hard constraints
- Fictional school only: do not use any real school's name, logo or colors. Emblem and wordmark are in `print-sources/schools-book/school-logo.png|svg`.
- **No student names, photos or any child data anywhere** (we do not take student data). No teacher names either.
- Every animal must exist in Wild Atlas (all 18 in `EXAMPLE_WINNERS` do).
- App palette, Fredoka and Nunito only, 2pt warmBark kid outlines, peachPop only on the one primary action, computed (not eyeballed) contrast. Don't extend known deviation F1.
- Compliance: link-outs and grown-up info behind the parental gate (AR-1); no third-party SDKs or data (AR-2); commerce addressed to parents (AR-3); kid-first and readable without reading (TC-1, TC-7).

## Open questions (flag, don't decide)
- Label for the class section on Home.
- Should the pack header show the class code, or keep it out of the child's view?
- Emblem in a circle vs a mascot-style illustration for the class tile.

## Deliver
Three PNGs plus the MP4 and a poster frame, a short design note with checklist results and your answers above, and say whether the screens are real app rendering or drawn. Put them somewhere I can reach and tell me the path; I'll wire them into the schools page. Nothing is merged or published until I approve.

## Reference
Worktree: `/Users/joshuahv/Documents/Codex Projects/getwildatlas-wt-partners/`. Riverbend examples to match: `assets/partners/run-home-phone.png`, `run-pack-phone.png`, `run-pack2-phone.png`, `riverbend-flow.mp4`, and your handoff `print-sources/riverbend-book/ANNA_HANDOFF.md`. School assets: `print-sources/schools-book/` (logo, emblem, `school-photos/`), the example activity book `assets/downloads/pebble-brook-class-activity-book.pdf`, the vote booklet `assets/downloads/pick-our-animals-vote-booklet.pdf`.
