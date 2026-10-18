---
layout: layouts/post.njk
title: "Happy Halloween from the Spiders: Super Spiders Is Here"
# DRAFT: status: draft keeps this out of the build (content/blog/blog.11tydata.js).
# No `date` on purpose: set it only when Josh gives the explicit publish go.
# Do not remove `status: draft` until the pack is live AND Josh approves.
status: draft
hideDate: true
author: Wild Atlas
excerpt: "Eight legs, eight eyes, and a bad reputation. 18 spiders step out of the shadows in Wild Atlas, just in time for Halloween."
permalink: /blog/super-spiders-happy-halloween/
coverImage: /assets/blog/super-spiders-hero.jpg
thumbImage: /assets/blog/thumbs/super-spiders-happy-halloween.jpg
tags: [product, packs]
---

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

  .pack-hero {
    margin: 2rem auto;
    max-width: 280px;
    text-align: center;
  }
  .pack-hero img {
    width: 100%;
    display: block;
  }

  .animal-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.75rem;
    margin: 1.5rem 0 2rem;
  }
  @media (max-width: 500px) {
    .animal-grid { grid-template-columns: repeat(3, 1fr); }
  }
  .animal-card { text-align: center; }
  .animal-card img {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 14px;
    object-fit: contain;
    background: #fff;
    display: block;
    box-shadow: 0 3px 14px rgba(42, 33, 24, 0.14);
  }
  .animal-card-name {
    margin-top: 0.35rem;
    font-size: 0.72rem;
    font-family: "Fredoka", system-ui, sans-serif;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.2;
  }

  .animal-image {
    margin: 2rem 0;
  }
  .animal-image img {
    width: 100%;
    border-radius: 14px;
    display: block;
    box-shadow: 0 4px 24px rgba(42, 33, 24, 0.13);
  }
  .animal-image figcaption {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: var(--muted);
    font-style: italic;
    text-align: center;
  }

  .image-pair {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
  }
  .image-pair figure {
    flex: 1;
    margin: 0;
  }
  .image-pair figure img {
    width: 100%;
    border-radius: 14px;
    display: block;
    box-shadow: 0 4px 24px rgba(42, 33, 24, 0.13);
  }
  .image-pair figcaption {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--muted);
    font-style: italic;
    text-align: center;
  }
  @media (max-width: 500px) {
    .image-pair { flex-direction: column; }
  }

  .did-you-know {
    background: rgba(194, 90, 44, 0.07);
    border-radius: 14px;
    padding: 1.5rem 1.75rem;
    margin: 2.5rem 0;
  }
  .did-you-know h2 {
    margin: 0 0 1rem;
    font-size: 1.35rem;
  }
  .did-you-know ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  .did-you-know li {
    margin-bottom: 0.75rem;
    font-size: 0.97rem;
    line-height: 1.5;
  }
  .did-you-know li:last-child { margin-bottom: 0; }
  .did-you-know li strong { color: var(--accent); }

  .cta-block {
    background: linear-gradient(135deg, #C25A2C 0%, #E8834A 100%);
    border-radius: 16px;
    padding: 2rem 1.5rem;
    text-align: center;
    margin: 2.5rem 0 1rem;
    color: #fff;
  }
  .cta-block h3 {
    color: #fff;
    margin: 0 0 0.5rem;
    font-size: 1.4rem;
    font-family: "Fredoka", system-ui, sans-serif;
  }
  .cta-block p { color: rgba(255,255,255,0.85); margin: 0 0 1.25rem; font-size: 0.95rem; }
  .cta-btn {
    display: inline-block;
    background: #fff;
    color: #C25A2C;
    font-family: "Fredoka", system-ui, sans-serif;
    font-weight: 700;
    font-size: 1rem;
    padding: 0.75rem 2rem;
    border-radius: 50px;
    text-decoration: none;
  }
  .cta-btn:hover { background: #FFF5E1; text-decoration: none; }

  /* DRAFT scaffolding: remove when real assets land */
  .asset-todo { background: repeating-linear-gradient(45deg,#fff3d6,#fff3d6 8px,#ffe9b8 8px,#ffe9b8 16px); border: 2px dashed #C25A2C; border-radius: 12px; padding: 0.75rem 1rem; margin: 1.25rem 0; font-size: 0.9rem; color: #5D4037; }
  .animal-card .asset-todo-tile { aspect-ratio: 1; border-radius: 14px; border: 2px dashed #C25A2C; background: #fff3d6; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: #5D4037; margin: 0; }

  /* ---- Halloween theme: this page only (re-skins the shared blog variables) ---- */
  :root { --bg: #1b0d36; --ink: #f6eeff; --muted: #cdb9ea; --accent: #ff9b4e; --rule: rgba(255,255,255,0.16); }
  body { background: radial-gradient(1200px 600px at 80% -10%, rgba(255,140,50,0.22), transparent 60%), linear-gradient(180deg, #1b0d36 0%, #2a1248 55%, #3a1550 100%) fixed; color: var(--ink); }
  .blog-post-header h1, .blog-post-body h2 { color: #ffb36b; font-family: "Fredoka", system-ui, sans-serif; text-shadow: 0 0 22px rgba(255,140,50,0.35); }
  .blog-post-body a, .blog-post-meta a { color: #ffb36b; }
  .blog-post-body strong { color: #fff; }
  .blog-post-body hr, .blog-post hr { border-color: rgba(255,255,255,0.14); }
  .blog-post-body li::marker { color: #ff9b4e; }
  .tldr { background: rgba(255,155,78,0.12); border-left-color: #ff9b4e; }
  .did-you-know { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,155,78,0.35); box-shadow: 0 0 32px rgba(255,120,40,0.12); }
  .did-you-know li strong { color: #ffb36b; }
  .animal-card img { box-shadow: 0 0 0 2px rgba(255,155,78,0.45), 0 6px 18px rgba(0,0,0,0.45); }
  .animal-card-name { color: var(--ink); }
  .animal-image img, .image-pair figure img { box-shadow: 0 0 0 2px rgba(255,155,78,0.35), 0 8px 28px rgba(0,0,0,0.5); }
  .cta-block { background: linear-gradient(135deg, #ff7a2b 0%, #b8369a 100%); box-shadow: 0 0 36px rgba(255,120,40,0.35); }
  .cta-btn { color: #7a2a00; }
  .blog-post-body > p:first-of-type::before, .spooky-hero { content: none; }
  .asset-todo, .asset-todo strong, .asset-todo code { color: #5D4037; }
  .spooky-hero { margin: 0 0 1.5rem; }
  .spooky-hero img { width: 100%; border-radius: 18px; display: block; box-shadow: 0 0 0 2px rgba(255,155,78,0.4), 0 10px 40px rgba(0,0,0,0.55); }
  .spooky-bats { text-align: center; letter-spacing: 0.6em; color: #ff9b4e; margin: 1.5rem 0; font-size: 1.1rem; opacity: 0.8; }
</style>

<figure class="spooky-hero"><img src="/assets/blog/super-spiders-hero.jpg" alt="The Super Spiders pack mascot, a round red spider with white spots, hanging on a silk thread under a full moon"></figure>

<div class="tldr">
  <div class="tldr-label">TL;DR</div>

- **Super Spiders** is a new Wild Atlas pack with **18 spiders**, from the Goliath birdeater to the peacock spider.
- Every animal page has narration in **six languages**, a baby photo, an in-action shot, and size and weight comparisons.
- **$3.99**, one time, no subscription. Included with the Explorer Pass. *(confirm pass inclusion before publish)*
- Spiders are a little spooky. That's the fun part. They are also some of the most interesting animals on Earth.

</div>

Happy Halloween, explorers.

Let's get the spooky part out of the way. Spiders have eight legs. Most have eight eyes. Some live in burrows, some hang in the dark, and some can walk across the ceiling while you are trying to sleep. If you have ever felt your stomach drop when one ran across the floor, you are in very good company.

Here at Wild Atlas, we love them anyway. Maybe *because* of that.

Because here's the thing about the creepiest-looking animals: they are almost always the ones with the best stories. A spider that builds a diving bell out of silk. A spider that does a little dance with its colorful fan. A spider that casts a net over its dinner. Not one of these is in a scary movie. All of them are real.

So this Halloween, we are skipping the costume and opening the door. Meet **Super Spiders**.

## What's in the pack

Eighteen spiders, from rainforests, deserts, caves, ponds, and, yes, your backyard:

Black Widow, Brazilian Wandering Spider, Brown Recluse, Cellar Spider, Cobalt Blue Tarantula, Darwin's Bark Spider, Diving Bell Spider, Giant Huntsman, Giant Wolf Spider, Golden Orb-weaver, Goliath Birdeater, Happy Face Spider, Mexican Redknee Tarantula, Net-casting Spider, Peacock Spider, Regal Jumping Spider, Spitting Spider, and Sydney Funnel-web.

<div class="animal-grid">
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-black_widow_spider.jpg" alt="Black Widow"><div class="animal-card-name">Black Widow</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-brazilian_wandering_spider.jpg" alt="Brazilian Wandering Spider"><div class="animal-card-name">Brazilian Wandering Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-brown_recluse_spider.jpg" alt="Brown Recluse"><div class="animal-card-name">Brown Recluse</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-cellar_spider.jpg" alt="Cellar Spider"><div class="animal-card-name">Cellar Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-cobalt_blue_tarantula.jpg" alt="Cobalt Blue Tarantula"><div class="animal-card-name">Cobalt Blue Tarantula</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-darwins_bark_spider.jpg" alt="Darwin's Bark Spider"><div class="animal-card-name">Darwin's Bark Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-diving_bell_spider.jpg" alt="Diving Bell Spider"><div class="animal-card-name">Diving Bell Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-giant_huntsman_spider.jpg" alt="Giant Huntsman"><div class="animal-card-name">Giant Huntsman</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-giant_wolf_spider.jpg" alt="Giant Wolf Spider"><div class="animal-card-name">Giant Wolf Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-golden_orb_weaver.jpg" alt="Golden Orb-weaver"><div class="animal-card-name">Golden Orb-weaver</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-goliath_birdeater.jpg" alt="Goliath Birdeater"><div class="animal-card-name">Goliath Birdeater</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-happy_face_spider.jpg" alt="Happy Face Spider"><div class="animal-card-name">Happy Face Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-mexican_redknee_tarantula.jpg" alt="Mexican Redknee Tarantula"><div class="animal-card-name">Mexican Redknee Tarantula</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-net_casting_spider.jpg" alt="Net-casting Spider"><div class="animal-card-name">Net-casting Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-peacock_spider.jpg" alt="Peacock Spider"><div class="animal-card-name">Peacock Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-regal_jumping_spider.jpg" alt="Regal Jumping Spider"><div class="animal-card-name">Regal Jumping Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-spitting_spider.jpg" alt="Spitting Spider"><div class="animal-card-name">Spitting Spider</div></div>
  <div class="animal-card"><img src="/assets/blog/super-spiders-animal-sydney_funnel_web_spider.jpg" alt="Sydney Funnel-web"><div class="animal-card-name">Sydney Funnel-web</div></div>
</div>

Some of these names might make you look over your shoulder. That's allowed. Every page tells you the real story: what the animal eats, how it lives, and how much it matters to the people standing near it. Most spiders are not dangerous to people at all. A few are, and the pack says so plainly, with a rule we repeat everywhere: **we never touch a wild spider.** We watch from far away, and we get to know them from the app.

## Inside the animal pages

Just like every Wild Atlas pack, each spider gets the full treatment:

- A **baby photo**. Yes, spiderlings. Yes, they are small.
- An **in-action shot**: hunting, spinning, leaping, or hiding.
- **Size and weight comparisons**, so a Goliath birdeater stops being "a big spider" and becomes "about as heavy as an apple."
- **Narration** in English, English (UK), German, Spanish, French, and Mandarin, so the page can be read aloud for you.

There is also a little something that happens on the pack page itself, when a spider comes down on a thread of silk. We'll leave the rest as a surprise.

*(Inline images with captions: baby spiderling, peacock spider in action, giant huntsman size comparison, Goliath birdeater weight comparison. Final picks come from the pack art folder.)*

<div class="image-pair">
  <figure>
    <img src="/assets/blog/super-spiders-spiderling.jpg" alt="Baby spiderling">
    <figcaption>Baby spiderling</figcaption>
  </figure>
  <figure>
    <img src="/assets/blog/super-spiders-peacock-action.jpg" alt="Peacock spider in action">
    <figcaption>Peacock spider in action</figcaption>
  </figure>
</div>

<figure class="animal-image">
  <img src="/assets/blog/super-spiders-huntsman-scale.jpg" alt="Giant huntsman size comparison">
  <figcaption>Giant huntsman size comparison</figcaption>
</figure>

<div class="asset-todo"><strong>TODO(assets):</strong> Goliath birdeater weight comparison. No weight card exists in the app art yet (<code>GeneratedMeasurementImages/weight/</code> has none for spider_world). Captions above are label-only placeholders, not final copy.</div>

<div class="did-you-know">

## Did you know?

- **Spiders are not insects.** Insects have six legs and three body parts. Spiders are arachnids, with eight legs and two body parts, like scorpions and ticks.
- **Every spider can make silk.** Not every spider builds a web, though. Some use silk to line a burrow, and some use it to hold a tiny net.
- **Spiders do not have bones.** They wear a tough outer shell and shed it to grow.
- **The Goliath birdeater** is about as heavy as an apple.
- **The giant huntsman's legs** can reach up to twelve inches across. [VERIFY]
- **The regal jumping spider** can leap about six times its own body length. [VERIFY]
- **The peacock spider** is far too tiny to hurt people, and it hunts little flies instead.
- **Spiders have been around for hundreds of millions of years**, long before the dinosaurs. [VERIFY]

</div>

## So, are spiders scary?

A little, maybe. And that is okay.

Being a bit spooked by an animal that moves in a way you do not expect is a very normal reaction. It does not mean you are bad at animals. It means you are paying attention. Some explorers like to look away, and some like to look closer. Either one is fine.

In the app you can meet all eighteen from a safe distance: no bites, no webs in your hair, just eight legs and a lot of facts.

## How to get it


**Super Spiders** is **$3.99**, one time. No subscription, no ads. It works offline once downloaded, with narration in six languages. It is also included with the **Explorer Pass**. *(confirm before publish)*


<div class="cta-block">
  <a class="cta-btn" href="https://apps.apple.com/us/app/wild-atlas/id6761081031">Get Super Spiders</a>
</div>

*(App Store button, same as Legends. TODO: confirm the link target; Legends uses the app page.)*

Need the app first?

<div class="cta-block">
  <a class="cta-btn" href="https://apps.apple.com/us/app/wild-atlas/id6761081031">Download Wild Atlas</a>
</div>

---

## For parents and guardians

If your child isn't sure about spiders, this is a low-pressure way to look at them together. Nothing in it jumps out, and every page is something you can read together, one animal at a time. You know your child best, so go at their pace, and skip the pages that are too much. Nobody has to like every spider.

A note for Tiny Explorers (2 to 5): some pages cover venomous spiders and have a spooky Halloween feel. Preview the pack first and choose which animals to share. Every page repeats the same safety message: look, learn, and never touch a wild spider. If you have a real concern about a spider bite, call your doctor or local poison control.


*(Newsletter signup block, identical to the Legends post, including the free Farm Friends pack offer and the consent and privacy text.)*

<!-- Note: the signup block itself is supplied automatically by layouts/post.njk below this post. -->
