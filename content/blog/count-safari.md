---
layout: layouts/post.njk
title: "Count Safari: A Counting Game Built on How Kids Actually Learn Numbers"
date: 2026-07-08
author: Wild Atlas
excerpt: "Count Safari is the fifth game in Wild Atlas — a counting game built around real animals and the science of how kids actually learn to count."
permalink: /blog/count-safari/
coverImage: /assets/blog/count-safari-difficulty.png
tags: [product, games]
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

  .screenshot-row {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    padding-bottom: 0.5rem;
  }
  .screenshot-row figure {
    flex: 0 0 auto;
    width: 220px;
    margin: 0;
    scroll-snap-align: start;
  }
  .screenshot-row figure img {
    width: 100%;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(42, 33, 24, 0.15);
  }
  .screenshot-row figcaption {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--muted);
    font-style: italic;
    text-align: center;
  }

  .screenshot-single {
    margin: 2rem auto;
    max-width: 280px;
  }
  .screenshot-single img {
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 6px 32px rgba(42, 33, 24, 0.18);
    display: block;
  }
  .screenshot-single figcaption {
    text-align: center;
    margin-top: 0.6rem;
    font-size: 0.85rem;
    color: var(--muted);
    font-style: italic;
  }

  .video-container {
    margin: 2rem auto;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 6px 32px rgba(42, 33, 24, 0.18);
    background: #1a1a1a;
    max-width: 300px;
    aspect-ratio: 9/16;
  }
  .video-container video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
  .video-placeholder {
    max-width: 300px;
    margin: 2rem auto;
    background: #E9DCC2;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    font-style: italic;
    font-size: 0.9rem;
    text-align: center;
    padding: 3rem 2rem;
    aspect-ratio: 9/16;
  }

  .infographic {
    margin: 2.5rem 0;
  }
  .infographic img {
    width: 100%;
    border-radius: 12px;
    display: block;
    box-shadow: 0 2px 16px rgba(42, 33, 24, 0.1);
  }
  .infographic figcaption {
    text-align: center;
    margin-top: 0.6rem;
    font-size: 0.85rem;
    color: var(--muted);
    font-style: italic;
  }

  .float-left-image {
    float: left;
    width: 220px;
    margin: 0.25rem 1.5rem 1rem 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(42, 33, 24, 0.12);
  }
  .float-left-image img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 12px;
  }
  .clearfix::after {
    content: "";
    display: table;
    clear: both;
  }
  @media (max-width: 500px) {
    .float-left-image {
      float: none;
      width: 100%;
      margin: 0 0 1.25rem;
    }
  }

  .hook-callout {
    background: var(--ink);
    color: #fff;
    border-radius: 14px;
    padding: 1.5rem 1.75rem;
    margin: 2rem 0;
    text-align: center;
  }
  .hook-callout p {
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.55;
    color: rgba(255,255,255,0.92);
  }
  .hook-callout strong {
    display: block;
    font-family: "Fredoka", system-ui, sans-serif;
    font-size: 1.35rem;
    color: #fff;
    margin-bottom: 0.5rem;
    line-height: 1.25;
  }

  .citation {
    font-size: 0.8rem;
    color: var(--muted);
    margin-top: -0.75rem;
    margin-bottom: 1.25rem;
  }

  .counting-steps {
    background: #fff;
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin: 1.5rem 0 2rem;
  }
  .counting-steps ol {
    margin: 0;
    padding-left: 1.5rem;
  }
  .counting-steps li {
    margin-bottom: 0.6rem;
    font-size: 0.97rem;
  }
  .counting-steps li strong {
    color: var(--accent);
  }
  .counting-steps li:last-child { margin-bottom: 0; }

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
</style>

<div class="tldr">
  <div class="tldr-label">TL;DR</div>
  <p>Wild Atlas v1.0.1 ships Count Safari — the fifth game in the app, and the first built around counting. Kids tap real animals to count aloud, hear every animal named as they go, then progress through three levels of counting challenge. A follow-on math game is in development that builds directly on what Count Safari establishes.</p>
</div>

