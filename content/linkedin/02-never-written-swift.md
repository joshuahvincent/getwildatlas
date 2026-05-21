---
title: "I Had Never Written Swift. Three Months Later My App Was on TestFlight."
series: "Building Wild Atlas"
piece: 2
target_date: 2026-06-02
status: draft
audience: Aspiring builders, PMs considering going solo, the "I have an idea but I can't code" crowd
length_target: 2000–3000 words
---

# I Had Never Written Swift. Three Months Later My App Was on TestFlight.

The first thing I did when I decided to build Wild Atlas was open Xcode.

I had never opened Xcode before in my life.

I don't say that to be charming about it. I say it because there's a whole genre of content right now where someone builds an app "with AI" and the story starts at the interesting part — the AI doing clever things. The story doesn't start when a 25-year PM with zero iOS background sat in front of an IDE he'd never used, installed Homebrew for the first time, and tried to figure out what a simulator target was.

That's where mine starts.

---

## February 2026. Zero.

Let me be precise about the starting point, because I think the precision matters.

I had 25 years of product management experience — Microsoft, Zillow, Meta. I had shipped software hundreds of times. I understood architectures, had opinions on data models, could read code well enough to know when something smelled wrong. I was not a technical stranger.

But I had never written Swift. Never configured an Xcode scheme. Never dealt with code signing. Never touched App Store Connect. Never done a TestFlight distribution. The whole iOS developer ecosystem — the tooling, the workflow, the terminology — was invisible to me.

Two weeks before the first commit landed in git, I was installing Xcode, figuring out what Homebrew was, and reading documentation I only half understood. That part was real, focused work. Not glamorous, not fast, and — critically — not something the AI could do for me. It had to walk me through some of it. But understanding what the walkthrough was actually teaching me? That was mine to do.

The first commit went in on Sunday, March 1st, 2026, at 6:59 a.m.

---

## What the agents handled

Once the environment was set up, the pace was genuinely extraordinary.

My agents wrote the Swift. They generated the view code, the data models, the service layers, the StoreKit implementation. They wrote the build scripts. When bugs appeared, they diagnosed them — most of the time. When I described a feature in plain language, they translated it into working code at a speed no team of engineers I'd ever worked with could match.

By March 8th — seven days in — I had a functional app with animal encyclopedia pages, a facts carousel, and map pins. On March 9th I shipped a marketing landing page with JSON-LD schemas and a sitemap, before I had a finished product to sell. The PM instinct — build the thing people will see before you've finished the thing they'll use — translated perfectly.

That velocity is real. I won't undersell it. But there's a version of this story that stops there, and it would be dishonest.

---

## What the agents could not touch

Here's what no AI agent did for me, because it couldn't:

**Code signing.** The first time I tried to build for a device rather than the simulator, I hit certificate and provisioning errors that took hours to understand. The agent could tell me what to do, step by step. It couldn't hold my hand through the Keychain, the developer portal, and the mental model of why all of it exists. That required me to sit with it until I understood it.

**Scheme management.** Wild Atlas has two schemes — one for development, one for App Store distribution. Getting those right, understanding what they control and why the distinction matters, keeping them from interfering with each other — the agent knew the answer to every question I asked. The problem was I didn't always know the right question.

**App Store Connect.** The metadata, the screenshots, the age ratings, the privacy questionnaire, the app review guidelines, the TestFlight groups, the phased release settings — this is an entire system with its own conventions, its own gotchas, and its own relationship with Apple. You learn it by doing it, slowly, making mistakes that cost you review cycles.

**The strategic decisions nobody asked.** More on this in a minute.

The pattern I noticed: AI agents are almost infinitely capable at the implementation layer — given a clear task, they execute it faster and more consistently than any engineer I've worked with. But they don't initiate. They don't look up from the task and say, "Before I do this, have you thought about that?" That gap turns out to be expensive.

---

## The decision nobody made

Here's a story I think about a lot.

I never consciously decided to build Wild Atlas in Swift. The agent defaulted to it — I was on a Mac with Xcode, it was the obvious choice for iOS, and the agent went. I didn't think to ask whether that was the right call.

About six weeks in, a friend asked if Wild Atlas was coming to Android. She's an Android user. I said I didn't know. Then I realised I'd never thought about it. I had locked myself into iOS-only without a decision ever being made.

From a product management perspective: not great. iOS-only significantly reduces the total addressable market, and I'd arrived at that constraint through omission, not strategy.

The lesson I drew from it: I'd want an "engineering architect" agent role defined at the *start* of any project. An agent whose only job is to surface strategic questions before a single line of code goes in. Platform choice. Data model decisions. Ecosystem lock-in. Localisation strategy. These are the things the coding agent will never ask about, because it's focused on the task you gave it.

That role didn't exist. I improvised my way to iOS-only without realising it.

---

## The skills that transferred

Twenty-five years of PM experience didn't teach me Swift. But it taught me some things the agents couldn't.

**Scope discipline.** The agents will always add more. More features, more edge case handling, more flexibility. When the first draft of a component came back three times larger than I'd asked for, I had the muscle memory to say: ship the small thing, extend it when you need to. That instinct doesn't come from knowing Swift. It comes from having been burned by scope creep across too many teams.

