---
layout: layouts/post.njk
title: "New in Wild Atlas: Kid Insights and the Animal Finder"
date: 2026-12-01
author: Wild Atlas
excerpt: "See which animals your kids are spending time with in the app, get conversation starters to use with them, and find places near you to see those animals in real life."
permalink: /blog/kid-insights/
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
  .screen-row img { width: 100%; height: auto; display: block; margin: 0; }
</style>

You can see which animals your kids are spending time with in the app, get conversation starters to use with them (parents want real conversations, and this is a way in), and find places near you where you can see those animals in real life. It's called Kid insights, in the grown-ups area (the burger menu on Home), arriving in the next update.

<!-- VERSION: TBD -->

<!-- PENDING-BUILD NOTE: the opening, excerpt and TL;DR mention conversation starters; trim that mention if the starters section is cut. -->

## Kid insights: what it shows

Pick a child, from up to four, then Last 7 days or All time. Say it's Mia's, over one month: total time with animals, how many animals, how many visits, and a Top animals list with time and visits for each one.

<!-- SCREEN SLOTS: placeholders for captures from the final signed-off build (sample data). Replace each .screen-slot div with an <img>. -->
<div class="screen-row">
  <figure><div class="screen-slot">SCREEN TO COME<br>Mia, one month. Kid insights home, All time, Top animals.</div><figcaption>Kid insights, All time (sample data)</figcaption></figure>
  <figure><div class="screen-slot">SCREEN TO COME<br>The in-Kid-insights animal page.</div><figcaption>An animal opened from Top animals</figcaption></figure>
</div>

<!-- FILL FROM THE FINAL CAPTURE: Mia's All time total, number of animals, visits, and her top animal with its time and visits. The copywriter's first draft invented numbers here; none are verified. --> Tap an animal in the list and it opens inside Kid insights, so the two of you can look again; that tap adds no new visit or time. A visit only counts after a page's open and in use for at least three seconds.

Once a week, without you having to remember to look, a quiet reminder tells you which animals each of your kids has been into, and opens straight to that child's top animal in Kid insights. It's off until you turn it on, made on your phone, and you pick the day and time.

<!-- PENDING-BUILD: starters + Words to learn; delete this section if the build slips -->
## Conversation Starters

Parents want to have real conversations with their kids about what they're into, and it's hard to start one from nothing. On animal pages, this gives you a way in. The in-app label is "Things to talk about," and it pairs a question to ask out loud with a Did you know line and three quick facts about that animal, all built from facts already on the page. Right next to it, Words to learn shows four word chips from that animal; tap one and it shows you what it means.

<!-- SCREEN SLOTS: placeholders for captures from the final signed-off build (sample data). Replace each .screen-slot div with an <img>. -->
<div class="screen-row">
  <figure><div class="screen-slot">SCREEN TO COME<br>An animal page with the Things to talk about card open.</div><figcaption>Things to talk about</figcaption></figure>
  <figure><div class="screen-slot">SCREEN TO COME<br>An animal page, Words to learn with a word open.</div><figcaption>Words to learn</figcaption></figure>
</div>

It works in the car, at dinner, or at bedtime: ask the question on the card, then let your child tell you the rest.
<!-- /PENDING-BUILD -->

## Find a Place to See the Animal IRL

You can find where to see the animals your kids are into, near you, in real life. There are two ways in: the Animal Finder, in the grown-ups area, where you can search for an animal or a place, or tap one of "Animals your kids love"; or "Where to see this animal" on an animal page. Either way, Wild Atlas shows nearby zoos, aquariums, and other places, each behind a parent check to open in Maps, share, or visit the website. If none nearby has that exact animal, it shows places with a close relative. Check the website before you go to make sure the animal's there.

<!-- Josh's iPad captures, 2026-11-05 (new build). -->
<div class="screen-row screen-row-pad">
  <figure><img src="/assets/blog/kid-insights/animal-finder-ipad.png" alt="The Animal Finder screen on an iPad: a saved city, a search box for an animal or place, and a row of animals under the heading Animals your kids love." width="858" height="1112" loading="lazy"><figcaption>Animal Finder</figcaption></figure>
  <figure><img src="/assets/blog/kid-insights/find-a-place-ipad.png" alt="The Find a place screen for the African Elephant near Seattle: a note to check the website before you go, distance filters, the closest zoo, and a zoo with a close relative." width="854" height="1110" loading="lazy"><figcaption>Find a place, for one animal</figcaption></figure>
</div>

What you type goes to Apple, not Wild Atlas, to turn it into a place; what's kept is a city-level place name and a point rounded to about a kilometer, on your phone, removable anytime. It also fetches a small public file for the animal from wildatlasapp.com, which is why it needs a connection; the rest of Wild Atlas doesn't. The same finder lives on the website too, at [wildatlasapp.com/finder](https://wildatlasapp.com/finder/).

## What stays on your phone, and what doesn't

- Your child's play history stays on this device unless you share it, and you can clear it anytime.
- The weekly reminder is made on your phone; nothing about your explorers is sent to set it up. It shows your kids' names and top animals unless you switch that off, and anyone who can see your lock screen can read it.
- Find a place sends what you type to Apple, not to Wild Atlas, and fetches a small public file for the animal from wildatlasapp.com, which is why it needs a connection.

No ads, no accounts, in Kid insights or anywhere else in Wild Atlas.

## Where to find it

Kid insights lands in the grown-ups area in the next update.

*Raise explorers, not scrollers.*
