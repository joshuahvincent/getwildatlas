# Handoff: Pebble Brook concept screens and video for /schools

Copy everything below the line into the www dev's (Wes's) session.

---

Wes, I need you to swap the stand-in app screens in the Run section of `/schools` for Anna's concept screens, and add her walkthrough video. Worktree `getwildatlas-wt-partners`, branch `preview/schools-page`, draft PR joshuahvincent/getwildatlas#58. Nothing is merged or published until Josh approves. Anna (design) made these files; do not re-edit them.

## What these are

Concept screens for the fictional **Pebble Brook Elementary** showing a **school-wide pack**: the school (with its kids) picks 18 animals once, and every class, now and in future years, uses the same pack. It appears on the child's Home screen under **My Places**, next to zoos and aquariums.

They are part real and part drawn, so they are **concept** art, not shipped features:
- Real app capture: the top of Home, and the Golden Retriever page (in both the still and the video).
- Drawn to the app's design specs: the My Places section on Home and the pack page.
- The Home greeting has the test profile's name repainted out. No student names, teacher names, photos or child data appear anywhere.

## Files

All in `print-sources/schools-book/screens-anna/` (the 1206x2622 PNGs are screen only, no device frame):
- `school-home.png`: Home scrolled to My Places, showing the Riverbend Aquarium card and the Pebble Brook's Pack card.
- `school-pack-top.png`: the pack page, 9 of the 18 animals, page buttons 1 and 2.
- `school-animal.png`: the Golden Retriever page with a "From Pebble Brook's pack" cue.
- `school-flow.mp4`: 22.7 s, 604x1312, about 1.2 MB, no audio, `faststart`. The full-size master is `source/school-flow-master-1206x2622.mp4`; do not use it on the site.
- `school-flow-poster.jpg`: poster frame (the My Places screen), 604x1312.
- `DESIGN_NOTE.md`: Anna's checklist results and open questions.

The three PNGs, the MP4 and the poster currently sit in `print-sources/` only. Copy what the page uses into `assets/partners/` (that is where `schools-app-pack.png` and the other page assets live), and frame the stills the same way the existing `schools-app-*.png` and the partners page's `run-*-phone.png` stills are framed.

## What to do

1. In the `#run` section ("Your school pack, inside the app"), replace the three stand-ins (`schools-app-pack.png`, `schools-app-animal.png`, `schools-app-quiz.png`) with the three new stills: Home My Places, pack page, animal page. Keep the 676x1286 phone-frame ratio.
2. Add the video to that section (for example as a lead item, or as a fourth item beside the stills): `<video autoplay muted loop playsinline preload="metadata" poster="/assets/partners/school-flow-poster.jpg" width="604" height="1312">` with the MP4 as `<source type="video/mp4">`. There is no audio. Add a visible pause control, or respect `prefers-reduced-motion` by not autoplaying and showing the poster with a play button. Self-hosted only, no third-party player. The Riverbend video on `/partners` is the model, if it has landed.
3. Update the alt text and figcaptions to match the new screens (see "Copy" below).
4. Replace the note under the phones. It currently says "These are real Wild Atlas screens, from the Dino Roars pack and the orca page… School-specific screens are coming." That is no longer true. Use a "Concept screens" note like the one on `/partners`: Pebble Brook is a fictional school, and these show what we would build, not what ships today.
5. Check at 400 px wide for sideways scroll and page weight.

## Copy: needs review, not for you to author

Cole owns copy, so flag these lines rather than rewriting claims yourself:
- Suggested captions: "Your school's place on every child's Home screen", "Your 18 animals, together in one pack", "Each animal shows it came from your school's pack".
- Suggested note: "Concept screens. Pebble Brook Elementary is a fictional school. These show what we would build, not what ships today."
- The page's pack copy is already school-wide ("one pack for the whole school, every class can use it"). Anna's screens now match that. A few spots still read class-first and Cole should look at them: the "For the class pack" eyebrow near the end of the page, the "THE CLASS ACTIVITY BOOK" and "HOW THE CLASS PICKS" section markers (comments only, so low risk), and the mention of "one custom code per class or school" in the offer-code paragraph. Anna's recommendation is **one code per school**.

## Constraints and flags

- Branch and deploy flow per this repo's `DEPLOY.md`. Josh is the sole approver for anything public. Update the draft PR and stop; do not publish.
- The Home screen shows the fictional **Riverbend Aquarium** card next to the school card, to show that places include schools. **Josh must OK that before it goes on the schools page.** If he says no, ask Anna for a version without it; do not crop it yourself.
- The Riverbend video on `/partners` shows the test profile name "Zuzu" in its first seconds. That is a test profile, not a student, but it is awkward. Josh has not decided whether to remake it. Not part of this task.
- Do not name any real school. Pebble Brook and its emblem are fictional.
- No claims authored by you. Anything beyond what the page already says goes through Cole and the advisor gates.
- Open design questions for Josh are in `DESIGN_NOTE.md` (whether the code is ever shown to a child, and emblem vs mascot art for the tile). They don't block this work.
