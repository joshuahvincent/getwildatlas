---
layout: layouts/post.njk
title: "New in Wild Atlas: Kid Insights and the Animal Finder"
date: 2026-12-01
author: Wild Atlas
excerpt: "Parents want real conversations with their kids, and Kid insights gives you a way in: see which animals they love, get conversation starters, and find places to see them in real life."
permalink: /blog/kid-insights/
coverImage: /assets/blog/kid-insights-cover.jpg
thumbImage: /assets/blog/thumbs/kid-insights.jpg
status: draft
tags: [product, update]
---

<!-- VERSION: TBD. The post says "the next update" everywhere; fill in the version Roger ships. Needs the final-build screenshots, the sample numbers, and the starters build check (see PENDING-BUILD) before it can leave draft. -->

<style>
  .tldr {
    background: rgba(194, 90, 44, 0.07);
    border-left: 3px solid var(--accent);
    border-radius: 0 8px 8px 0;
    padding: 1rem 1.25rem;
    margin: 1.5rem 0 2rem;
  }
  .tldr-label {
    font-family: "Fredoka", system-ui, sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 0.3rem;
  }
  .tldr p { margin: 0; font-size: 0.95rem; }
  .page-shot img {
    width: 60%;
    min-width: 280px;
    display: block;
    margin: 0 auto;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
  }
  .page-shot figcaption {
    text-align: center;
    font-size: 0.85rem;
    color: var(--muted);
    font-style: italic;
    margin-top: 0.5rem;
  }
  .screen-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin: 1.75rem 0; }
  .screen-row figure { margin: 0; flex: 0 1 230px; }
  .screen-slot {
    aspect-ratio: 9 / 19.5;
    border: 2px dashed rgba(194, 90, 44, 0.55);
    border-radius: 28px;
    background: repeating-linear-gradient(135deg, rgba(194, 90, 44, 0.05) 0 12px, rgba(194, 90, 44, 0.10) 12px 24px);
    display: flex; align-items: center; justify-content: center; text-align: center;
    padding: 1rem; font-size: 0.85rem; color: var(--muted);
  }
  .screen-row figcaption { text-align: center; font-size: 0.85rem; color: var(--muted); font-style: italic; margin-top: 0.5rem; }
  .screen-row-pad figure { flex: 0 1 320px; }
  .screen-row-wide figure { flex: 0 1 460px; }
  .screen-row-menu-kid { align-items: flex-start; flex-wrap: nowrap; gap: 0.75rem; }
  .screen-row-menu-kid figure:first-child { flex: 0 0 26%; }
  .screen-row-menu-kid figure:last-child { flex: 1 1 0; min-width: 0; }
  .screen-row-menu-kid figcaption { font-size: 0.75rem; }
  .screen-row-crop { align-items: flex-start; }
  .screen-row-crop figure { flex: 0 1 280px; }
  .screen-row-crop img { border-radius: 16px; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.14); }
  .screen-row img { width: 100%; height: auto; display: block; margin: 0; }
</style>

A lot of you asked how to explore Wild Atlas with your kid, and turn app time into conversation. In the next update, Kid insights and the Animal Finder, in the grown-ups area (the burger menu on Home), show which animals your kids spend time with, give conversation starters, and find places nearby in real life. This release is for you.

## Wild Atlas 2.1 Walkthrough

<video controls playsinline preload="metadata" poster="/assets/blog/kid-insights-new-features-poster.jpg" aria-label="Walkthrough video of Kid insights and the Animal Finder, with narration" style="width:100%;max-width:420px;height:auto;aspect-ratio:9/16;display:block;margin:0 auto;border-radius:12px;background:#fff8ec"><source src="/assets/blog/kid-insights-new-features.mp4" type="video/mp4">Your browser does not support the video tag. <a href="/assets/blog/kid-insights-new-features.mp4">Download the walkthrough video (MP4)</a>.</video>

<!-- VERSION: TBD -->

<!-- PENDING-BUILD NOTE: the opening, excerpt and TL;DR mention conversation starters; trim that mention if the starters section is cut. -->

## Kid insights: what it shows

Pick a child, from up to four, then Last 7 days or All time, and you'll see total time with animals, how many animals and visits, and a Top animals list. In the screen below, Sam's week: 29 minutes across 7 animals, with the Panda on top.