<figure class="float-left-image">
  <img src="/assets/blog/03-safari-to-screen.png" alt="Count Safari grew from that instinct — counting lions on safari to counting on screen">
</figure>

There's a game that happens naturally on safari. You look up, see a pride of lions, and without thinking you start counting. How many lions? How many antelope at the waterhole? How many baboons up on the rocks? It's not a lesson. It's just what you do. And the kids start doing it too. Research suggests that a child's early sense of numbers — the kind built through play and counting games — is <a href="#number-sense">linked to how they approach math as they grow</a>.

Count Safari is that game — built into Wild Atlas, so your kids can get a head start on the counting that lays the foundation for everything that comes after.

<div class="clearfix"></div>

<div class="video-container">
  <video autoplay loop muted playsinline>
    <source src="/assets/blog/count-safari-reel.mp4" type="video/mp4">
  </video>
</div>

## What It Is

Count Safari is the fifth game in Wild Atlas, joining Memory Match, Puppy Puzzle, Who's Who, and Habitat Hop.

<div class="screenshot-row">
  <figure>
    <img src="/assets/blog/count-safari-game-den.png" alt="Wild Atlas Game Den showing Count Safari at the top of the list">
    <figcaption>Count Safari in the Game Den.</figcaption>
  </figure>
  <figure>
    <img src="/assets/blog/count-safari-difficulty.png" alt="Count Safari difficulty selection: Learn Numbers, Easy, Medium, Hard">
    <figcaption>Four modes. One tap to start.</figcaption>
  </figure>
</div>

It starts with **Learn Numbers** — a group of Wild Atlas animals appears on the screen. Your child taps each one, one by one. Each tap plays the number aloud — "One!" "Two!" "Three!" — and the count appears in large text at the bottom. There's no test, no wrong answer, no timer. Just: tap, hear, see, repeat. And because these are real Wild Atlas animals, the app narrates each one by name — so the child counting tapirs and sun bears is also, quietly, learning what a tapir and a sun bear are called.

<div class="screenshot-row">
  <figure>
    <img src="/assets/blog/count-safari-learn-numbers-labrador.png" alt="Learn Numbers: tap each Labrador to count — number 2 shown">
    <figcaption>Tap. Hear. See. Repeat.</figcaption>
  </figure>
  <figure>
    <img src="/assets/blog/count-safari-learn-numbers-camels.png" alt="Learn Numbers mode: tapping camels, count showing 3">
    <figcaption>Every animal named as you go.</figcaption>
  </figure>
  <figure>
    <img src="/assets/blog/count-safari-learn-numbers-giraffes.png" alt="Learn Numbers mode: 6 giraffes, number 5 revealed">
    <figcaption>Real animals, real numbers.</figcaption>
  </figure>
</div>

From there, three levels of challenge follow. Easy asks "how many?" with four answer choices. Medium introduces two boxes of animals and asks which has more or fewer. Hard hides the count before they answer and reveals it after. The difficulty grows within each level as a child plays — the range expands gradually, so a child who's just starting Easy sees smaller counts than one who's been at it for a while.

<div class="screenshot-row">
  <figure>
    <img src="/assets/blog/count-safari-easy-mode.png" alt="Easy mode: 8 animals, correct answer selected — Yes! There are 8 animals.">
    <figcaption>Easy — "How many animals?"</figcaption>
  </figure>
  <figure>
    <img src="/assets/blog/count-safari-medium-more.png" alt="Medium mode: Which group has more? 4 dogs vs 6 dinosaurs">
    <figcaption>Medium — "Which group has more?"</figcaption>
  </figure>
  <figure>
    <img src="/assets/blog/count-safari-medium-fewer.png" alt="Medium mode: Which group has fewer? 2 wild dogs vs 4 french bulldogs">
    <figcaption>Medium — "Which group has fewer?"</figcaption>
  </figure>
</div>

Every number is a pre-recorded clip. Every wrong answer gets "Not quite. [correct count]." Every right answer gets a green flash, a bounce, and "Yes!" Nothing changes register just because it's a game — the voices are the same real, warm narrators as the rest of Wild Atlas.

Count Safari is the foundation for a math game coming later — one that picks up directly where this one leaves off.

