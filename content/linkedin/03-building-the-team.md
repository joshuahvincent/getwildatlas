---
title: "Building the Team That Built Wild Atlas"
series: "Building Wild Atlas"
piece: 3
target_date: 2026-06-09
status: draft
audience: Engineers, technical founders, "AI agents as workforce" evaluators
length_target: 2000–3000 words
---

# Building the Team That Built Wild Atlas

I went into this thinking AI agents were senior architect engineers.

They're not. That framing cost me weeks.

I came to think of them as capable junior engineers — fast, technically competent, willing, and reliably inclined to cut corners to ship the thing you asked for without accounting for the edge cases, the broader system, or the decision you didn't know to tell them about. That reframe changed everything about how I worked.

Here's what the actual team looked like, what each member did, and what each one was bad at. Then I want to tell you about the two incidents that shaped my view of security on this project — because if you're building an app with AI agents right now and you haven't thought about credentials, you're carrying a time bomb.

---

## The roster

For the first nine weeks of building Wild Atlas, I used agents as general labourers. Capable ones, but undifferentiated. I'd describe a task, an agent would take it, and it would deliver something — sometimes right, sometimes fragile, sometimes technically correct but structurally wrong in ways I wouldn't discover for another two weeks.

On May 8th — nine days before I submitted Wild Atlas to Apple — I committed all eight founding agents to the repo in a single file. The formal agent library. Eight roles, eight scopes, eight sets of responsibilities. Looking back at that commit is a little embarrassing, because what it tells me is that I had the instinct to specialise all along. I just didn't operationalise it until the sprint home.

**Release Manager.** Owns branch hygiene, merge sequencing, TestFlight and App Store distribution, the promotion workflow from integration to main. Does this reliably. What it's bad at: anything that requires reading context outside the release pipeline. It will follow the PR rules correctly and not notice that the feature it's shipping has a design problem.

**Senior Engineer.** Structured bug-fix workflow. Created the evening of May 11th. The next morning was the worst bug day of the project — I'll get to that. The senior engineer agent has the most deliberate process of any of them: reproduce first, instrument second, hypothesise third. When it follows the process, it's the best debugging resource I have. When it skips steps, which it does, it's as frustrating as any junior who decides the answer is obvious and starts typing before reading the brief.

**Audio Pipeline.** Manages audio generation, encoding, routing, hosted-content delivery. Knows the audio architecture well. What it's bad at: anything that requires musical or emotional taste. It can produce technically correct audio files consistently. Whether the narration voice chosen for a given species is warm or flat or slightly too fast — that judgement is mine, every time.

**Localisation Pipeline.** Handles string bundles across six locales — English (US and GB), German, Spanish, French, Simplified Chinese. Consistent and fast. What it's bad at: idiom. It translates accurately; it doesn't know what a phrase *feels* like to a native speaker in a given context. The brand register decisions — the specific tone, the rhythm — I review every locale personally.

**GitHub Issues Manager.** Tracks issues, links commits to issue threads, ensures the tracker doesn't drift from the actual state of the code. This agent has probably saved me the most time of any of them on a daily basis — not because any individual action is hard, but because that admin overhead is a constant low-grade tax and now it just happens.

**Animal Image Generation.** Sources and produces images for the 200+ animals across the app. Fast. What it's bad at: diversity. Without explicit guidance, it defaults to certain visual conventions — the most iconic pose of an animal, the most expected angle. The images that make kids stop scrolling are the ones that break that pattern. I specify those.

**Icon Generator.** Produces UI icons and emoticons consistent with the Wild Atlas visual world. Reliable within a defined style guide. Can't improvise outside it.

**Scale and Weight Image.** Generates the size and weight comparison visuals — the ones that tell a child how an animal's height compares to their own. These are technically the hardest images to get right, because they depend on precise measurement baselines I had to codify explicitly: a "tiny kid" (ages 3–5) is 88cm/12kg; a "young kid" (ages 6–9) is 109cm/18.5kg. Without those numbers, the agent produces images that are charming and wrong.

