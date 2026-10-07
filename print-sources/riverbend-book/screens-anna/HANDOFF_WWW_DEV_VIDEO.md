# Handoff: Riverbend flow video for the partners page

Copy everything below the line into the www dev's (Wes's) session.

---

Wes, I need you to add a short concept video to `wildatlasapp.com/partners` (draft PR joshuahvincent/getwildatlas#55, worktree `getwildatlas-wt-partners`, branch `preview/partners-page`). Nothing is merged or published until Josh approves. Anna (design) made the video; do not re-edit it.

## What the video is

A 24-second walkthrough of the venue ("Run tier") experience for the **fictional** Riverbend Aquarium, shown in the Wild Atlas app:
Home scrolls to the new "My Places" section, tap the Riverbend tile, scroll the venue pack page down and back up, tap Sea Otter, then the real Sea Otter animal page scrolls.

It is part real and part drawn. The Home top and the Sea Otter page are real app captures. The rest is drawn to the app's component specs. So it is a **concept** and must be labeled as one, matching the existing "Concept screens" note under the Run section.

## Files (already copied into the worktree, untracked)

- `assets/partners/riverbend-flow.mp4`: web version, H.264, 604x1312 (portrait phone ratio), 24.1 s, about 2 MB, no audio track, `faststart`.
- `assets/partners/riverbend-flow-poster.jpg`: first-frame poster, 604x1312, about 95 KB.
- Master (1206x2622, 7 MB) is not for the site: `print-sources/riverbend-book/screens-anna/riverbend-flow.mp4`.
- Updated still screens (round 2), if you want to refresh the three phone images in the Run section: `print-sources/riverbend-book/screens-anna/run-home-places.png`, `run-pack-top.png`, `run-pack-lower.png` (1206x2622, screen only, no device frame). The current page uses framed `run-home-phone.png`, `run-pack-phone.png`, `run-pack2-phone.png`; re-frame them the same way. The round 2 changes are: smaller "Add a place" tile, a place description above the stats, a "Learn more" button instead of the "For grown-ups" card, and photos on every exhibit card.

## What to do

1. Add the video to the `#run` section ("Your zoo, inside the app") of `partners.html`. Suggested placement: as a fourth item beside or below the three phones, or as the lead item with the stills below. Pick whichever fits the existing `.pp-phones` layout, and keep the phone-width ratio.
2. Markup: `<video autoplay muted loop playsinline preload="metadata" poster="assets/partners/riverbend-flow-poster.jpg" width="604" height="1312">` with the mp4 as `<source type="video/mp4">`. It has no audio, so there is no sound to control. Add a visible pause control, or make it respect `prefers-reduced-motion` by not autoplaying and showing the poster plus a play button.
3. Give it a short `aria-label` or visible figcaption: the whole flow is "Home to venue page to animal page". Alt text for the poster should describe the Home My Places screen.
4. Keep the existing "Concept screens" note and make sure it covers the video (Riverbend is fictional; this is what we would build, not what ships today).
5. The caption under the third still currently reads "Facts and top exhibits, with a grown-up gate". Round 2 replaced that card with a "Learn more" button behind the grown-up check, so adjust the caption and alt text. **Copy comes from Cole, not you.** Flag the lines that need review rather than rewriting claims yourself.
6. Check page weight and layout at 400 px wide. Precedent for video on the site: `assets/wild-atlas-trailer.mp4` with `assets/trailer-poster.jpg`.

## Constraints

- Branch and deploy flow per this repo's `DEPLOY.md`.
- Josh is the sole approver for anything public. Open or update the draft PR and stop; do not publish.
- Do not add third-party video hosts or players. Self-hosted file only (Cloudflare Pages).
- Do not name any real venue. Riverbend is fictional, and its emblem and wordmark are in `print-sources/riverbend-book/`.
- No marketing claims authored by you. Anything beyond the existing page copy goes to Cole and the advisor gates first.

## Known notes from Anna

- The Ocean Tunnel exhibit photo (`print-sources/riverbend-book/aquarium/tunnel.jpg`) was generated with sharks in it, which breaks the brief's no-sharks rule. It is not visible in the video or the stills (it sits off-screen in the horizontal exhibit row). Do not reuse that photo anywhere until it is regenerated.
- The three stills and the video were drawn at the iPhone 16 Pro size, 1206x2622. The web video is a downscale of the same frames.
- Anna's full design notes: `print-sources/riverbend-book/screens-anna/DESIGN_NOTE.md`.