## The Science Behind Counting Through Play

Child development researchers have identified three distinct counting competencies that children acquire in sequence — each one a genuine conceptual leap, not just a harder version of the one before. Count Safari's three modes are built to follow that path.

<div class="counting-steps">
  <ol>
    <li><strong>One-to-one correspondence</strong> — tagging each object with exactly one number word. The foundational step, and not as automatic as it looks.</li>
    <li><strong>Cardinality</strong> — understanding that the last number you say names the size of the whole group. Children can count accurately for a long time before this clicks.</li>
    <li><strong>Relational number sense</strong> — reasoning about relative quantity: more, fewer, same. This is where counting becomes mathematical thinking.</li>
  </ol>
</div>

<figure class="infographic">
  <img src="/assets/blog/01-counting-ladder.png" alt="Infographic: The Counting Ladder — Correspondence, Cardinality, Comparison mapped to Count Safari modes">
  <figcaption>Each Count Safari mode targets a different rung on the developmental ladder.</figcaption>
</figure>

### Learn Numbers → One-to-One Correspondence

A child who won't count in the abstract will count penguins. Tap each animal, hear the number, watch the count climb. That's not just a mechanic — it's the definition of one-to-one correspondence: one touch, one number word, one object. Physical, sequential, and visual all at once.

<figure class="infographic">
  <img src="/assets/blog/02-same-or-different.png" alt="Infographic: Reciting numbers and understanding them are not the same thing">
  <figcaption>Rote counting and understanding the count are different skills — and children develop them separately.</figcaption>
</figure>

Rote counting — reciting "one, two, three" in order — comes first. But reciting numbers is not the same as understanding what they mean. Rochel Gelman and C. R. Gallistel documented this distinction in their landmark 1978 work; Karen Wynn later showed how long children can count objects correctly before the principle actually clicks. Learn Numbers is designed for that gap: the child who can say the numbers but is still building the connection between the word and the thing.

### How Many? → Cardinality

<figure class="infographic">
  <img src="/assets/blog/04-what-counts-as-counting.png" alt="Infographic: Not all counting is the same — four competency types">
</figure>

Easy mode asks "how many?" and presents four answer choices. The child can't tap through — they have to hold the whole group in mind as a single quantity and pick the number that names it. That shift, from counting to representing, is cardinality. It's harder than it sounds, and it's the step most early math games skip.

<h3 id="number-sense">Which Has More? → Relational Number Sense</h3>

Medium and Hard move into comparison: which group has more, which has fewer, with the count hidden before the answer. This is relational number sense — reasoning about quantity without counting each one — and research finds it correlates with mathematics achievement even when controlling for general cognitive ability (Halberda, Mazzocco & Feigenson, 2008).

<figure class="infographic">
  <img src="/assets/blog/05-ans-correlation.png" alt="Infographic: Early number sense matters more than you might think">
</figure>
<p class="citation">Halberda, J., Mazzocco, M. M. M., & Feigenson, L. (2008). Individual differences in non-verbal number acuity correlate with maths achievement. <em>Nature, 455</em>, 665–668.</p>

The incidental animal-name learning runs through all three modes — words encountered in a motivating context are more likely to stick than words presented in isolation. A child counting wild dogs and capybaras is building vocabulary alongside number sense, neither one announced as a lesson.

None of this is a promise that Count Safari will accelerate any individual child's mathematical development. Development is highly variable, and no app controls for the many factors at play. What the design does do is respect the right sequence — correspondence before cardinality, cardinality before comparison — and give children a reason to count that has nothing to do with getting through an exercise.

## A Note on Mandarin

We also re-recorded all Mandarin narration in this update — zh-Hans families will notice the difference.

---

Count Safari is live now in v1.0.1. A child tapped nine penguins in a row and looked up to see if anyone noticed.

Someone did.

<div class="cta-block">
  <h3>Download Wild Atlas</h3>
  <p>Free to download. Three packs included. Count Safari waiting in the Game Den.</p>
  <a class="cta-btn" href="https://apps.apple.com/us/app/wild-atlas/id6761081031">Download on the App Store</a>
</div>