The ninth agent — Senior Engineer — arrived May 11th. The tenth, an analytics agent that builds PostHog monitoring dashboards, arrived the morning *after* I submitted to Apple. Some lessons take longer than others.

---

## The plan-review pattern

Here's the most important thing I built that isn't in the agent definitions.

For any non-trivial task, I have one agent write an implementation plan as a markdown file. Then I hand that file to a second agent — one that has never seen the task before — and ask it to review the plan.

There hasn't been a single time when that second agent came back and said the plan was good to ship.

Not once. Every time: questions, gaps, edge cases the first agent didn't cover, assumptions that needed surfacing. The minimum iteration count for a complex feature was four bounces. The audio architecture refactor — which I'll describe in a moment — went eleven rounds before I was confident enough to start implementation.

This isn't a criticism of the agents. It's how engineers work. Good engineering review catches things. The reason senior engineers review junior engineers' plans isn't because junior engineers are careless — it's because any single perspective misses things that a fresh one catches. The agents are the same.

The failure mode I see from people who build with agents without this pattern: they take the first output as a plan and start coding. Then they discover the architectural problem at month two, when changing it costs ten times as much.

---

## The audio architecture collapse

In the first two months of building, my agents built four separate audio playback engines.

One for animal narration. One for sound effects. One for slideshow audio. One for background music.

I had asked for a centralised audio engine. I thought I was getting one. I wasn't — and I didn't notice until the capabilities grew, the engines started interfering with each other, and Wild Atlas began killing Spotify when backgrounded.

On April 29th, a commit went in: *"Restore Spotify on app background and add Sound Effects setting."*

That was a symptom, not a fix. The real problem was that I had four separate managers competing for the same audio session, with no single authority deciding who owned it at any moment. When one of them backgrounded the app, it was making session decisions in isolation from the other three.

The refactor took multiple days and eleven agent iterations — back and forth, plan reviewed by a second agent, plan revised, implementation started, implementation problem discovered, back to planning. The 3D printer analogy: you hand the AI a model, walk away, come back hoping for a clean object. Sometimes it works. Often there's a layer shifted or a support that didn't peel away cleanly.

What I should have done: specified the centralised audio architecture in an architectural brief before the first audio agent touched the code. What I did instead: described the features I wanted. Same outcome as telling a junior engineer to build "audio" without a brief — you get something that plays audio, not something that owns audio correctly.

---

## The security incidents I'm going to name plainly

There are 29 million secrets leaked on GitHub from vibe-coded apps. I added to that count. Twice.

**March 11th, 7:57 a.m.** Ten days into the project, I pasted an OpenAI API key into an agent thread so it could access image generation. The key ended up in `Info.plist`. It went into a commit. GitHub's push protection refused the push and told me why.

The commit message, which I wrote that morning: *"Remove API key from Info.plist and update access code."*

The agent had warned me not to paste keys into agent threads. It had told me to recycle the key. I didn't recycle it immediately. I was not an engineer; I'd never had to deal with secrets management before. I understood the words. I hadn't internalised the stakes. The risk was real: a rogue actor grabs the key, runs up my bill. That's on me.

**May 14th, 6:02 a.m.** Three days before App Store submission: *"Strip leaked IUCN_TOKEN from enrichment scripts; rotate."* An IUCN API token had ended up in tracked content-enrichment scripts. Quietly caught, quietly rotated.

Two incidents, same cause, three months apart: credentials being handled as configuration values rather than secrets, by someone whose prior career never required him to know the difference.

What I'd do now: establish a secrets protocol on day one. Dedicated environment variables, never inline, never in tracked files. The agent knows this convention — I just hadn't told it that it was the non-negotiable rule from the first commit forward. "The agent knows" turns out not to mean "the agent will do it without being told." That lesson runs through this whole project.

There is also something I want to say plainly: GitHub's push protection saved me on March 11th. Automated tooling caught what I didn't know to look for. If you are building with AI agents and you are not running push protection, turn it on now. It costs nothing and it has already saved at least one solo founder who didn't know what he was doing.

---

## The debugging protocol that came out of the worst day

May 12th. The day before my birthday. I had planned to ship on the 13th.

