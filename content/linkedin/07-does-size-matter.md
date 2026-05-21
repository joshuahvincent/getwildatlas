---
title: "Does Size Really Matter? How I Cut Wild Atlas from 2GB to 382MB"
series: "Building Wild Atlas"
piece: 7
target_date: TBD — publish after piece #3, July 7 or later. HN cross-post candidate.
status: draft
audience: Engineers, technical founders
length_target: ~1800 words
note: This piece floats in the cadence. Publish after #3 has landed; ideal for a Thursday/Friday to catch HN weekend traffic.
---

# Does Size Really Matter? How I Cut Wild Atlas from 2GB to 382MB

Nobody told me my app was 2 gigabytes.

That's the thing that gets me about it. I had been building for weeks. I had run builds, distributed TestFlight builds, watched the app run on a device. Nobody — not the build system, not the agents, not the tooling I was using — had surfaced a number and said: this is too large to ship.

I had to find out myself.

---

## How I found out

It was April 25th, 2026. I opened Issue #50: *"Implement WildAtlas Phase 1/2 app-size reduction plan."*

I don't remember the exact moment I looked at the `.ipa` size. But I remember the number. Somewhere north of 2 gigabytes for an app I was planning to put on the App Store. Apple's limit for over-the-air downloads — the size above which users have to be on Wi-Fi — is lower than that. The practical limit for a kids app, where a parent's first reaction to "you need to connect to Wi-Fi to download this" is to pick a different app, is lower still.

The problem, when I went looking for it, was obvious: I had been adding image assets throughout the build without any discipline around size, resolution, or compression. Icons that could have been 64KB were 4MB. Images that only ever appeared at thumbnail scale were stored at full resolution. A build that had grown organically over seven weeks of feature work had accumulated asset bloat that no one had asked anyone to clean up.

Which is exactly the point. I hadn't asked the agents to optimise for app size. So they hadn't.

---

## What was causing it

Three categories, in rough order of contribution:

**Icons and UI images sized for print, not screen.** When an agent generates an icon and I don't specify a size constraint, it tends to produce something large. "Large" in this context means full-resolution, uncompressed, or both. I had dozens of icon assets in this state.

**Animal photos stored at full camera resolution.** The app displays animal photos in a scrollable gallery. The display size is a fraction of a phone screen. The files were sized for a billboard.

**Unused resources left in the bundle.** Assets from features that were redesigned or reverted — but not cleaned up — still shipping in the binary. The agents add things. They don't always remove what they replaced.

The first pass — Phase 1 — focused on the most egregious cases: icon dimension caps, JPEG recompression at q95, resolution limits for gallery images. Three days, one engineer (me), and a focused agent thread.

Result: **653MB → 382MB. A 41% reduction in a single pass.**

I'll note that the 2GB figure represents what I measured before the early reduction passes — the project history includes earlier cuts that brought it to 653MB before issue #50 formalised the effort. The 2GB was real. The 382MB is where it landed.

---

## The audio architecture decision underneath all of this

There's a second size story that lives under the first one, and it's more interesting architecturally.

Wild Atlas ships with audio for every animal across five locales — narration, sound effects, fun facts, everything spoken. If you tried to bundle all of that in the app binary, the size problem would be unsolvable. You'd be shipping hundreds of megabytes of audio per locale, times five locales, for a binary that would break every App Store constraint and take twenty minutes to download.

The answer was a hosted audio model: audio files live on a CDN, downloaded to the device when a pack is first accessed, cached locally after that. The app binary ships with a manifest and a download layer. The audio itself arrives on demand.

This architecture has a consequence I didn't fully think through until it almost bit me.

If you serve audio from a URL and you update that audio, what happens to users who already downloaded the old version? If you overwrite the file at the same URL — if `packs/cool_cats/audio-en.archive` gets replaced with a new version at the same path — existing users' cached files are now stale, but their client thinks they have the current version. Their content breaks silently.

I realised this on a Saturday night, May 16th, four days before App Store submission, at 11:17 p.m.

The fix was switching to content-versioned archive URLs: every audio archive gets a version suffix derived from its content — `packs/cool_cats/audio-en.v74.archive`. Old URLs stay frozen forever. New content gets a new URL. Existing users' cached files are never invalidated by a content update.