<!-- Josh's iPad capture, 2026-11-05 (new build, sample child Sam). -->
<!-- Josh's iPad capture, 2026-11-05. BEFORE PUBLISH: this capture shows the Debug row at the bottom of the menu (debug build only). Replace with a capture that hides it, or retouch with Josh's OK. -->
<div class="screen-row screen-row-wide screen-row-menu-kid">
  <figure><img src="/assets/blog/kid-insights/grown-ups-menu-ipad.webp" alt="The Wild Atlas Home screen on an iPad with the menu open, listing Settings, Kid insights, Animal Finder, Shop and About." width="862" height="1120" loading="lazy"><figcaption>The grown-ups menu on Home</figcaption></figure>
  <figure><img src="/assets/blog/kid-insights/kid-insights-ipad.webp" alt="Kid insights on an iPad. On the left, a child's last 7 days: 29 minutes across 7 animals, with a Top animals list led by the Panda. On the right, the Giraffe opened, with Things to talk about: a question to ask and a Did you know fact." width="866" height="1130" loading="lazy"><figcaption>Kid insights, with an animal opened beside the list</figcaption></figure>
</div>

Tap an animal in the list, and you get things to talk about for it, right there.

You can set up a reminder once a week that will tell you which animals your kids have been into. You pick the day and time.

<!-- PENDING-BUILD: starters + Words to learn; delete this section if the build slips -->
## Conversation Starters

In Kid insights, tap an animal your kids spent time with, and you'll have something to talk about. The in-app label is "Things to talk about," and it pairs a question to ask out loud with a Did you know line and three quick facts about that animal. Right next to it, Fun Words to Learn shows four word chips from that animal; tap one and it shows you what it means.

<!-- Josh's captures, 2026-11-06 (new build, Dolphin). -->
<div class="screen-row screen-row-crop">
  <figure><img src="/assets/blog/kid-insights/things-to-talk-about.png" alt="Things to talk about for the Dolphin: an Ask card with a question about the sound the animal makes and its answer shown, and a Did you know card." width="354" height="526" loading="lazy"><figcaption>Things to talk about</figcaption></figure>
  <figure><img src="/assets/blog/kid-insights/fun-words-to-learn.png" alt="Fun Words to Learn for the Dolphin: the words Pod, Blowhole, Echolocation and Flipper, with Echolocation opened to show what it means and an example sentence." width="348" height="328" loading="lazy"><figcaption>Fun Words to Learn</figcaption></figure>
</div>

It works in the car, at dinner, or at bedtime: ask the question on the card, then let your child tell you the rest.
<!-- /PENDING-BUILD -->

## Find a Place to See the Animal IRL

There are two ways in: the Animal Finder, in the grown-ups area, where you can search for an animal or a place, or tap one of "Animals your kids love"; or "Where to see this animal" when you open an animal in Kid insights. Either way, Wild Atlas shows nearby zoos, aquariums, and other places, each behind a parent check to open in Maps, share, or visit the website. If none nearby has that exact animal, it shows places with a close relative. Check the website before you go to make sure the animal's there.

<!-- Josh's iPad captures, 2026-11-05 (new build). -->
<div class="screen-row screen-row-pad">
  <figure><img src="/assets/blog/kid-insights/animal-finder-ipad.png" alt="The Animal Finder screen on an iPad: a saved city, a search box for an animal or place, and a row of animals under the heading Animals your kids love." width="858" height="1112" loading="lazy"><figcaption>Animal Finder</figcaption></figure>
  <figure><img src="/assets/blog/kid-insights/find-a-place-ipad.png" alt="The Find a place screen for the African Elephant near Seattle: a note to check the website before you go, distance filters, the closest zoo, and a zoo with a close relative." width="854" height="1110" loading="lazy"><figcaption>Find a place, for one animal</figcaption></figure>
</div>

## What stays on your phone, and what doesn't

- Your child's play history stays on this device unless you share it, and you can clear it anytime.
- The weekly reminder is made on your phone; nothing about your explorers is sent to set it up. It shows your kids' names and top animals unless you switch that off, and anyone who can see your lock screen can read it.
- Find a place sends what you type to Apple, not to Wild Atlas, and fetches a small public file for the animal from wildatlasapp.com, which is why it needs a connection.

No ads, no accounts, in Kid insights or anywhere else in Wild Atlas.

## Where to find it

Kid insights lands in the grown-ups area in the next update.

*Raise explorers, not scrollers.*