**Knowing what good looks like.** This sounds vague, but it matters: I could tell when the agent had done something elegant versus something that worked but would become a problem in three months. I couldn't always say *why* in technical terms, but I could feel the difference. That made me a better reviewer of the code it produced.

**Debugging mindset.** Not debugging the code — that's the agent's job. Debugging the *problem statement*. When something wasn't working, the instinct to get clear on what we were actually trying to solve before generating more code — that was mine, and it saved significant time. More on that in the next piece in this series.

**Managing agents like engineers.** This is the one that surprised me most. By week three or four, I'd shifted my posture from "extend trust, they'll get it right" to something closer to how I'd manage a very capable but junior engineer: verify the plan before approving implementation, review the output before merging, don't assume because it ran that it's correct. My default assumption, by the end, was that the agent had gotten *something* wrong. Not everything — something. The instinct to check was PM muscle memory.

---

## The skills that didn't transfer

And then there are the things I simply had to learn from scratch.

Platform conventions. SwiftUI idioms. The difference between a @State and a @StateObject and why it matters. AVFoundation's session management. StoreKit's entitlement model. These aren't things you absorb through product intuition — you learn them by hitting walls repeatedly, asking questions, hitting different walls.

I kept notes. When I hit a concept that seemed important and that I didn't understand yet, I'd write it down and ask the agent to explain it before we moved on. That habit — PM behaviour, basically — meant that by month three I had a functional mental model of iOS development that I wouldn't have built if I'd just let the agent handle everything silently.

There were also things I walked into blind that cost real time. In early March, about ten days into the project, I pasted an API key into an agent thread so it could use it for image generation. The key ended up in `Info.plist`. It went into a commit. GitHub's push protection caught it and refused the push — which is how I learned, at 7:57 a.m. on March 11th, what secrets management means and why engineers care so much about it.

I recycled the key. Eventually. (The agent had told me to do it immediately. That's on me.)

This is the thing about the non-engineer learning curve: engineers take security hygiene for granted because they've had it drilled in. A PM walks into it blind, gets saved by automated tooling, and makes a note. The note says: *there are things you will not know you need to know.* Build in the assumption that you're missing something.

---

## When a human had to step in

Twice in the project, I asked people with actual iOS experience to look at what I'd built.

Once for a particularly gnarly code signing issue I couldn't reason my way out of. Once for an audio session architecture question where I suspected my agents had produced something fragile but couldn't articulate why.

Both times, the answer was quick — a few minutes of someone looking at the actual code, not the description of it. Both times, it confirmed a suspicion rather than discovering something I couldn't have found myself eventually. But "eventually" in a solo project means days, and having a human available for a few minutes of pattern-recognition is something I'd budget for explicitly next time.

The agents are remarkably capable. They are not a replacement for an experienced engineer who can look at your architecture and say "this will break under load" in thirty seconds.

---

## Honest read: can someone without 25 years of PM do this?

I've been asked this a lot.

My honest answer: probably, but not as easily as the hype suggests.

The AI tools genuinely do compress the gap between "has a great idea" and "has a working prototype" to something close to weeks rather than years. That's real. It's the most significant shift I've seen in the 25 years I've been building products.

But the gap they compress is the *implementation* gap. The judgment gap — what to build, in what order, with what tradeoffs — is still there. The platform knowledge gap is still there, just addressed differently (by asking rather than knowing). The debugging mindset gap is still there. The "knowing when something is wrong before you can prove it" gap is still there.

I think someone with genuine product intuition and the patience to learn the concepts the agents surface can get surprisingly far. I think someone who has never shipped a product before, who doesn't know how to scope, who doesn't know what good looks like — they're going to struggle at a different layer. The agents are incredibly capable. They need to be directed.

Before a single line of app code, there was Xcode to install. Homebrew to configure. A developer account to set up. Tools to learn that just weren't there the day before. None of that is the fun part, and the AI doesn't scaffold it for you — it helps you through it, which is different. That setup work alone filters out a lot of people who'd otherwise try.

---

## What I'd do differently

Earlier agents, defined more specifically. I spent the first nine weeks of this project using agents as capable general labourers. The formal agent library — eight agents with defined specialisations — landed in a single commit on May 8th, nine days before I submitted the app to Apple.

What would have happened if I'd defined those roles in February? I don't know for certain, but I suspect I'd have spent less time redoing work that was done without context on the broader architecture. Specialised agents with a documented scope make fewer assumption-based shortcuts. They produce more consistent outputs. And when one of them does something wrong — which they all do — you know where to look.

The other thing I'd do differently: ask the question you're not sure to ask. At the start of every significant new piece of work, I'd prompt an agent to play the sceptic — not to implement, just to surface the things I might not have thought of. The Swift decision would have come up in five minutes of that conversation. In February.

---

*Wild Atlas launched May 26, 2026. It's a narrated animal app for kids aged 3 to 9. No ads, no subscriptions, works offline. Next piece in this series: the agent workforce that built it — what each one does, and what each one is bad at.*
