---
title: "I Wrote Encyclopedic Animal Content Without Being a Biologist"
series: "Building Wild Atlas"
piece: 6
target_date: 2026-06-30
status: draft
audience: Knowledge workers, educators, content creators building informational content at scale
length_target: 2000–2800 words
---

# I Wrote Encyclopedic Animal Content Without Being a Biologist

Wild Atlas launched with 200-plus animals across twelve packs, in five languages, age-banded for two development ranges, with IUCN conservation status integrated throughout. I wrote all of it. And the thing I knew about animal biology coming into this was whatever a childhood spent on wildlife documentary shoots had given me.

That's not nothing. But it's not a biology degree either.

Here's how the content workflow actually operated — where AI made it possible, where the verification had to be mine, and where I drew the line that I'm not willing to move.

---

## What 200-plus animals actually means

The number is a shorthand. What it represents is something like this, per animal:

- A summary paragraph calibrated to two age bands
- Three to five fun facts per age band
- A "did you know" section
- Sound description (what the animal actually sounds like, in language a child can visualise)
- Fun words — vocabulary the app introduces with the animal
- Safety summary where relevant
- Size and weight comparisons with real-world references, different for each age band
- Conservation status with plain-language explanation
- All of the above in five locales, with measurement units varying by region

Multiply that out and "200 animals" becomes several hundred thousand words of content, in a variety of formats, required to be accurate, age-appropriate, and engaging across a seven-year developmental span.

No human writes that alone. I didn't try. But "AI generates the content" is not the end of that sentence — it's the beginning of a longer one about what the workflow actually requires from the human in the loop.

---

## The research workflow

I started with sources, not prompts.

For every animal, the authoritative reference was the IUCN Red List — the International Union for Conservation of Nature's database of species assessments. It's the closest thing to a definitive source on conservation status, habitat range, population trends, and basic biology for most species. The IUCN integration in Wild Atlas isn't an afterthought. The conservation status — endangered, threatened, least concern, extinct in the wild — is built into every animal page because it was built into the content pipeline from day one.

Beyond IUCN, I used wildlife databases, scientific literature summaries, and domain-specific sources where they existed. The prompting discipline: source first, then content. Give the agent the facts as established by a primary source, then ask it to render those facts in the required format for the required audience. Don't ask the agent to generate facts and then verify them — the verification workload is much higher when you're checking from scratch versus checking against a known reference.

This matters more than it sounds. An AI model generating animal facts from training data will produce plausible, fluent, often-accurate content that is occasionally confidently wrong in ways that are hard to spot if you don't already know the answer. The size of a King Cobra. The gestation period of an elephant. The range of a snow leopard. Each of these facts is either right or wrong, and the consequence of getting it wrong in a children's educational app is that a child learns a wrong thing and believes it.

The source-first discipline meant the agent was translating and formatting, not inventing. That's a different category of risk.

---

## Age-banding: the same fact, twice

Wild Atlas covers ages 3 to 9. A three-year-old and a nine-year-old share very little in terms of what they can process, what language reaches them, and what comparisons make sense.

The app addresses this through two age bands: "tiny explorer" (roughly 3 to 5) and "junior explorer" (roughly 6 to 9). Every piece of content exists in both versions.

For the older band, a fact might read: *"The blue whale can grow up to 30 metres long — that's about as long as three school buses parked end to end."*

For the younger band: *"The blue whale is as long as a really, really big swimming pool."*

The facts are the same. The reference points are different — chosen because they map to what a child in each band actually knows from lived experience. A three-year-old knows swimming pools. A seven-year-old knows school buses.

This required me to codify something I'd been doing intuitively: what are the reference objects that work for each age band? For size comparisons, I landed on precise baselines. A tiny explorer is 88cm tall and weighs 12kg. A junior explorer is 109cm tall and weighs 18.5kg. Every size comparison in the app is checked against those baselines — not "is this comparison correct," but "is this comparison *meaningful* to a child at this size."

The agents, given those baselines, could apply them consistently. Without the baselines, they produced comparisons that were technically accurate and developmentally meaningless. "As long as a car" means something different to a three-year-old who has never driven than to a seven-year-old who has been on long road trips.

---

## What gets verified, what gets flagged, what gets cut

The fact-check workflow had three tiers.

**Tier one: primary source confirmation.** IUCN conservation status, size/weight ranges, geographic distribution, taxonomic classification. If I couldn't confirm it against a primary source, it didn't go into the app.

**Tier two: plausibility review.** Facts that are harder to source directly but that I could verify by triangulation — multiple secondary sources agreeing on the same figure, scientific literature summary confirming the mechanism. These went in with a flag in my notes that they were triangulated rather than primary-sourced.

**Tier three: flagged and cut.** Interesting claims I couldn't confirm. The agent, told that blue whales communicate at frequencies too low for humans to hear, might then generate a claim about the specific frequency range or the distance over which the sound travels. If I couldn't source the specific figure, the specific claim came out. The general fact stayed; the specific number went.

The principle I operated from: AI can draft; AI cannot vouch. Every fact that reaches a child through this app has been read by a human who decided it was accurate enough to teach.

That's not a perfect standard — I'm not a biologist, and there are almost certainly things in the app that a specialist would correct. But it's the only honest standard I could apply with the resources I had. I'd rather publish fewer confident facts than more questionable ones.

---

## The King Cobra and the 4 a.m. commit

On March 19th, 2026, at 4:29 in the morning, I started a commit called *"King Cobra Phase 1 editorial cleanup: fix narration-facing strings."*

By 5:57 a.m. I'd committed three times on the same snake.

