---
title: "The Kids Caught Bugs the AI Couldn't"
series: "Building Wild Atlas"
piece: 5
target_date: 2026-06-23
status: draft
audience: Product managers, designers, anyone shipping for an audience they're not a member of
length_target: 1500–2000 words
---

# The Kids Caught Bugs the AI Couldn't

My two-year-old broke Wild Atlas.

Not by finding a bug in the code — by trying to use it and not being able to. He's not yet three. He can swipe. He can tap, sometimes. The interface was too complex for him, and watching him try to navigate it was its own kind of feedback: a very small person repeatedly not doing the thing the UI expected, without frustration, because he didn't have expectations yet.

That session with my son Lurian changed the app's age rating. The App Store metadata had said "ages 2 to 9." After watching Lurian, I committed a fix: raise the minimum age from 2 to 3 across every piece of copy in the app, in all five locales. The commit message says: *"After real-world testing with a 2-year-old, the app interface is too complex for that age group."*

An AI agent could not have found that. Not because of any limitation in the technology. Because you cannot simulate a two-year-old who doesn't know what a swipe is yet.

---

## What AI testing finds

Let me be specific about what the agents were good at, because they were genuinely good at things.

They caught logic errors. They found UI states that the code didn't handle — edge cases in pack loading, missing error states when audio failed, navigation paths that dead-ended. They tested the things they were told to test, consistently and quickly. They found the bugs that have a reproducible condition you can write down.

What they can't do: sit with the app for twenty minutes and notice that something feels off. Notice that a tap target is technically the right size but is still somehow hard to hit. Notice that the narration voice is slightly too fast for a five-year-old who reads slowly. Notice that a six-year-old who starts a quiz and gets something wrong will abandon the session at a higher rate than one who starts with an easier question.

Those aren't bugs in the traditional sense. They're mismatches between what the builder assumed and how the audience actually behaves. The only way to find them is to watch the audience.

---

## Jasper at Sasha's place

A friend named Sasha had families over — adults and kids in and out of the afternoon. I put Wild Atlas in front of Jasper, who was eight years old.

He played Habitat Hop — one of the in-app games — straight through easy, medium, and hard difficulty. After each level, he ran back to me to tell me he'd finished it. Unprompted — not because I'd asked him to report back, but because he wanted to share the achievement with someone who'd care. He ran back every time.

When his family was leaving, he didn't want to give the app back.

He'd also come back with a list. Ideas he had for things he wanted the app to do. An eight-year-old with a feature list, from thirty minutes of autonomous play. No adult facilitation, no guided tour, no instructions. He just picked it up and drove.

I had built Wild Atlas so kids could self-drive. Jasper self-drove. And then he wanted to co-build.

That's not a bug. That's a signal. The engagement loop I'd designed was working — and working well enough that a kid wanted to extend it. Which told me something I couldn't have known from a simulator: the achievement mechanic, the level progression, the "run back and tell someone" impulse — those were all doing what I'd hoped.

Agents don't run back to tell you anything. They complete the task and wait for the next one.

---

## Zuzu at breakfast

My daughter Zuzu is five. She was my first tester, throughout the whole build — scrolling through animal pages, playing quizzes, telling me when something was wrong or boring or scary.

One morning she refused to eat breakfast. Standard five-year-old negotiating position. I put the Wild Atlas slideshow on — the Wildwatch feature, narrated animal photos that play in sequence — and told her she couldn't watch it if she wasn't eating. She ate her entire meal without complaint, focused on the puppies.

I hadn't designed Wildwatch as a breakfast tool. I'd designed it as a way to give kids a passive, narrated experience when they didn't want to interact — long flights, quiet moments. Zuzu had found a different use for it, one that didn't require any interaction at all except from the parent negotiating screen time.

My wife eventually called it: too much screen time in the morning. She was right. I agreed. But I noted something: the slideshow had created leverage I didn't know I had, and in the wrong direction.

Which brings me to the thing I want to name directly, because I think it's important to name.

I built a screen product for children. I did this while also, simultaneously, being the kind of parent who worries about how much screen time my kids get. Wild Atlas is designed to be educational and calm and ad-free — "raise explorers, not scrollers" is genuinely what I believe — but it is still a screen. Zuzu used it to eat breakfast. If I hadn't set a limit, she'd have used it for more.