Issue #276 opened at 11:17 p.m. on a Saturday. The fix was merged by Sunday afternoon — under 20 hours, including a full architectural cutover.

I called that issue the Saturday night time bomb, because that's what it was. A design choice I'd been carrying for months that would have caused silent content breaks for existing users on every post-launch content update. I saw it four days before submission and couldn't not fix it.

---

## The bundled vs. hosted split

One category of audio doesn't follow the hosted model: the Mythical Menagerie.

The MM is a hidden pack, accessible through an easter egg. The unlock moment — finding the pack, revealing the creatures — needs to be instant. A user completing the Stargazer Quest and triggering the MM reveal can't wait for a download. The payoff has to be immediate.

So MM audio is bundled in the binary, not hosted. It's the only pack that ships this way. The tradeoff is intentional: instant unlock is worth the extra size, because the MM unlock moment is the thing you're building toward.

Everything else is hosted. The authoritative list of bundled packs lives in the code, not in an assumption — check `BUNDLED_PACKS` in the bundle assembly script rather than inferring from the CDN.

---

## What the exercise revealed about agents and optimisation

Here's the lesson I keep coming back to.

I asked the agents to build features. I didn't ask them to minimise the binary size. So the binary grew, unmonitored, until it was 2 gigabytes.

This is not a critique of the agents. They built what I asked for. What I failed to do was define the constraints I was optimising within — including constraints I assumed were obvious. App size is not self-evidently important to an agent generating image assets. It becomes important the moment you specify it.

The same pattern showed up in the audio architecture: agents produced four separate audio engines because I asked for audio features, not for a centralised audio architecture. The pattern showed up in security: agents included credentials in tracked files because I hadn't made secrets hygiene the explicit non-negotiable rule from the start.

In every case: the agent optimised for the task as specified. The broader constraint — binary size, architectural coherence, secrets management — was invisible because nobody stated it.

This is the thing the hype gets wrong. "AI agents will build your app" is technically true in a narrow sense. What it misses: you are still responsible for defining the full problem, including the parts you haven't thought to articulate yet. The agent solves what you give it. Everything else is yours to catch.

The discipline, which I'm still developing, is thinking through what constraints matter before I hand a task to an agent rather than after I discover the problem. A checklist at the start of any significant new workstream: what are we optimising for, and what are we not allowed to sacrifice? Binary size. Security hygiene. Architectural coherence. Ask the questions before the code ships.

---

## Where 382MB sits now

The app currently ships at 382MB. That's a reasonable size for a content-rich children's app with 200-plus animals, audio narration, mini-games, and five locales.

There are further reductions available — audio compression for non-English locales, additional image passes, lazy-loading of assets not accessed during typical sessions. Some of those shipped. Some are deferred to post-launch. The Phase 1 pass got the most accessible gains quickly; the deeper cuts require more architectural work.

The broader point: app size is not a one-time problem. It compounds. Every new pack, every new audio batch, every new UI asset adds to the binary unless there's a counter-force. I now have an asset hygiene process — size caps, compression requirements, a regular audit pass — because I learned the hard way that content accumulates faster than you notice.

---

## Three things I'd tell a solo builder

**State your constraints before you build, not after.** Binary size, security requirements, architectural boundaries. The agent optimises for what you tell it to optimise for. If you don't say "keep the binary under X MB," it won't.

**Instrument before you need the data.** I didn't have a live view of my binary size until I looked for it. Having a number in front of you early — even a rough one — changes what you pay attention to. The same principle applies to download times, crash rates, user flow drop-off. Data you don't collect is a problem you won't see coming.

**When you find the time bomb, fix it, even if it's Saturday night.** The content-versioned URL architecture was urgent because launching with the old model would have created silent data-loss for every user affected by a post-launch content update. The timing was bad. The fix was non-negotiable. There's no good time to fix a Saturday night time bomb. You just fix it.

---

*Wild Atlas launched May 26, 2026. It's a narrated animal encyclopedia for kids aged 3 to 9. Twelve packs, five languages, works offline. No ads, no subscription traps.*

*This piece is part of the Building Wild Atlas series. If you found it on Hacker News, the other pieces are at wildatlasapp.com.*