Two P0 launch-blockers appeared in the same afternoon. The first: the keyboard was dismissing on the first-launch name entry field, requiring a full app restart to recover. The second: the first-launch download screen was stuck — nothing was downloading.

The senior engineer agent was debugging the download stall by hypothesis. Plausible-sounding guesses, tried in sequence, each one requiring me to spin up a build, install on device, reproduce the bug, confirm it didn't work, document the repro steps, hand back to the agent, wait. Twenty-plus minutes of human time per iteration. The agent generates a new hypothesis in seconds.

I stopped it. *"Stop debugging blind. Let's get some data here — versus this hypothesis-based fix cycle that AI likes to get into."*

I had the agent build observability tooling first: a floating debug HUD that showed download state in real time, stdout mirroring of every download event, bootstrap phase timeouts with elapsed milliseconds. Once I had real data showing exactly where in the sequence things were stalling, the fix came quickly.

The commit that contains the observability tooling is named *"Stop debugging blind."* Verbatim from what I told the agent. I was tired enough by that point that I didn't think to soften it.

The lesson: AI agents will generate plausible hypotheses and try them in sequence without ever saying "I don't have enough information." They have no instinct to pause and gather data before guessing. You have to build that protocol yourself, explicitly, before the debugging session starts. Or you'll spend hours watching a very fast junior engineer try things at random.

The two P0 fixes landed by 5 p.m. By midnight I was shipping polka-dot backgrounds for the settings screen. At 12:22 a.m. on May 13th — technically my birthday — the commit went in: *"feat: spawn shooting star at key delight moments."* I was already asleep.

---

## The compound return I didn't expect

Here's the thing about agents that the hype gets approximately right but for the wrong reasons.

By month two, bug investigations that would have taken me hours were taking ten minutes. Not because the agents got smarter — because I got better at directing them. I knew which agent to reach for. I knew what context to give upfront to prevent the wrong assumption. I knew when to interrupt a hypothesis cycle and force data collection first. I knew when a plan needed a second agent to review it before I approved implementation.

That's compounding. Not AI compounding — *me* compounding. The agents were the instrument. I was the one getting faster at playing it.

The hype says AI agents make everything easy. That's not the right frame. The more accurate frame: AI agents make effort more productive. Which means you can pour more of yourself into a project than you ever could before — and if you're prone to pouring, you will. In the final weeks before submission, I was working 12–14 hours on the heavy days, running multiple agent threads in parallel, context-switching between audio architecture and localisation and App Store metadata and bug fixes. The agents didn't reduce the effort. They made the effort matter more, which meant I expended more of it.

Josh verbatim, from somewhere in that period: *"It's so awesome to have this power under your fingertips, but it does take a hell of a lot of energy to wield it."*

---

## What I'd do differently

**Define the agents at the start of the project, not nine weeks in.** The formal agent library existing for a single week before App Store submission tells me everything about what I left on the table by not having it earlier.

**Establish the architectural brief before any implementation starts.** The audio engine would have been different if someone had asked, on day one, "how do you want to handle audio session ownership across narration, sound effects, slideshow, and music?" Nobody asked. The agent built the feature, not the architecture.

**Security protocol on day one.** No credentials in agent threads. No credentials in tracked files. Rotate immediately when something gets through. It will get through.

---

## The thread that runs through all of this

Here it is, said once, because I think it earns saying:

AI agents are powerful when pointed precisely. They are blind to everything else.

They will write excellent code for the thing you describe. They will not notice the platform strategy question you didn't know to ask. They will not notice the credentials in the file they're editing. They will not notice that four independent audio engines are about to fight each other. They will generate twenty plausible hypotheses before they think to instrument the thing.

This is not a criticism of the technology. It's a description of the job. Your job, building with these tools, is to be the smoke detector — to notice the things that nobody told the agents to notice. The agents do the work. You watch the edges.

I am not sure that job becomes easier with experience. I think it becomes more informed — you learn which edges to watch, which gaps to anticipate, which hypotheses to interrupt. But the vigilance itself doesn't get lighter. It stays.

---

*Wild Atlas launched May 26, 2026. Next piece in this series: marketing a kids app with no marketing team.*