I think Wild Atlas is genuinely better screen time than most alternatives. I built it because I couldn't find what I wanted to hand my kids. But I'm not going to pretend the contradiction doesn't exist — that I built a screen product partly out of concern about screens — because it does, and I think most parents building kid apps have this tension and most of them don't name it.

The agents don't feel this tension. I do.

---

## Katie's car

A friend named Katie drives with her two boys in the back seat. They started putting Wild Atlas on for car trips. Specifically, they liked the "fun words" vocabulary sections — the narration introduces a word, explains it, kids absorb it as ambient sound while the landscape goes by.

Katie's feature request: background audio when the device screen is off. She wanted it to work like a podcast — narration running, screen dark, kids learning passively while they look out the window.

I hadn't built that. I hadn't thought of it. I built Wild Atlas for eyes-on engagement: look at the animal, tap the fact, do the quiz. Katie's boys were using it as eyes-off audio — exactly the mode I hadn't designed for.

I haven't shipped background audio yet. It's a genuine future intention, not a committed roadmap item. But the discovery mattered because it told me something about what the product actually was for the people using it — which was not identical to what I'd thought.

This is the pattern that ran through every piece of beta feedback: I built it for self-driven visual learning. People used it as a breakfast tool, a car podcast, an achievement collector, and a feature-request generator. None of those were in the brief.

---

## What I learned about narration speed and attention

There was an eight-year-old called Ellis — not a kid in my social circle, the son of a friend of a friend, which made his feedback more useful than most. Ellis "hardly uses devices in general." His assessment of Wild Atlas, in one word: *"Addictive."*

He also told his father's friend that the narrator was too fast — he reads well, and the narration outpaced him. He wanted to read at his own pace, not be read to.

That note went into the product immediately. Narration speed controls are now on my roadmap in a way they weren't before Ellis's session.

What that session showed me: building a single narration speed for a 3-to-9 age range is a significant assumption. A five-year-old who can't read wants narration. An eight-year-old who reads well may find narration constraining. The same audio that delights one part of the audience is an obstacle for another part.

No automated test surfaces this. The AI agent doesn't know what it feels like to be a fast reader being outpaced by audio. Ellis knows.

---

## The testing rhythm that actually worked

I want to be honest about what the beta process looked like, because I think the framing of "I ran a structured beta test" would be flattering but wrong.

What I actually did: sent TestFlight links to friends with kids of the right ages, watched the ones whose kids I could watch directly, collected WhatsApp messages from the parents of the ones I couldn't. Iterated on what I saw and heard. Repeated.

It wasn't systematic. It was responsive. Every new major feature went to a small set of people who I knew would give me a real reaction, and I watched the reaction more than I read the feedback. The watching is what taught me things. The messages were confirmation.

The one thing I'd do differently: earlier. I waited longer than I should have to put the app in front of kids I didn't know. The feedback from strangers is different from the feedback from your own kids — your kids will be generous in ways that a stranger's kid won't, because a stranger's kid has no relationship to protect. Jasper's feature list and Ellis's "addictive" and Katie's podcast discovery all came from people I didn't know well, and they were more instructive than anything my own kids told me.

---

## What I'd carry into the next build

Every product decision I made about the core experience — the tap targets, the narration pacing, the quiz difficulty, the animation timing, the minimum age — was either validated or invalidated by a real child doing something unexpected. Not by automated testing, not by the agents, not by me simulating the experience.

The agents are excellent at testing what they've been told to test. Kids test what matters to them, which is often not the same thing.

The discipline is accepting that you don't know what matters to your audience as well as you think you do. You have to watch. You have to give the product to people who don't know you built it and watch what they do with their hands.

That part doesn't get automated. Not yet, not anytime soon, and maybe not ever — because what you're watching for isn't a bug state. It's the moment a kid looks up from the screen with more questions than the app gave them answers to.

That moment is the whole point.

---

*Wild Atlas launched May 26, 2026. Next piece in this series: how I wrote encyclopedic animal content for 200+ species without being a biologist.*