The King Cobra was the first animal that surfaced what became a systematic problem: the data layer and the narration layer were saying different things about the same animal. The data model had one measurement; the narration string had another. They'd been written by different agents at different times, neither of which had been told to check what the other had produced.

After three commits and almost two hours on one snake, the content was consistent: 4.5 metres long, 9 kilograms, measurements in both metric and imperial, the fact accurately represented in the narration.

That afternoon, starting at 5:53 p.m. and running until midnight, I did a full editorial pass across 216 animals. 1,210 strings fixed. Name repetition removed — animals referred to by pronoun after the first mention, not by name in every sentence. Measurement consistency enforced across all locales. Imperial converted correctly for en-US.

That was the night I stopped thinking of the content pipeline as a generation problem and started thinking of it as a quality-control problem. The generation was fast. The consistency enforcement was the work.

---

## Five languages, six locales, one voice

Wild Atlas ships in English (US and UK), German, Spanish, French, and Simplified Chinese. That's five languages, six locale variations — the US and UK editions differ primarily on measurement units (imperial for US, metric for everywhere else) and some spelling conventions.

The localisation pipeline for content is a different beast from the localisation pipeline for UI strings. UI strings are short and relatively stable. Animal content is long, has a specific narrative voice, and needs to feel like it was written in the target language, not translated from English.

The agents handled translation with good accuracy and inconsistent idiom. German animal content reads correctly. Whether it reads *warmly* — whether it sounds like a knowledgeable friend talking to a child rather than a reference text translated into German — required human review by someone who reads German well.

I don't read German. I relied on review by [CONFIRM: name of German-speaking reviewer, if any, or acknowledge this gap directly]. The same gap exists in Spanish, French, and Simplified Chinese. I mitigated it by using detailed brand-voice documentation for each locale and by reviewing back-translations, but this is a known limitation of the Wild Atlas localisation. A native-speaker editorial review at launch would have improved it. It's on the roadmap.

---

## The Mythical Menagerie: where the content workflow bent

The Mythical Menagerie is the hidden pack — eighteen creatures from world folklore, accessible through an easter egg. Zuzu had asked for a werewolf. The original list included Bigfoot, Werewolf, Kraken, and Loch Ness Monster.

When she played the pack, she told me the werewolf scared her. The Loch Ness Monster scared her too.

I swapped them. Bigfoot, Werewolf, and Kraken became Baku, Kirin, and Selkie. The Loch Ness Monster became the Simurgh. The replacements are culturally specific and less Western-centric — a Japanese nightmare-eater, a Chinese chimeric creature, a Celtic seal-person, a Persian mythical bird. All of them friendly-looking, with lore that children find delightful rather than frightening.

The content for mythical creatures is harder to source than the content for real animals. IUCN isn't cataloguing Kirin. What you have is folklore, cultural context, and the need to describe these creatures accurately within their cultural origins while making them accessible to a five-year-old in any of five languages.

The agents were helpful here — they had good depth on world folklore — but required more human checking, because "accurate" for a mythical creature means "consistent with the cultural tradition," not "consistent with observable biology." Getting that right required reading, not just prompting.

---

## The line I drew, and why I won't move it

Here's the thing I want to say clearly, because it's the one that matters most:

AI makes content generation fast. It does not make content trustworthy. Those are different things, and in an educational app for children, the gap between them is not acceptable to paper over.

I am not a biologist. I am not a folklorist. I am not a native speaker of German, Spanish, French, or Simplified Chinese. Wild Atlas contains 200-plus animals and 18 mythical creatures and several hundred thousand words of content, and every single one of those facts was touched by a human — me — who made a judgement call about whether to keep it, flag it, or cut it.

That process is imperfect. I've made mistakes that I haven't found yet. But the discipline of source-first prompting, the fact-check tiers, the "AI can draft; AI cannot vouch" rule — those aren't just workflow choices. They're the answer to the question every parent should ask before handing an educational app to their child: *did someone check this?*

I did. Imperfectly, but deliberately.

---

## What I'd do differently

Build the fact-checking workflow earlier. I spent the first weeks of content production generating and iterating without a systematic quality-control layer. The King Cobra commit at 4:29 a.m. was the moment the system forced me to build one. I should have built it first.

The other thing: native-speaker review, budgeted from the start. The localisation pipeline is good at linguistic accuracy. It cannot tell me whether the German content sounds like it belongs in a German household. That gap is real, and it requires a human with a native ear.

---

## On what AI can and can't do

I've written five pieces in this series about building Wild Atlas with AI agents. Every piece has described a different domain where the same pattern appeared: the agents were remarkably capable within the scope of a well-defined task. They were blind to everything outside it.

For content: they could generate, translate, format, and apply style guides consistently at scale. They couldn't verify against primary sources — that required me to bring the sources. They couldn't judge whether a comparison was developmentally meaningful to a three-year-old — that required me to have spent time with three-year-olds. They couldn't tell me that the werewolf would frighten my daughter — that required Zuzu.

This is not a limitation unique to content generation. It's the same pattern as the audio architecture that fragmented into four engines, the platform decision that got made by default, the API key that ended up in a commit. The agents are excellent tools with a defined aperture. Everything outside that aperture is yours to manage.

Which is why I think the most important skill in building with AI — more than knowing which model to use, more than prompt engineering, more than any specific technical knowledge — is staying awake to what nobody told the agent to look for.

The agents work in the light you point at them. The rest is dark. Your job is to know where the dark is.

---

*Wild Atlas launched May 26, 2026. This is the final piece in the Building Wild Atlas series. Thank you for reading.*
