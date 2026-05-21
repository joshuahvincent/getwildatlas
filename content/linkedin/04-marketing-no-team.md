---
title: "Marketing a Kids App with No Marketing Team"
series: "Building Wild Atlas"
piece: 4
target_date: 2026-06-16
status: draft
audience: Indie developers, solo founders, "I built it, now what?" crowd
length_target: 1500–2200 words
---

# Marketing a Kids App with No Marketing Team

I have spent most of my career on the product side of companies with marketing teams. Good ones, at Microsoft and Zillow and Meta. People whose job was to think about positioning, brand voice, launch sequencing, and how to get the right message in front of the right audience at the right moment.

For Wild Atlas, that person was me. Badly.

Marketing was the workstream I most underestimated — and I say that as someone who went in knowing he was underestimating it. I thought I had a clear-eyed view of how much work it would be. I didn't. Here's what I actually built, what the agents could do, and where I remained the last mile every single time.

---

## What gets covered when you ask AI agents to do marketing

There's a version of this topic that becomes tool-stack porn — which model I used for what, which prompt produced the best copy. I'm not going to do that. What I'll say instead: the AI agents I used for marketing were capable of producing a large volume of technically correct, structurally sound marketing content, faster than any team I've worked with.

The App Store listing is a good example. Wild Atlas ships in five locales: English (US and UK editions), German, Spanish, French, and Simplified Chinese. Each locale needs a title, a subtitle, a short description, a long description, keyword fields, promotional text, and what-new notes. That's somewhere around thirty discrete pieces of copy per locale, across five locales, with a brand voice that needs to stay consistent.

An agent with the right brief produces the first draft of all of that in hours. With a defined brand voice — the Wild Atlas voice is documented, specific, not generic — the consistency across locales is good. The agents understand the App Store character limits. They understand keyword strategy. They produce something usable on the first pass, not great, but genuinely usable — which is a different standard than most first drafts.

The press kit — short description, long description, fact sheet, in six locales — same pattern. First drafts in hours. The final version required three or four review passes, but the review pass is fast when the starting point is close.

Where the agents did best: structured, repeatable content. Where they consistently needed a human: anything that required a judgement call about what *this* product is trying to say, not just what a product in this category usually says.

---

## The screenshots — 100 assets, one commit

On May 13th, 2026, I committed a complete App Store screenshot matrix: 100 assets across iPhone and iPad portrait and landscape, five locales, polished. One commit.

That sounds like a flex. It's really a confession: I'd built tooling over weeks to produce screenshots at that scale, because I'd underestimated how much work screenshot production actually is.

Every device size needs its own formatted image. Every locale needs localised copy in the screenshot. iPad landscape versus iPad portrait are different enough that they can't share a template. Apple has specific size requirements per device. The images need to show the product at its best while conveying what the product is in under three seconds of scroll.

I had an agent that handled the generation pipeline. What the agent couldn't do: decide which moments in the app were worth screenshotting. Which animals made the best first impression. Which game was most visually arresting. Which pack name in German or French conveyed the right feeling without looking odd.

Those decisions were all mine. The agent did the scaling, the formatting, the copy insertion, the matrix management. I did the curation, which turned out to be most of the creative work.

---

## Brand voice: the place AI gets closest, then fails

Wild Atlas has a documented brand voice. Two of them, actually — one for the app content (the Attenborough lineage, educational and warm), one for marketing (more playful, talks to parents, has a bit of edge).

The agents, given that documentation, stay reasonably in-brand. Better than a freelancer who hasn't been briefed. Worse than a copywriter who has genuinely internalised what makes this product distinct.

The place this showed up most clearly: the tagline.

The app's tagline is "Raise explorers, not scrollers." I landed on that. An agent didn't suggest it — or if it did, I don't remember, which means it didn't land. The line works because it speaks to a specific tension: parents who are sceptical of screen time and simultaneously looking for screen time that feels justified. It names the thing they're afraid their kids will become. It offers an alternative.

That positioning — who this product is *for* and what fear it is *resolving* — is not something I was able to get from an agent. The agents produced correct, brand-consistent descriptions. They did not produce the sentence that would make a parent stop scrolling.

I knew this would be the case. It's the thing I'd budget for next time: a positioning conversation with a human who understands both the product and the audience, early. Before the App Store listing is written. Before the website copy is written. Because positioning is the upstream decision that every piece of downstream copy depends on.

---

## The press: where I hit the wall

I produced a press release. Six locales, clean writing, accurate claims about the product. It went to a distribution service. I don't know yet whether it worked, because the app launched recently enough that I don't have a clear read on which coverage came from the release and which came from other channels.

What I know for certain: the press release is the easy part. The hard part is the actual press list — knowing which journalists cover kids' apps, which ones write for parents rather than developers, which ones are likely to find a solo AI-built product genuinely interesting rather than a genre piece. That knowledge requires relationships and reading. The agent can produce a media list; it cannot tell me which of the hundred people on it would actually write something.

I don't have a PR person. I didn't hire one. In retrospect, that was probably the most significant gap in my marketing plan — not because the agent-produced materials were bad, but because getting material in front of the right people, at the right time, in a way that produces genuine interest rather than form-email responses, requires human judgment and human relationships that I don't have and no agent can replicate.

What I'd budget for next time: a few weeks of a specialist's time, specifically for press outreach. Not the press kit — I can produce that. The outreach itself.

---

## What still needs a human

Let me be direct about this, because I think the honest version is more useful than the optimistic one.

**Positioning.** What this product is, who it's for, what specific fear or desire it resolves. That's a human conversation that produces the sentence the agents can then scale.

**Press relationships.** Building and maintaining actual relationships with journalists who cover this space. Not a workflow problem — a time and trust problem.

**Launch sequencing.** The decision about when to publish what, in what order, to which channels, given what I know about who's paying attention and why. Agents can produce the content. The sequence is strategy, and strategy in conditions of uncertainty — "I don't know if Apple is approving this week or next" — requires someone who can hold multiple futures simultaneously and make a bet.

**The actual story.** The agents can tell the product story competently. They cannot tell *my* story — which is the one that makes this product matter to someone who's read ten product launches this week. The specific details that make this product belong only to this founder are the ones I had to inject personally, every time.

---

## What I learned

Marketing is not a workstream that scales the same way code does.

With code: I can describe a feature, an agent implements it, I review and refine, and the output is deterministic enough to converge on correct. The feedback loop works.

With marketing: I can describe a positioning, an agent produces copy, and the output may be technically correct but emotionally flat — and "emotionally flat" is much harder to fix iteratively than a bug. The gap between "correct" and "resonant" requires taste that the agents don't have.

The agents made me significantly more efficient at marketing than I would have been without them. I produced more content, more consistently, more quickly than any one-person marketing operation I've seen. What they didn't do was substitute for strategic marketing judgment.

I went in knowing this and still underestimated it. If you're planning to build with AI agents and you're thinking "marketing will sort itself out," it won't. It requires more of you, not less.

---

*Wild Atlas launched May 26, 2026. Next piece in this series: what happened when real kids used the app — and the bugs the AI couldn't catch.*
