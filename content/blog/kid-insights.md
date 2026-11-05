---
layout: layouts/post.njk
title: "What Did You Two Discover Today?"
date: 2026-12-01
author: Wild Atlas
excerpt: "Kid insights gives you something real to talk about with your child: which animals they spent time with, so you're not starting from a guess."
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
</style>

You hand over the phone for ten minutes: in the back seat, in a waiting room, over breakfast while you get one more thing done. When you get it back, you ask the question every parent asks: "what did you look at?" <!-- VERSION: TBD --> Kid insights, coming to the Grown-ups Area in the next update, gives you something to look at together instead of a guess. Most days, without it, the honest answer is a shrug, or a name you half remember from a nature show.

<div class="tldr">
  <div class="tldr-label">TL;DR</div>
  <p>Kid insights is a new screen in the Grown-ups Area, opened from the menu on Home. Pick a child, then Last 7 days or All time, and see how long they spent with animals, how many animals, how many visits, and which animals took the most time. It works for up to four children. The history stays on your phone unless you choose to share it, and you can clear it anytime. A weekly reminder is optional and off by default.</p>
</div>

## What it shows: Mia, one month

Say your family has three explorers on the phone, and you tap into Mia's. Kid insights opens on her, showing Last 7 days by default. Switch to All time and a month of her play opens up at once: the total time she's spent with animals, how many different animals she's looked at, how many visits that adds up to, and a Top animals list underneath, each one with its own time and visit count.

<!-- IMAGE: Kid insights screen, Mia, All time view (sample data) -->

The screens in this post show sample data, not a real child's history. <!-- FILL FROM THE FINAL CAPTURE: Mia's All time total, number of animals, visits, and her top animal with its time and visits. The copywriter's first draft invented numbers here; none are verified. --> Tap an animal in her Top animals list and it opens its own page inside Kid insights, so the two of you can pull it back up and look at it again. That tap doesn't count as a new visit or add to her time; it's just the two of you looking back.

## How a visit gets counted

Kid insights only counts a visit once an animal's page has been open and actually in use for at least three seconds. A quick tap that bounces straight back out doesn't count, and time only adds up while that page is open and in use, not while she's somewhere else in the app. There's a "How this is counted" explainer inside the app itself, so you don't have to take our word for it secondhand.

<!-- PENDING-BUILD: starters + Words to learn; delete this section if the build slips -->
## Things to talk about, and words to learn

On animal pages, a block called Things to talk about pulls together a question to ask out loud, a Did you know line, and three quick facts, all built from the same facts already on that animal's page. Right below it, Words to learn shows four word chips from that animal; tap one and it tells you what the word means. Mythical and extinct animals get fewer cards, since there's less to draw from, but the idea is the same: something ready-made to read aloud, ask about, or just look at together, instead of starting from nothing.
<!-- /PENDING-BUILD -->

## Find a place

Animal pages already tell your child where an animal lives in the wild. The next update adds a way to find it closer to home. Open "Where to see this animal" on an animal page and it opens Find a place: save a city, postcode, or address once, and Wild Atlas lists zoos, aquariums, and other places with that animal, or a close relative, near it, each with a distance, "Accredited" noted where it applies, and buttons to open it in Maps, share it, or visit its website. All three sit behind a parent check. There's a plain notice, too: check the website before you go, since animals can move and places can close.

<!-- IMAGE: Find a place screen, sample saved location -->

Here's what actually happens with what you type: it goes to Apple, to turn an address into a place, not to Wild Atlas. What gets saved is a city-level label and a point rounded to about a kilometer, kept on your phone, and you can remove it anytime. To build the list of nearby places, the app also fetches a small public file for the animal you're looking at from wildatlasapp.com. That request carries no search text, no child, and no saved place, just a request for that one animal's file, so our host can see that a file for a given animal was asked for, along with an IP address, the way any website can see that much about any visit. Find a place needs a connection to work. The rest of Wild Atlas doesn't.

## The weekly reminder

If you'd like a nudge to check in, there's an optional weekly reminder, off until you turn it on. It's one reminder per phone, not per child, and you pick the day and time. It's set up entirely on your phone, with nothing about your explorers sent anywhere to make it happen. A "show names and animals" switch decides whether the reminder text names the child and their top animal, or stays generic, and it's worth knowing that anyone who can see your lock screen can read whatever it says, unless you've hidden notification previews. Tap the reminder and it opens Kid insights, straight to that child's top animal. If you turn notifications off for Wild Atlas in iPhone Settings, everything else in the app, including Kid insights itself, still works exactly the same.

## What stays on your phone, and what doesn't

A plain list, because this is the part worth being plain about:

- There is nothing to switch on: Wild Atlas keeps each child's play history on the phone automatically as they explore, and you can clear it anytime.
- The play history shown in Kid insights stays on your phone unless you choose to share it. In the app's own words: "The play history shown here stays on this device unless you share it."
- You can clear a child's history anytime. It asks you to confirm, then asks for a parent check. Their collection and progress aren't touched.
- Sharing a summary as text, through the system share sheet, sits behind that same parent check, and the text names the child.
- The weekly reminder, if you turn it on, is made on your phone with nothing about your explorers sent to set it up.
- Find a place sends what you type to Apple, never to Wild Atlas, and saves only a rounded, city-level location on your phone.
- Anonymous usage statistics, if your family has them on, "count animals and visit lengths in total, never an individual child" (the app's own words). Inside Kid insights specifically, what gets counted is narrower still: things like the screen being opened, or 7 days being switched to All time. No child, animal, or duration is attached to any of it.

Wild Atlas doesn't receive what stays on your phone. There are no ads in Wild Atlas and no accounts to sign into, and Kid insights doesn't change that.

## Where to find it

Kid insights will live in the Grown-ups Area, opened from the menu on Home, in the next update. Nothing to set up first: pick a child, and it's there.

*Raise explorers, not scrollers.*
