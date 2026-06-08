// Wild Atlas Landing Page — Translation Data
// Supported: English, German, Spanish, French, Simplified Chinese (zh-Hans)
//
// IMPORTANT — keep this list in sync with the iOS app's `.lproj` directories.
// Run `scripts/check-locale-coverage.sh` to detect drift between app and website.
// Every locale block below MUST contain every key present in `en` (the default).
// On boot, i18n.js logs any missing keys to console; gaps fall back to `en`.

window.WILD_ATLAS_I18N = {
  supportedLocales: ['en', 'de', 'es', 'fr', 'zh'],
  defaultLocale: 'en',
  languageNames: {
    en: 'English',
    de: 'Deutsch',
    es: 'Español',
    fr: 'Français',
    zh: '中文'
  },

  translations: {

    // ────────────────────────────────────────
    //  ENGLISH
    // ────────────────────────────────────────
    en: {
      // Meta
      'meta.title': 'Wild Atlas \u2014 Raise Explorers, Not Scrollers',
      'meta.description': 'Raise explorers, not scrollers. An animal learning app for kids 3\u20139. No ads, no algorithms, no reading required. 12 packs, 5 languages, 3 free to start.',
      'meta.og.description': 'Finally, screen time you\u2019ll feel proud of. An interactive animal adventure for curious kids 3\u20139 \u2014 built for wonder, not engagement metrics.',

      // Gate
      'gate.title': 'Wild Atlas',
      'gate.subtitle': 'This site is currently in preview mode.',
      'gate.placeholder': 'Enter access code',
      'gate.button': 'Enter',
      'gate.error': 'Incorrect code. Please try again.',

      // Nav
      'nav.features': 'Features',
      'nav.games': 'Games',
      'nav.packs': 'Animal Packs',
      'nav.parents': 'For Parents',
      'nav.cta': 'Be First',

      // Hero
      'hero.title': 'Discover the Animal Kingdom', // legacy key, kept for safety
      'hero.eyebrow': 'Discover the Animal Kingdom',
      'hero.tagline': 'Raise explorers,<br>not scrollers.',
      'hero.subtitle': 'Finally, screen time you\u2019ll feel <strong>proud of</strong>. An interactive animal adventure for curious kids ages 3\u20139.',
      'hero.little': 'Little Explorers',
      'hero.little.ages': 'Ages Under 5',
      'hero.young': 'Young Explorers',
      'hero.young.ages': 'Ages 5 and Up',

      // Trust strip
      'trust.noads': 'No ads',
      'trust.noalgo': 'No algorithms',
      'trust.noreading': 'No reading required',
      'trust.privacy': 'Privacy-first & COPPA-compliant',

      // Languages section
      'lang.title': 'Available in 5 Languages',
      'lang.desc': 'Wild Atlas is fully localized in English, German, Spanish, French, and Simplified Chinese — including all text <em>and</em> audio narration. Every animal fact, fun word, and quiz is read aloud in your child’s language.',
      'lang.point1': 'Full audio narration in every supported language',
      'lang.point2': 'All text, facts, and quizzes translated',
      'lang.point3': 'Perfect for bilingual families — or kids learning a new language',

      // Key Features
      'features.title': 'What Makes Wild Atlas Special',
      'features.quiz.title': 'Quizzes Kids Love',
      'features.quiz.desc': 'Two quiz modes tailored by age \u2014 Little Explorers get picture-based questions, Young Explorers tackle reading challenges. Kids can\u2019t get enough!',
      'features.quiz.little': 'Ages Under 5',
      'features.quiz.young': 'Ages 5 and Up',
      'features.tts.title': 'Tap to Hear Anything Read Aloud',
      'features.tts.desc': 'Kids can tap any text and a warm, friendly character reads it aloud. Perfect for independent exploration \u2014 parents can safely hand over the device knowing their child can navigate everything on their own.',
      'features.tts.point1': 'No reading skills needed',
      'features.tts.point2': 'Safe solo exploration',
      'features.tts.point3': 'Parent-friendly design',

      // More Features
      'discover.title': 'So Much to Discover',
      'discover.facts.title': 'Fun Facts',
      'discover.facts.desc': 'Fascinating facts about every animal, narrated in a warm friendly voice',
      'discover.videos.title': 'Wild Watch',
      'discover.videos.desc': 'Narrated animal videos that play themselves \u2014 wonder, hands-free.',
      'discover.map.title': 'World Explorer',
      'discover.map.desc': 'See where animals live on a colorful interactive map',
      'discover.size.title': 'Size Comparison',
      'discover.size.desc': 'How big is a Great White compared to you?',
      'discover.badges.title': 'Discovery Badges',
      'discover.badges.desc': 'Earn gold, silver, and bronze badges as you explore',
      'discover.achievements.title': 'Achievements',
      'discover.achievements.desc': 'Every animal met, every world visited — exploration encouraged at every step.',

      // Games
      'games.title': 'Play Built for Curious Minds',
      'games.subtitle': 'Four games, four ways to grow \u2014 memory, geography, observation, and spatial smarts. Built into play that doesn\u2019t feel like learning.',
      'games.memory.title': 'Memory Match',
      'games.memory.desc': 'Flip and find the pairs. Pure memory training, dressed up as a game.',
      'games.puzzle.title': 'Puppy Puzzle',
      'games.puzzle.desc': 'Snap the pieces. Spatial reasoning that builds without lessons.',
      'games.whos.title': 'Who\u2019s Who',
      'games.whos.desc': 'Spot what makes each animal one of a kind. Observation, gamified.',
      'games.habitat.title': 'Habitat Hop',
      'games.habitat.desc': 'Hop animals home \u2014 savannah, arctic, forest, ocean. Geography through play.',

      // Packs
      'packs.title': '12 Animal Worlds to Explore',
      'packs.subtitle': '3 always-free packs, plus one premium pack your child picks — free. Unlock more at $3.99 each, or get everything with the Explorer Pass at $19.99.',
      'packs.free': 'Free',
      'packs.more': 'More packs coming soon!',

      // Animals
      'animals.title': '150+ Beautiful Animals',

      // Animal strip names (DRAFT — needs native review for non-EN)
      'showcase.scale.point1': 'Weight and size compared to kids they can relate to',
      'showcase.scale.point2': 'Life-size scale with Little Explorer characters',
      'showcase.scale.point3': 'Height, length, and weight for every animal',
      'showcase.map.point1': 'Interactive continent-by-continent exploration',
      'showcase.map.point2': 'Learn animal habitats and geography together',
      'showcase.map.point3': 'Colorful, kid-friendly map design',
      'showcase.scale.title': 'How Big? How Heavy?',
      'showcase.scale.desc': 'Kids discover how animals measure up against themselves! How many five-year-olds does it take to weigh as much as a gorilla? Stand next to a Great White Shark and see just how big it really is!',
      'showcase.map.title': 'Explore the Whole World',
      'showcase.map.desc': 'A beautiful, colorful world map shows kids exactly where each animal lives. Tap a continent and discover the incredible creatures that call it home.',
      'packs.happy_hounds': 'Happy Hounds',
      'packs.cool_cats': 'Cool Cats',
      'packs.cozy_critters': 'Cozy Critters',
      'packs.feathered_friends': 'Feathered Friends',
      'packs.safari_stars': 'Safari Stars',
      'packs.ocean_creatures': 'Ocean Creatures',
      'packs.dino_roars': 'Dino Roars!',
      'packs.wild_americas': 'Wild Americas',
      'packs.rainforest_explorers': 'Rainforest Explorers',
      'packs.farm_friends': 'Farm Friends',
      'packs.reptile_world': 'Reptile World',
      'packs.planet_pioneers': 'Planet Pioneers',
      'animals.golden_retriever': 'Golden Retriever',
      'animals.lion': 'Lion',
      'animals.snow_leopard': 'Snow Leopard',
      'animals.toucan': 'Toucan',
      'animals.great_white': 'Great White',
      'animals.axolotl': 'Axolotl',
      'animals.tree_frog': 'Tree Frog',

      // Parents
      'parents.title': 'Designed for Your Family',
      'parents.point0': 'Two ways to explore — <strong>narration on</strong> for independent play, or <strong>turn it off</strong> to read along together',
      'parents.point1': 'Tap-to-read narration means <strong>no reading skills needed</strong>',
      'parents.point2': 'Age-appropriate content for <strong>Little Explorers (3\u20134)</strong> and <strong>Young Explorers (5\u20139)</strong>',
      'parents.point3': 'Built so kids can <strong>explore safely on their own</strong>',
      'parents.point4': '<strong>Available in 5 languages</strong> — learn in your child’s native language, or use it to reinforce a language they’re studying.',
      'parents.point5': '<strong>No ads, no external links, no social features</strong>',

      // Signup
      'signup.title': 'An Offer for Early Explorers',
      'signup.desc': "Sign up and we’ll send you an <strong>exclusive welcome offer</strong>. No newsletter — just our thank-you for being early.",
      'signup.placeholder': 'Enter your email',
      'signup.button': 'Sign Me Up',
      'signup.success': 'You\u2019re in! Watch your inbox \u2014 welcome offer on the way.',
      'signup.error': 'Something went wrong. Please try again!',

      // Footer
      'footer.privacy': 'Privacy Policy',
      'footer.contact': 'Contact',
      'footer.about': 'About',
      'footer.terms': 'Terms of Service',
      'about.eyebrow': 'Behind the app',
      'about.title': 'Why we built Wild Atlas',
      'about.body': 'Hey — I\'m Josh. Wild Atlas began as a thing I was making for my own kids, Zuzu and Lurian. The full story is a letter worth its own page.',
      'about.signoff': '— Josh',
      'about.cta': 'Read the founder letter →',
      'about.letter': '<p>I come from a conservation documentary filmmaking family. Some of my most indelible memories are out in the veld in South Africa with my mom and dad, learning about animals from the best. My wife Angelica and I have two kids of our own now: Zuzu, who’s five, and Lurian, who’s two. And they LOVE animals.</p><p>So on long flights, road trips, or rainy days when we wanted to give them some screen time, we wanted something we could feel good about handing them. Not algorithmic YouTube. Not junk-food cartoons. Not addictive games designed for adult brains. Something they could explore on their own and come out of a little more curious than they went in.</p><p>I couldn’t find it. So I started building it.</p><p>The first thing I figured out: for kids this age, the app has to talk to them. Many can’t read yet, and the ones who can shouldn’t have to work for it. So every fact, every quiz, every fun word is read aloud in a warm voice they can control. That worked, so I shaped the content around Zuzu’s actual questions — the where, the how big, the is-it-dangerous — in a voice and language kids could relate to.</p><p>Zuzu wanted more, so I added quizzes. She played them over and over, so I added four games — Memory Match, Puppy Puzzle, Who’s Who, and Habitat Hop — each one a different way to grow. Math and reading games are coming next, because that’s what Zuzu’s learning now.</p><p>Languages came in because Zuzu’s learning German and Spanish, and our friends’ kids are learning Spanish, Mandarin, and French. I wanted the animal stories narrated in a language they’re learning — to reinforce what they’re already picking up. And to make the app feel like home for kids who are native speakers.</p><p>Finally, after all that, I felt a little sparkly fairy dust was needed. So I added a soundscape and a fun soundtrack. Little animations across the app. A few hidden treasures kids will find if they look hard enough. And an achievement system, because my kids LOVE collecting things and seeing progress.</p><p>If you’ve got a curious one of your own, I hope Wild Atlas makes the long flights, the rainy days, and the just-need-five-minutes moments a little bit better. And maybe you’ll learn something new along the way too. (I do, ALL the time.)</p>',
      'about.metadesc': 'Why we built Wild Atlas. A letter from founder Josh Vincent about screen time, curiosity, and raising explorers.',

      // Hero platform line + brand pillars
      'hero.platforms': 'Available on iPhone and iPad starting June 2026',
      'brand.eyebrow': 'What we stand for',
      'brand.title': 'Built on beliefs, not features',
      'brand.pillar1.title': 'Wonder over dopamine',
      'brand.pillar1.desc': 'Built to leave your child more curious than it found them — not more glued to the screen.',
      'brand.pillar2.title': 'Child-led, not algorithm-fed',
      'brand.pillar2.desc': 'No recommendation engine. No autoplay loop. Just a curious kid choosing what to explore next.',
      'brand.pillar3.title': 'Education without the classroom',
      'brand.pillar3.desc': 'Real facts, narrated like a documentary, organized around the questions kids actually ask. No drills, no grades, no lessons in disguise.',
      'brand.pillar4.title': 'Pride, not guilt',
      'brand.pillar4.desc': 'Most kids’ apps are built against parents. This one is built with them — so you can hand it over and feel good about it.',
      'footer.copy': '\u00a9 2026 Wild Atlas. All rights reserved.',

      // Legal pages
      'legal.eyebrow': 'Legal',
      'legal.backhome': 'Back to Wild Atlas',
      'legal.disclaimer': '',
      'legal.privacy.title': 'Privacy Policy',
      'legal.privacy.metadesc': 'Wild Atlas Privacy Policy. How we collect, use, and protect your information.',
      'legal.terms.title': 'Terms of Service',
      'legal.terms.metadesc': 'Wild Atlas Terms of Service. Your agreement when using the Wild Atlas app.',

      // Support page
      'footer.support': 'Support',
      'support.eyebrow': 'Help',
      'support.title': 'Support',
      'support.metadesc': 'Support for Wild Atlas. Contact us, FAQs, and help for parents using the Wild Atlas iOS app.',

      // Age Suitability page
      'footer.agesuitability': 'Age Suitability',
      'agesuitability.eyebrow': 'For families',
      'agesuitability.title': 'Age Suitability',
      'agesuitability.metadesc': 'Wild Atlas age suitability. Designed for ages 3 to 12. What\'s in the app, what isn\'t, and how we think about content for kids.',

      // FAQ (structured data)
      'faq.q1': 'What age range is Wild Atlas designed for?',
      'faq.a1': 'Wild Atlas is designed for children ages 3 and up, with two age modes: Little Explorers (ages under 5) featuring picture-based quizzes, and Young Explorers (ages 5 and up) with reading challenges.',
      'faq.q2': 'Is Wild Atlas free?',
      'faq.a2': 'Wild Atlas is free to download and includes 3 free animal packs (Happy Hounds, Cool Cats, and Cozy Critters). Additional packs are $3.99 each, or you can unlock everything — including future packs — with the Explorer Pass for $19.99.',
      'faq.q3': 'Can my child use Wild Atlas independently without reading?',
      'faq.a3': 'Yes! Wild Atlas features tap-to-read text-to-speech narration. Kids can tap any text and a warm, friendly character reads it aloud, making it perfect for independent exploration without any reading skills required.',
      'faq.q4': 'Is Wild Atlas safe for children?',
      'faq.a4': 'Absolutely. Wild Atlas has no ads, no external links, and no social features. It is designed so parents can safely hand over the device knowing their child can navigate everything on their own.'
    },

    // ────────────────────────────────────────
    //  GERMAN (Deutsch)
    // ────────────────────────────────────────
    de: {
      'meta.title': 'Wild Atlas \u2014 Entdecker erziehen, keine Scroller',
      'meta.description': 'Entdecker erziehen, keine Scroller. Eine Tier-Lern-App f\u00fcr Kinder von 3 bis 9. Keine Werbung, keine Algorithmen, kein Lesen n\u00f6tig. 12 Pakete, 5 Sprachen, 3 gratis.',
      'meta.og.description': 'Endlich Bildschirmzeit, auf die du stolz sein kannst. Ein interaktives Tierabenteuer f\u00fcr neugierige Kinder von 3 bis 9 Jahren.',

      'gate.title': 'Wild Atlas',
      'gate.subtitle': 'Diese Seite befindet sich derzeit im Vorschaumodus.',
      'gate.placeholder': 'Zugangscode eingeben',
      'gate.button': 'Weiter',
      'gate.error': 'Falscher Code. Bitte versuche es erneut.',

      'nav.features': 'Funktionen',
      'nav.games': 'Spiele',
      'nav.packs': 'Tierpakete',
      'nav.parents': 'F\u00fcr Eltern',
      'nav.cta': 'Sei zuerst',

      'hero.title': 'Entdecke das Tierreich',
      'hero.eyebrow': 'Entdecke das Tierreich',
      'hero.tagline': 'Entdecker erziehen,<br>keine Scroller.',
      'hero.subtitle': 'Endlich Bildschirmzeit, auf die du <strong>stolz sein</strong> kannst. Ein interaktives Tierabenteuer f\u00fcr neugierige Kinder von 3 bis 9 Jahren.',
      'hero.little': 'Kleine Entdecker',
      'hero.little.ages': '3\u20134 Jahre',
      'hero.young': 'Junge Entdecker',
      'hero.young.ages': '5\u20139 Jahre',

      // Trust strip
      'trust.noads': 'Keine Werbung',
      'trust.noalgo': 'Keine Algorithmen',
      'trust.noreading': 'Kein Lesen n\u00f6tig',
      'trust.privacy': 'Datenschutz & COPPA-konform',

      // Languages section
      'lang.title': 'In 5 Sprachen verfügbar',
      'lang.desc': 'Wild Atlas ist vollständig lokalisiert in Englisch, Deutsch, Spanisch, Französisch und vereinfachtem Chinesisch — einschließlich aller Texte <em>und</em> Tonaufnahmen. Jeder Tierfakt, jedes lustige Wort und jedes Quiz wird in der Sprache deines Kindes vorgelesen.',
      'lang.point1': 'Vollständige Vertonung in allen unterstützten Sprachen',
      'lang.point2': 'Alle Texte, Fakten und Quiz übersetzt',
      'lang.point3': 'Perfekt für mehrsprachige Familien — oder Kinder, die eine neue Sprache lernen',

      'features.title': 'Was Wild Atlas besonders macht',
      'features.quiz.title': 'Quiz, das Kinder lieben',
      'features.quiz.desc': 'Zwei Quizmodi nach Alter \u2014 Kleine Entdecker bekommen Bildfragen, Junge Entdecker meistern Leseaufgaben. Kinder k\u00f6nnen nicht genug bekommen!',
      'features.quiz.little': '3\u20134 Jahre',
      'features.quiz.young': '5\u20139 Jahre',
      'features.tts.title': 'Tippe, um alles vorgelesen zu bekommen',
      'features.tts.desc': 'Kinder k\u00f6nnen auf jeden Text tippen und eine warme, freundliche Stimme liest ihn vor. Perfekt zum eigenst\u00e4ndigen Entdecken \u2014 Eltern k\u00f6nnen das Ger\u00e4t beruhigt \u00fcbergeben.',
      'features.tts.point1': 'Keine Lesekenntnisse n\u00f6tig',
      'features.tts.point2': 'Sicheres Entdecken',
      'features.tts.point3': 'Elternfreundliches Design',

      'discover.title': 'So viel zu entdecken',
      'discover.facts.title': 'Lustige Fakten',
      'discover.facts.desc': 'Faszinierende Fakten \u00fcber jedes Tier, vorgelesen mit einer warmen Stimme',
      'discover.videos.title': 'Wild Watch',
      'discover.videos.desc': 'Vertonte Tier-Videos, die sich selbst abspielen \u2014 Staunen ohne Bedienen.',
      'discover.map.title': 'Weltentdecker',
      'discover.map.desc': 'Sieh, wo Tiere auf einer bunten interaktiven Karte leben',
      'discover.size.title': 'Gr\u00f6\u00dfenvergleich',
      'discover.size.desc': 'Wie gro\u00df ist ein Wei\u00dfer Hai im Vergleich zu dir?',
      'discover.badges.title': 'Entdecker-Abzeichen',
      'discover.badges.desc': 'Verdiene Gold-, Silber- und Bronze-Abzeichen beim Entdecken',
      'discover.achievements.title': 'Erfolge',
      'discover.achievements.desc': 'Jedes getroffene Tier, jede besuchte Welt — Entdecken bei jedem Schritt belohnt.',

      // Games
      'games.title': 'Spielen f\u00fcr neugierige K\u00f6pfe',
      'games.subtitle': 'Vier Spiele, vier Wege zum Wachsen \u2014 Ged\u00e4chtnis, Geografie, Beobachtung und r\u00e4umliches Denken. Spiel, das sich nicht wie Lernen anf\u00fchlt.',
      'games.memory.title': 'Memory Match',
      'games.memory.desc': 'Karten umdrehen und Paare finden. Reines Ged\u00e4chtnistraining, als Spiel verpackt.',
      'games.puzzle.title': 'Welpen-Puzzle',
      'games.puzzle.desc': 'Teile zusammenf\u00fcgen. R\u00e4umliches Denken, ohne Unterricht.',
      'games.whos.title': 'Wer ist wer?',
      'games.whos.desc': 'Erkenne, was jedes Tier einzigartig macht. Beobachten als Spiel.',
      'games.habitat.title': 'Lebensraum-H\u00fcpfer',
      'games.habitat.desc': 'Bring Tiere nach Hause \u2014 Savanne, Arktis, Wald, Ozean. Geografie spielerisch lernen.',

      'packs.title': '12 Tierwelten zum Entdecken',
      'packs.subtitle': '3 dauerhaft kostenlose Packs, plus ein Premium-Pack nach Wahl — kostenlos. Weitere für je 3,99 €, oder alles mit dem Explorer Pass für 22,99 €.',
      'packs.free': 'Gratis',
      'packs.more': 'Weitere Pakete folgen bald!',

      'animals.title': '\u00dcber 150 wundersch\u00f6ne Tiere',

      // Animal strip names (DRAFT — needs native review for non-EN)
      'showcase.scale.point1': 'Gewicht und Größe verglichen mit Kindern, die sie kennen',
      'showcase.scale.point2': 'Lebensgroßer Maßstab mit Kleine-Entdecker-Charakteren',
      'showcase.scale.point3': 'Höhe, Länge und Gewicht für jedes Tier',
      'showcase.map.point1': 'Interaktive Erkundung Kontinent für Kontinent',
      'showcase.map.point2': 'Tier-Lebensräume und Geografie zusammen lernen',
      'showcase.map.point3': 'Bunte, kindgerechte Kartengestaltung',
      'showcase.scale.title': 'Wie groß? Wie schwer?',
      'showcase.scale.desc': 'Kinder entdecken, wie Tiere im Vergleich zu ihnen selbst sind! Wie viele Fünfjährige wiegen so viel wie ein Gorilla? Stell dich neben einen Weißen Hai und sieh, wie groß er wirklich ist!',
      'showcase.map.title': 'Entdecke die ganze Welt',
      'showcase.map.desc': 'Eine schöne, bunte Weltkarte zeigt Kindern genau, wo jedes Tier lebt. Tippe auf einen Kontinent und entdecke die unglaublichen Kreaturen, die dort zu Hause sind.',
      'packs.happy_hounds': 'Frohe Hunde',
      'packs.cool_cats': 'Coole Katzen',
      'packs.cozy_critters': 'Gemütliche Tierchen',
      'packs.feathered_friends': 'Gefiederte Freunde',
      'packs.safari_stars': 'Safari-Stars',
      'packs.ocean_creatures': 'Meereskreaturen',
      'packs.dino_roars': 'Dino-Brüller!',
      'packs.wild_americas': 'Wildes Amerika',
      'packs.rainforest_explorers': 'Regenwald-Entdecker',
      'packs.farm_friends': 'Bauernhof-Freunde',
      'packs.reptile_world': 'Reptilienwelt',
      'packs.planet_pioneers': 'Planeten-Pioniere',
      'animals.golden_retriever': 'Golden Retriever',
      'animals.lion': 'Löwe',
      'animals.snow_leopard': 'Schneeleopard',
      'animals.toucan': 'Tukan',
      'animals.great_white': 'Weißer Hai',
      'animals.axolotl': 'Axolotl',
      'animals.tree_frog': 'Laubfrosch',

      'parents.title': 'F\u00fcr eure ganze Familie gemacht',
      'parents.point0': 'Zwei Spielmodi \u2014 <strong>Vorlesen an</strong> f\u00fcrs eigenst\u00e4ndige Entdecken oder <strong>ausschalten</strong> zum gemeinsamen Lesen',
      'parents.point1': 'Vorlesefunktion bedeutet <strong>keine Lesekenntnisse n\u00f6tig</strong>',
      'parents.point2': 'Altersgerechte Inhalte f\u00fcr <strong>Kleine Entdecker (3\u20134)</strong> und <strong>Junge Entdecker (5\u20139)</strong>',
      'parents.point3': 'So gebaut, dass Kinder <strong>sicher alleine entdecken k\u00f6nnen</strong>',
      'parents.point4': '<strong>In 5 Sprachen verf\u00fcgbar</strong> \u2014 lerne in der Muttersprache deines Kindes oder festige eine Sprache, die es gerade lernt.',
      'parents.point5': '<strong>Keine Werbung, keine externen Links, keine sozialen Funktionen</strong>',

      'signup.title': 'Ein Angebot für frühe Entdecker',
      'signup.desc': 'Trage dich ein und erhalte ein <strong>exklusives Willkommensangebot</strong>. Kein Newsletter — nur ein Dankeschön fürs frühe Dabeisein.',
      'signup.placeholder': 'E-Mail eingeben',
      'signup.button': 'Eintragen',
      'signup.success': 'Du bist dabei! Schau in dein Postfach \u2014 dein Willkommensangebot ist unterwegs.',
      'signup.error': 'Etwas ist schiefgelaufen. Bitte versuche es erneut!',

      'footer.privacy': 'Datenschutz',
      'footer.contact': 'Kontakt',
      'footer.about': '\u00dcber uns',
      'footer.terms': 'Nutzungsbedingungen',
      'about.eyebrow': 'Hinter der App',
      'about.title': 'Warum wir Wild Atlas gemacht haben',
      'about.body': 'Hey — ich bin Josh. Wild Atlas hat als etwas angefangen, das ich für meine eigenen Kinder Zuzu und Lurian gemacht habe. Die ganze Geschichte verdient eine eigene Seite.',
      'about.signoff': '— Josh',
      'about.cta': 'Brief des Gründers lesen →',
      'about.letter': '<p><em>Der Brief unseres Gründers ist derzeit nur auf Englisch verfügbar. Eine Übersetzung folgt in Kürze.</em></p>',
      'about.metadesc': 'Warum wir Wild Atlas gemacht haben. Ein Brief von Gründer Josh Vincent über Bildschirmzeit, Neugier und das Erziehen von Entdeckern.',

      // Hero platform line + brand pillars
      'hero.platforms': 'Verfügbar für iPhone und iPad ab Juni 2026',
      'brand.eyebrow': 'Wofür wir stehen',
      'brand.title': 'Aus Überzeugungen gebaut, nicht aus Funktionen',
      'brand.pillar1.title': 'Staunen statt Dopamin',
      'brand.pillar1.desc': 'Gebaut, damit dein Kind am Ende neugieriger ist als am Anfang — nicht mehr an den Bildschirm geklebt.',
      'brand.pillar2.title': 'Kind-geleitet, nicht algorithmus-gesteuert',
      'brand.pillar2.desc': 'Keine Empfehlungs-Engine. Kein Autoplay. Nur ein neugieriges Kind, das wählt, was es als Nächstes entdeckt.',
      'brand.pillar3.title': 'Bildung ohne Schulzimmer',
      'brand.pillar3.desc': 'Echte Fakten, vorgetragen wie eine Doku, rund um die Fragen, die Kinder wirklich stellen. Keine Drills, keine Noten, keine verkleidete Schulstunde.',
      'brand.pillar4.title': 'Stolz statt Schuld',
      'brand.pillar4.desc': 'Die meisten Kinder-Apps sind gegen Eltern gebaut. Diese ist mit ihnen gebaut — damit du sie guten Gewissens übergeben kannst.',
      'footer.copy': '\u00a9 2026 Wild Atlas. Alle Rechte vorbehalten.',

      // Legal pages
      'legal.eyebrow': 'Rechtliches',
      'legal.backhome': 'Zurück zu Wild Atlas',
      'legal.disclaimer': 'Die deutsche Übersetzung dient nur zur Bequemlichkeit. Die englische Fassung ist die verbindliche Version.',
      'legal.privacy.title': 'Datenschutzerklärung',
      'legal.privacy.metadesc': 'Wild Atlas Datenschutzerklärung. Wie wir Informationen erfassen, nutzen und schützen.',
      'legal.terms.title': 'Nutzungsbedingungen',
      'legal.terms.metadesc': 'Wild Atlas Nutzungsbedingungen. Ihre Vereinbarung bei der Nutzung der Wild Atlas App.',

      // Support page
      'footer.support': 'Support',
      'support.eyebrow': 'Hilfe',
      'support.title': 'Support',
      'support.metadesc': 'Support für Wild Atlas. Kontakt, FAQs und Hilfe für Eltern, die die Wild Atlas iOS-App nutzen.',

      // Age Suitability page
      'footer.agesuitability': 'Altersangemessenheit',
      'agesuitability.eyebrow': 'Für Familien',
      'agesuitability.title': 'Altersangemessenheit',
      'agesuitability.metadesc': 'Altersangemessenheit von Wild Atlas. Konzipiert für Kinder von 3 bis 12 Jahren. Was in der App enthalten ist, was nicht, und wie wir über Inhalte für Kinder denken.',

      'faq.q1': 'F\u00fcr welche Altersgruppe ist Wild Atlas gedacht?',
      'faq.a1': 'Wild Atlas ist f\u00fcr Kinder von 3\u20139 Jahren entwickelt, mit zwei Altermodi: Kleine Entdecker (3\u20134) mit Bildfragen und Junge Entdecker (5\u20139) mit Leseaufgaben.',
      'faq.q2': 'Ist Wild Atlas kostenlos?',
      'faq.a2': 'Wild Atlas ist kostenlos herunterladbar und enthält 3 Gratis-Tierpakete (Happy Hounds, Cool Cats und Cozy Critters). Weitere Pakete kosten je 3,99 €, oder schalte alles frei — inklusive zukünftiger Pakete — mit dem Explorer Pass für 22,99 €.',
      'faq.q3': 'Kann mein Kind Wild Atlas selbstst\u00e4ndig nutzen, ohne lesen zu k\u00f6nnen?',
      'faq.a3': 'Ja! Wild Atlas hat eine Vorlesefunktion. Kinder tippen auf beliebigen Text und eine warme, freundliche Stimme liest ihn vor \u2014 perfekt zum eigenst\u00e4ndigen Entdecken ohne Lesekenntnisse.',
      'faq.q4': 'Ist Wild Atlas sicher f\u00fcr Kinder?',
      'faq.a4': 'Absolut. Wild Atlas hat keine Werbung, keine externen Links und keine sozialen Funktionen. Es ist so gestaltet, dass Eltern das Ger\u00e4t beruhigt \u00fcbergeben k\u00f6nnen.'
    },

    // ────────────────────────────────────────
    //  SPANISH (Español)
    // ────────────────────────────────────────
    es: {
      'meta.title': 'Wild Atlas \u2014 Cr\u00eda Exploradores, No Scrollers',
      'meta.description': 'Cr\u00eda exploradores, no scrollers. Una app de animales para ni\u00f1os de 3 a 9 a\u00f1os. Sin anuncios, sin algoritmos, sin necesidad de leer. 12 paquetes, 5 idiomas, 3 gratis.',
      'meta.og.description': 'Por fin, tiempo de pantalla del que sentirte orgulloso. Una aventura animal interactiva para ni\u00f1os curiosos de 3 a 9 a\u00f1os \u2014 hecha para el asombro, no para m\u00e9tricas de engagement.',

      'gate.title': 'Wild Atlas',
      'gate.subtitle': 'Este sitio se encuentra en modo de vista previa.',
      'gate.placeholder': 'Ingresa el c\u00f3digo de acceso',
      'gate.button': 'Entrar',
      'gate.error': 'C\u00f3digo incorrecto. Int\u00e9ntalo de nuevo.',

      'nav.features': 'Funciones',
      'nav.games': 'Juegos',
      'nav.packs': 'Paquetes',
      'nav.parents': 'Para Padres',
      'nav.cta': 'Sé primero',

      'hero.title': 'Descubre el Reino Animal',
      'hero.eyebrow': 'Descubre el Reino Animal',
      'hero.tagline': 'Cr\u00eda exploradores,<br>no scrollers.',
      'hero.subtitle': 'Por fin, tiempo de pantalla del que sentirte <strong>orgulloso</strong>. Una aventura animal interactiva para ni\u00f1os curiosos de 3 a 9 a\u00f1os.',
      'hero.little': 'Peque\u00f1os Exploradores',
      'hero.little.ages': '3\u20134 a\u00f1os',
      'hero.young': 'J\u00f3venes Exploradores',
      'hero.young.ages': '5\u20139 a\u00f1os',

      // Trust strip
      'trust.noads': 'Sin anuncios',
      'trust.noalgo': 'Sin algoritmos',
      'trust.noreading': 'No requiere leer',
      'trust.privacy': 'Privacidad garantizada (COPPA)',

      // Languages section
      'lang.title': 'Disponible en 5 idiomas',
      'lang.desc': 'Wild Atlas está completamente localizado en inglés, alemán, español, francés y chino simplificado — incluyendo todos los textos <em>y</em> la narración de audio. Cada dato curioso, palabra divertida y quiz se lee en voz alta en el idioma de tu hijo.',
      'lang.point1': 'Narración de audio completa en todos los idiomas',
      'lang.point2': 'Todos los textos, datos y quiz traducidos',
      'lang.point3': 'Perfecto para familias bilingües — o para niños que están aprendiendo un nuevo idioma',

      'features.title': 'Lo que hace especial a Wild Atlas',
      'features.quiz.title': 'Quiz que encantan a los ni\u00f1os',
      'features.quiz.desc': 'Dos modos de quiz adaptados por edad \u2014 los Peque\u00f1os Exploradores tienen preguntas con im\u00e1genes, los J\u00f3venes Exploradores enfrentan desaf\u00edos de lectura. \u00a1No pueden parar!',
      'features.quiz.little': '3\u20134 a\u00f1os',
      'features.quiz.young': '5\u20139 a\u00f1os',
      'features.tts.title': 'Toca para escuchar todo en voz alta',
      'features.tts.desc': 'Los ni\u00f1os pueden tocar cualquier texto y una voz c\u00e1lida y amigable lo lee en voz alta. Perfecto para la exploraci\u00f3n independiente \u2014 los padres pueden entregar el dispositivo con tranquilidad.',
      'features.tts.point1': 'No se necesita saber leer',
      'features.tts.point2': 'Exploraci\u00f3n segura',
      'features.tts.point3': 'Dise\u00f1o para padres',

      'discover.title': 'Tanto por descubrir',
      'discover.facts.title': 'Datos Curiosos',
      'discover.facts.desc': 'Datos fascinantes sobre cada animal, narrados con una voz c\u00e1lida y amigable',
      'discover.videos.title': 'Wild Watch',
      'discover.videos.desc': 'Videos narrados de animales que se reproducen solos — asombro sin manos.',
      'discover.map.title': 'Explorador del Mundo',
      'discover.map.desc': 'Descubre d\u00f3nde viven los animales en un colorido mapa interactivo',
      'discover.size.title': 'Comparaci\u00f3n de Tama\u00f1o',
      'discover.size.desc': '\u00bfQu\u00e9 tan grande es un Tibur\u00f3n Blanco comparado contigo?',
      'discover.badges.title': 'Insignias de Descubrimiento',
      'discover.badges.desc': 'Gana insignias de oro, plata y bronce mientras exploras',
      'discover.achievements.title': 'Logros',
      'discover.achievements.desc': 'Cada animal conocido, cada mundo visitado \u2014 la exploraci\u00f3n recompensada paso a paso.',

      // Games
      'games.title': 'Juegos para Mentes Curiosas',
      'games.subtitle': 'Cuatro juegos, cuatro formas de crecer \u2014 memoria, geograf\u00eda, observaci\u00f3n y razonamiento espacial. Juego que no se siente como aprender.',
      'games.memory.title': 'Memoria Animal',
      'games.memory.desc': 'Voltea y encuentra las parejas. Puro entrenamiento de memoria, disfrazado de juego.',
      'games.puzzle.title': 'Rompecabezas Cachorro',
      'games.puzzle.desc': 'Une las piezas. Razonamiento espacial que se construye sin lecciones.',
      'games.whos.title': '\u00bfQui\u00e9n es Qui\u00e9n?',
      'games.whos.desc': 'Descubre qu\u00e9 hace \u00fanico a cada animal. Observaci\u00f3n, gamificada.',
      'games.habitat.title': 'Salto de H\u00e1bitat',
      'games.habitat.desc': 'Lleva a los animales a casa \u2014 sabana, \u00e1rtico, bosque, oc\u00e9ano. Geograf\u00eda a trav\u00e9s del juego.',

      'packs.title': '12 Mundos Animales por Explorar',
      'packs.subtitle': '3 packs siempre gratis, más un pack premium que tu hijo elige — gratis. Desbloquea más a 3,99 € cada uno, o consíguelo todo con el Explorer Pass por 22,99 €.',
      'packs.free': 'Gratis',
      'packs.more': '\u00a1M\u00e1s paquetes pr\u00f3ximamente!',

      'animals.title': 'M\u00e1s de 150 hermosos animales',

      // Animal strip names (DRAFT — needs native review for non-EN)
      'showcase.scale.point1': 'Peso y tamaño comparados con niños que pueden entender',
      'showcase.scale.point2': 'Escala a tamaño real con personajes de Pequeños Exploradores',
      'showcase.scale.point3': 'Altura, longitud y peso para cada animal',
      'showcase.map.point1': 'Exploración interactiva continente por continente',
      'showcase.map.point2': 'Aprende hábitats animales y geografía juntos',
      'showcase.map.point3': 'Diseño de mapa colorido y apto para niños',
      'showcase.scale.title': '¿Qué tan grande? ¿Qué tan pesado?',
      'showcase.scale.desc': '¡Los niños descubren cómo se comparan los animales con ellos mismos! ¿Cuántos niños de cinco años pesan lo mismo que un gorila? ¡Párate junto a un tiburón blanco y mira lo grande que realmente es!',
      'showcase.map.title': 'Explora el mundo entero',
      'showcase.map.desc': 'Un mapa del mundo hermoso y colorido muestra a los niños exactamente dónde vive cada animal. Toca un continente y descubre las increíbles criaturas que lo llaman hogar.',
      'packs.happy_hounds': 'Perros Felices',
      'packs.cool_cats': 'Gatos Geniales',
      'packs.cozy_critters': 'Animalitos Acogedores',
      'packs.feathered_friends': 'Amigos con Plumas',
      'packs.safari_stars': 'Estrellas del Safari',
      'packs.ocean_creatures': 'Criaturas del Océano',
      'packs.dino_roars': '¡Rugidos de Dinosaurios!',
      'packs.wild_americas': 'Américas Salvajes',
      'packs.rainforest_explorers': 'Exploradores de la Selva',
      'packs.farm_friends': 'Amigos de la Granja',
      'packs.reptile_world': 'Mundo Reptil',
      'packs.planet_pioneers': 'Pioneros del Planeta',
      'animals.golden_retriever': 'Golden Retriever',
      'animals.lion': 'León',
      'animals.snow_leopard': 'Leopardo de las Nieves',
      'animals.toucan': 'Tucán',
      'animals.great_white': 'Tiburón Blanco',
      'animals.axolotl': 'Ajolote',
      'animals.tree_frog': 'Rana de Árbol',

      'parents.title': 'Dise\u00f1ado para toda la familia',
      'parents.point0': 'Dos formas de explorar \u2014 <strong>narraci\u00f3n activada</strong> para juego independiente, o <strong>desact\u00edvala</strong> para leer juntos',
      'parents.point1': 'La narraci\u00f3n en voz alta significa que <strong>no se necesita saber leer</strong>',
      'parents.point2': 'Contenido adecuado para <strong>Peque\u00f1os Exploradores (3\u20134)</strong> y <strong>J\u00f3venes Exploradores (5\u20139)</strong>',
      'parents.point3': 'Creado para que los ni\u00f1os puedan <strong>explorar de forma segura por su cuenta</strong>',
      'parents.point4': '<strong>Disponible en 5 idiomas</strong> — aprende en el idioma materno de tu hijo, o úsalo para reforzar un idioma que esté estudiando.',
      'parents.point5': '<strong>Sin anuncios, sin enlaces externos, sin funciones sociales</strong>',

      'signup.title': 'Una oferta para exploradores tempranos',
      'signup.desc': 'Suscríbete y te enviaremos una <strong>oferta de bienvenida exclusiva</strong>. Sin newsletter — solo nuestro agradecimiento por llegar pronto.',
      'signup.placeholder': 'Ingresa tu email',
      'signup.button': 'Suscribirme',
      'signup.success': '¡Ya estás! Revisa tu correo — la oferta de bienvenida viene en camino.',
      'signup.error': 'Algo sali\u00f3 mal. \u00a1Int\u00e9ntalo de nuevo!',

      'footer.privacy': 'Pol\u00edtica de Privacidad',
      'footer.contact': 'Contacto',
      'footer.about': 'Acerca de',
      'footer.terms': 'Términos de servicio',
      'about.eyebrow': 'Detrás de la app',
      'about.title': 'Por qué construimos Wild Atlas',
      'about.body': 'Hola — soy Josh. Wild Atlas empezó como algo que hacía para mis propios hijos, Zuzu y Lurian. La historia completa merece su propia página.',
      'about.signoff': '— Josh',
      'about.cta': 'Leer la carta del fundador →',
      'about.letter': '<p><em>La carta de nuestro fundador está actualmente disponible solo en inglés. La traducción está en camino.</em></p>',
      'about.metadesc': 'Por qué construimos Wild Atlas. Una carta del fundador Josh Vincent sobre el tiempo de pantalla, la curiosidad y la crianza de exploradores.',

      // Hero platform line + brand pillars
      'hero.platforms': 'Disponible para iPhone y iPad desde junio de 2026',
      'brand.eyebrow': 'Lo que defendemos',
      'brand.title': 'Construido sobre creencias, no funciones',
      'brand.pillar1.title': 'Asombro antes que dopamina',
      'brand.pillar1.desc': 'Hecho para que tu hijo termine más curioso que cuando empezó — no más pegado a la pantalla.',
      'brand.pillar2.title': 'Guiado por el niño, no por el algoritmo',
      'brand.pillar2.desc': 'Sin motor de recomendaciones. Sin reproducción automática. Solo un niño curioso eligiendo qué explorar después.',
      'brand.pillar3.title': 'Educación sin aula',
      'brand.pillar3.desc': 'Datos reales, narrados como un documental, organizados en torno a las preguntas que los niños realmente hacen. Sin ejercicios, sin notas, sin clases disfrazadas.',
      'brand.pillar4.title': 'Orgullo, no culpa',
      'brand.pillar4.desc': 'La mayoría de las apps para niños se construyen en contra de los padres. Esta se construye con ellos — para que la entregues y te sientas bien.',
      'footer.copy': '\u00a9 2026 Wild Atlas. Todos los derechos reservados.',

      // Legal pages
      'legal.eyebrow': 'Legal',
      'legal.backhome': 'Volver a Wild Atlas',
      'legal.disclaimer': 'La traducción al español se ofrece únicamente por conveniencia. La versión en inglés es la auténtica.',
      'legal.privacy.title': 'Política de Privacidad',
      'legal.privacy.metadesc': 'Política de Privacidad de Wild Atlas. Cómo recopilamos, usamos y protegemos su información.',
      'legal.terms.title': 'Términos de Servicio',
      'legal.terms.metadesc': 'Términos de Servicio de Wild Atlas. Su acuerdo al usar la aplicación Wild Atlas.',

      // Support page
      'footer.support': 'Soporte',
      'support.eyebrow': 'Ayuda',
      'support.title': 'Soporte',
      'support.metadesc': 'Soporte para Wild Atlas. Contáctanos, preguntas frecuentes y ayuda para padres que usan la app de Wild Atlas para iOS.',

      // Age Suitability page
      'footer.agesuitability': 'Adecuación por edad',
      'agesuitability.eyebrow': 'Para familias',
      'agesuitability.title': 'Adecuación por edad',
      'agesuitability.metadesc': 'Adecuación por edad de Wild Atlas. Diseñada para niños de 3 a 12 años. Lo que está en la app, lo que no, y cómo pensamos en el contenido para niños.',

      'faq.q1': '\u00bfPara qu\u00e9 edades est\u00e1 dise\u00f1ado Wild Atlas?',
      'faq.a1': 'Wild Atlas est\u00e1 dise\u00f1ado para ni\u00f1os de 3 a 9 a\u00f1os, con dos modos: Peque\u00f1os Exploradores (3\u20134) con preguntas basadas en im\u00e1genes y J\u00f3venes Exploradores (5\u20139) con desaf\u00edos de lectura.',
      'faq.q2': '\u00bfEs gratis Wild Atlas?',
      'faq.a2': 'Wild Atlas es gratis para descargar e incluye 3 paquetes gratis (Happy Hounds, Cool Cats y Cozy Critters). Los paquetes adicionales cuestan 3,99 € cada uno, o desbloquea todo — incluidos los paquetes futuros — con el Explorer Pass por 22,99 €.',
      'faq.q3': '\u00bfPuede mi hijo usar Wild Atlas sin saber leer?',
      'faq.a3': '\u00a1S\u00ed! Wild Atlas tiene narraci\u00f3n en voz alta. Los ni\u00f1os tocan cualquier texto y una voz c\u00e1lida lo lee, perfecto para explorar de forma independiente sin necesitar leer.',
      'faq.q4': '\u00bfEs Wild Atlas seguro para ni\u00f1os?',
      'faq.a4': 'Absolutamente. Wild Atlas no tiene anuncios, enlaces externos ni funciones sociales. Est\u00e1 dise\u00f1ado para que los padres puedan entregar el dispositivo con total tranquilidad.'
    },

    // ────────────────────────────────────────
    //  FRENCH (Français)
    // ────────────────────────────────────────
    fr: {
      'meta.title': 'Wild Atlas \u2014 \u00c9l\u00e8ve des Explorateurs, Pas des Scrolleurs',
      'meta.description': '\u00c9l\u00e8ve des explorateurs, pas des scrolleurs. Une app d\u2019animaux pour enfants de 3 \u00e0 9 ans. Sans publicit\u00e9, sans algorithmes, aucune lecture requise. 12 packs, 5 langues, 3 gratuits.',
      'meta.og.description': 'Enfin du temps d\u2019\u00e9cran dont vous serez fier. Une aventure animale interactive pour les enfants curieux de 3 \u00e0 9 ans \u2014 con\u00e7ue pour l\u2019\u00e9merveillement, pas pour les m\u00e9triques d\u2019engagement.',

      'gate.title': 'Wild Atlas',
      'gate.subtitle': 'Ce site est actuellement en mode aper\u00e7u.',
      'gate.placeholder': 'Entrer le code d\u2019acc\u00e8s',
      'gate.button': 'Entrer',
      'gate.error': 'Code incorrect. Veuillez r\u00e9essayer.',

      'nav.features': 'Fonctions',
      'nav.games': 'Jeux',
      'nav.packs': 'Packs',
      'nav.parents': 'Pour les Parents',
      'nav.cta': 'Soyez premier',

      'hero.title': 'D\u00e9couvrez le R\u00e8gne Animal',
      'hero.eyebrow': 'D\u00e9couvrez le R\u00e8gne Animal',
      'hero.tagline': '\u00c9l\u00e8ve des explorateurs,<br>pas des scrolleurs.',
      'hero.subtitle': 'Enfin du temps d\u2019\u00e9cran dont vous serez <strong>fier</strong>. Une aventure animale interactive pour les enfants curieux de 3 \u00e0 9 ans.',
      'hero.little': 'Petits Explorateurs',
      'hero.little.ages': '3\u20134 ans',
      'hero.young': 'Jeunes Explorateurs',
      'hero.young.ages': '5\u20139 ans',

      // Trust strip
      'trust.noads': 'Sans publicit\u00e9',
      'trust.noalgo': 'Sans algorithmes',
      'trust.noreading': 'Aucune lecture requise',
      'trust.privacy': 'Confidentialit\u00e9 garantie (COPPA)',

      // Languages section
      'lang.title': 'Disponible en 5 langues',
      'lang.desc': 'Wild Atlas est enti\u00e8rement localis\u00e9 en anglais, allemand, espagnol, fran\u00e7ais et chinois simplifi\u00e9 \u2014 y compris tous les textes <em>et</em> la narration audio. Chaque anecdote, mot amusant et quiz est lu \u00e0 voix haute dans la langue de votre enfant.',
      'lang.point1': 'Narration audio compl\u00e8te dans toutes les langues',
      'lang.point2': 'Tous les textes, faits et quiz traduits',
      'lang.point3': 'Parfait pour les familles bilingues — ou les enfants qui apprennent une nouvelle langue',

      'features.title': 'Ce qui rend Wild Atlas sp\u00e9cial',
      'features.quiz.title': 'Des quiz que les enfants adorent',
      'features.quiz.desc': 'Deux modes de quiz adapt\u00e9s par \u00e2ge \u2014 les Petits Explorateurs ont des questions en images, les Jeunes Explorateurs rel\u00e8vent des d\u00e9fis de lecture. Ils en redemandent\u00a0!',
      'features.quiz.little': '3\u20134 ans',
      'features.quiz.young': '5\u20139 ans',
      'features.tts.title': 'Touchez pour tout entendre \u00e0 voix haute',
      'features.tts.desc': 'Les enfants peuvent toucher n\u2019importe quel texte et une voix chaleureuse le lit \u00e0 voix haute. Parfait pour l\u2019exploration autonome \u2014 les parents peuvent confier l\u2019appareil en toute tranquillit\u00e9.',
      'features.tts.point1': 'Aucune comp\u00e9tence en lecture requise',
      'features.tts.point2': 'Exploration s\u00fbre en autonomie',
      'features.tts.point3': 'Con\u00e7u pour les parents',

      'discover.title': 'Tant \u00e0 d\u00e9couvrir',
      'discover.facts.title': 'Anecdotes Amusantes',
      'discover.facts.desc': 'Des faits fascinants sur chaque animal, narr\u00e9s d\u2019une voix chaleureuse',
      'discover.videos.title': 'Wild Watch',
      'discover.videos.desc': 'Vid\u00e9os d\u2019animaux narr\u00e9es qui se lancent toutes seules \u2014 \u00e9merveillement sans toucher.',
      'discover.map.title': 'Explorateur du Monde',
      'discover.map.desc': 'D\u00e9couvrez o\u00f9 vivent les animaux sur une carte interactive color\u00e9e',
      'discover.size.title': 'Comparaison de Taille',
      'discover.size.desc': 'Quelle est la taille d\u2019un Grand Requin Blanc compar\u00e9 \u00e0 toi\u00a0?',
      'discover.badges.title': 'Badges de D\u00e9couverte',
      'discover.badges.desc': 'Gagne des badges d\u2019or, d\u2019argent et de bronze en explorant',
      'discover.achievements.title': 'Succès',
      'discover.achievements.desc': 'Chaque animal rencontré, chaque monde visité — l’exploration récompensée à chaque pas.',

      // Games
      'games.title': 'Des Jeux pour les Esprits Curieux',
      'games.subtitle': 'Quatre jeux, quatre fa\u00e7ons de grandir \u2014 m\u00e9moire, g\u00e9ographie, observation et raisonnement spatial. Du jeu qui ne ressemble pas \u00e0 une le\u00e7on.',
      'games.memory.title': 'M\u00e9moire Animale',
      'games.memory.desc': 'Retourne et trouve les paires. Pur entra\u00eenement de la m\u00e9moire, d\u00e9guis\u00e9 en jeu.',
      'games.puzzle.title': 'Puzzle Chiot',
      'games.puzzle.desc': 'Embo\u00eete les pi\u00e8ces. Du raisonnement spatial qui se construit sans le\u00e7ons.',
      'games.whos.title': 'Qui est Qui ?',
      'games.whos.desc': 'Rep\u00e8re ce qui rend chaque animal unique. L\u2019observation, version jeu.',
      'games.habitat.title': 'Saut d\u2019Habitat',
      'games.habitat.desc': 'Ram\u00e8ne les animaux chez eux \u2014 savane, arctique, for\u00eat, oc\u00e9an. La g\u00e9ographie par le jeu.',

      'packs.title': '12 Mondes Animaux \u00e0 Explorer',
      'packs.subtitle': '3 packs toujours gratuits, plus un pack premium que votre enfant choisit — gratuit. Déverrouillez les autres à 3,99 € chacun, ou obtenez tout avec l’Explorer Pass à 22,99 €.',
      'packs.free': 'Gratuit',
      'packs.more': 'Plus de packs bient\u00f4t\u00a0!',

      'animals.title': 'Plus de 150 magnifiques animaux',

      // Animal strip names (DRAFT — needs native review for non-EN)
      'showcase.scale.point1': 'Poids et taille comparés à des enfants auxquels ils peuvent se rapporter',
      'showcase.scale.point2': 'Échelle grandeur nature avec les personnages Petits Explorateurs',
      'showcase.scale.point3': 'Hauteur, longueur et poids pour chaque animal',
      'showcase.map.point1': 'Exploration interactive continent par continent',
      'showcase.map.point2': 'Apprenez les habitats animaux et la géographie ensemble',
      'showcase.map.point3': 'Carte colorée et adaptée aux enfants',
      'showcase.scale.title': 'À quel point grand ? À quel point lourd ?',
      'showcase.scale.desc': 'Les enfants découvrent comment les animaux se comparent à eux-mêmes ! Combien d’enfants de cinq ans pèsent autant qu’un gorille ? Tenez-vous à côté d’un grand requin blanc et voyez à quel point il est vraiment grand !',
      'showcase.map.title': 'Explorez le monde entier',
      'showcase.map.desc': 'Une carte du monde belle et colorée montre aux enfants exactement où vit chaque animal. Touchez un continent et découvrez les incroyables créatures qui l’habitent.',
      'packs.happy_hounds': 'Chiens Joyeux',
      'packs.cool_cats': 'Chats Cools',
      'packs.cozy_critters': 'Petites Bêtes Douillettes',
      'packs.feathered_friends': 'Amis à Plumes',
      'packs.safari_stars': 'Stars du Safari',
      'packs.ocean_creatures': 'Créatures de l’Océan',
      'packs.dino_roars': 'Rugissements de Dinos !',
      'packs.wild_americas': 'Amériques Sauvages',
      'packs.rainforest_explorers': 'Explorateurs de la Forêt Tropicale',
      'packs.farm_friends': 'Amis de la Ferme',
      'packs.reptile_world': 'Monde des Reptiles',
      'packs.planet_pioneers': 'Pionniers de la Planète',
      'animals.golden_retriever': 'Golden Retriever',
      'animals.lion': 'Lion',
      'animals.snow_leopard': 'Léopard des Neiges',
      'animals.toucan': 'Toucan',
      'animals.great_white': 'Grand Requin Blanc',
      'animals.axolotl': 'Axolotl',
      'animals.tree_frog': 'Rainette',

      'parents.title': 'Con\u00e7u pour toute la famille',
      'parents.point0': 'Deux fa\u00e7ons d\u2019explorer \u2014 <strong>narration activ\u00e9e</strong> pour jouer seul, ou <strong>d\u00e9sactivez-la</strong> pour lire ensemble',
      'parents.point1': 'La lecture \u00e0 voix haute signifie <strong>aucune comp\u00e9tence en lecture n\u00e9cessaire</strong>',
      'parents.point2': 'Contenu adapt\u00e9 pour les <strong>Petits Explorateurs (3\u20134)</strong> et les <strong>Jeunes Explorateurs (5\u20139)</strong>',
      'parents.point3': 'Con\u00e7u pour que les enfants puissent <strong>explorer en toute s\u00e9curit\u00e9</strong>',
      'parents.point4': '<strong>Disponible en 5 langues</strong> — apprenez dans la langue maternelle de votre enfant, ou utilisez-la pour renforcer une langue qu’il étudie.',
      'parents.point5': '<strong>Pas de publicit\u00e9s, pas de liens externes, pas de fonctions sociales</strong>',

      'signup.title': 'Une offre pour les premiers explorateurs',
      'signup.desc': 'Inscrivez-vous et nous vous enverrons une <strong>offre de bienvenue exclusive</strong>. Pas de newsletter — juste notre remerciement pour votre soutien précoce.',
      'signup.placeholder': 'Entrez votre email',
      'signup.button': 'M’inscrire',
      'signup.success': 'Vous y êtes ! Surveillez votre boîte — votre offre de bienvenue arrive.',
      'signup.error': 'Une erreur est survenue. Veuillez r\u00e9essayer\u00a0!',

      'footer.privacy': 'Politique de Confidentialit\u00e9',
      'footer.contact': 'Contact',
      'footer.about': '\u00c0 Propos',
      'footer.terms': 'Conditions d’utilisation',
      'about.eyebrow': 'Dans les coulisses',
      'about.title': 'Pourquoi nous avons créé Wild Atlas',
      'about.body': 'Salut — je suis Josh. Wild Atlas a commencé comme quelque chose que je créais pour mes propres enfants, Zuzu et Lurian. L\'histoire complète mérite sa propre page.',
      'about.signoff': '— Josh',
      'about.cta': 'Lire la lettre du fondateur →',
      'about.letter': '<p><em>La lettre de notre fondateur n\'est actuellement disponible qu\'en anglais. Une traduction arrive bientôt.</em></p>',
      'about.metadesc': 'Pourquoi nous avons créé Wild Atlas. Une lettre du fondateur Josh Vincent sur le temps d\'écran, la curiosité et l\'éducation d\'explorateurs.',

      // Hero platform line + brand pillars
      'hero.platforms': 'Disponible sur iPhone et iPad à partir de juin 2026',
      'brand.eyebrow': 'Ce que nous défendons',
      'brand.title': 'Construit sur des convictions, pas des fonctionnalités',
      'brand.pillar1.title': 'Émerveillement plutôt que dopamine',
      'brand.pillar1.desc': 'Conçu pour que votre enfant en sorte plus curieux qu’avant — pas plus collé à l’écran.',
      'brand.pillar2.title': 'Guidé par l’enfant, pas par l’algorithme',
      'brand.pillar2.desc': 'Pas de moteur de recommandation. Pas de lecture automatique. Juste un enfant curieux qui choisit ce qu’il explore ensuite.',
      'brand.pillar3.title': 'Apprendre sans salle de classe',
      'brand.pillar3.desc': 'Des faits réels, racontés comme un documentaire, organisés autour des questions que les enfants posent vraiment. Pas d’exercices, pas de notes, pas de leçons déguisées.',
      'brand.pillar4.title': 'Fierté, pas culpabilité',
      'brand.pillar4.desc': 'La plupart des apps pour enfants sont conçues contre les parents. Celle-ci est conçue avec eux — pour que vous la tendiez et vous sentiez bien de l’avoir fait.',
      'footer.copy': '\u00a9 2026 Wild Atlas. Tous droits r\u00e9serv\u00e9s.',

      // Legal pages
      'legal.eyebrow': 'Mentions légales',
      'legal.backhome': 'Retour à Wild Atlas',
      'legal.disclaimer': 'La traduction française est fournie uniquement pour votre convenance. La version anglaise fait foi.',
      'legal.privacy.title': 'Politique de confidentialité',
      'legal.privacy.metadesc': 'Politique de confidentialité Wild Atlas. Comment nous collectons, utilisons et protégeons vos informations.',
      'legal.terms.title': 'Conditions d’utilisation',
      'legal.terms.metadesc': 'Conditions d’utilisation Wild Atlas. Votre accord lors de l’utilisation de l’application Wild Atlas.',

      // Support page
      'footer.support': 'Assistance',
      'support.eyebrow': 'Aide',
      'support.title': 'Assistance',
      'support.metadesc': 'Assistance pour Wild Atlas. Contact, FAQ et aide pour les parents qui utilisent l\'app iOS Wild Atlas.',

      // Age Suitability page
      'footer.agesuitability': 'Adéquation par âge',
      'agesuitability.eyebrow': 'Pour les familles',
      'agesuitability.title': 'Adéquation par âge',
      'agesuitability.metadesc': 'Adéquation par âge de Wild Atlas. Conçue pour les enfants de 3 à 12 ans. Ce qui est dans l\'app, ce qui n\'y est pas, et notre approche du contenu pour enfants.',

      'faq.q1': 'Pour quel \u00e2ge Wild Atlas est-il con\u00e7u\u00a0?',
      'faq.a1': 'Wild Atlas est con\u00e7u pour les enfants de 3 \u00e0 9 ans, avec deux modes : Petits Explorateurs (3\u20134) avec des questions en images et Jeunes Explorateurs (5\u20139) avec des d\u00e9fis de lecture.',
      'faq.q2': 'Wild Atlas est-il gratuit\u00a0?',
      'faq.a2': 'Wild Atlas est gratuit et comprend 3 packs gratuits (Happy Hounds, Cool Cats et Cozy Critters). Les packs supplémentaires sont à 3,99 € chacun, ou débloquez tout — y compris les packs à venir — avec l\'Explorer Pass à 22,99 €.',
      'faq.q3': 'Mon enfant peut-il utiliser Wild Atlas sans savoir lire\u00a0?',
      'faq.a3': 'Oui\u00a0! Wild Atlas propose une lecture \u00e0 voix haute. Les enfants touchent n\u2019importe quel texte et une voix chaleureuse le lit, parfait pour explorer de fa\u00e7on autonome.',
      'faq.q4': 'Wild Atlas est-il s\u00fbr pour les enfants\u00a0?',
      'faq.a4': 'Absolument. Wild Atlas n\u2019a pas de publicit\u00e9s, pas de liens externes et pas de fonctions sociales. Il est con\u00e7u pour que les parents puissent confier l\u2019appareil en toute tranquillit\u00e9.'
    },

    // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    //  SIMPLIFIED CHINESE (\u4e2d\u6587 / zh-Hans)
    // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    // DRAFT \u2014 needs native review before launch. Brand name \u91ce\u751f\u5730\u56fe\u96c6 is taken
    // from the app's InfoPlist.strings; tagline uses "\u5237\u5c4f\u65cf" (real Chinese
    // internet slang for compulsive screen-scrollers) to preserve the EN punch.
    zh: {
      // Meta
      'meta.title': '\u91ce\u751f\u5730\u56fe\u96c6 \u2014 \u57f9\u517b\u63a2\u9669\u5bb6\uff0c\u800c\u975e\u4f4e\u5934\u65cf',
      'meta.description': '\u57f9\u517b\u63a2\u9669\u5bb6\uff0c\u800c\u975e\u4f4e\u5934\u65cf\u3002\u4e13\u4e3a 3\u20139 \u5c81\u5b69\u5b50\u8bbe\u8ba1\u7684\u52a8\u7269\u5b66\u4e60 App\u3002\u65e0\u5e7f\u544a\u3001\u65e0\u7b97\u6cd5\u3001\u65e0\u9700\u8bc6\u5b57\u300212 \u4e2a\u52a8\u7269\u5305\u30015 \u79cd\u8bed\u8a00\u30013 \u4e2a\u514d\u8d39\u8d77\u6b65\u3002',
      'meta.og.description': '\u7ec8\u4e8e\u6709\u4e00\u6b3e\u8ba9\u4f60\u5f15\u4ee5\u4e3a\u8c6a\u7684\u5c4f\u5e55\u65f6\u95f4\u3002\u4e00\u573a\u4e92\u52a8\u52a8\u7269\u5192\u9669\uff0c\u4e13\u4e3a 3\u20139 \u5c81\u7684\u597d\u5947\u5b9d\u8d1d\u2014\u2014\u4e3a\u60ca\u5947\u800c\u751f\uff0c\u4e0d\u4e3a\u6d41\u91cf\u6570\u636e\u3002',

      // Gate
      'gate.title': '\u91ce\u751f\u5730\u56fe\u96c6',
      'gate.subtitle': '\u6b64\u7f51\u7ad9\u76ee\u524d\u5904\u4e8e\u9884\u89c8\u6a21\u5f0f\u3002',
      'gate.placeholder': '\u8f93\u5165\u8bbf\u95ee\u4ee3\u7801',
      'gate.button': '\u8fdb\u5165',
      'gate.error': '\u4ee3\u7801\u4e0d\u6b63\u786e\uff0c\u8bf7\u91cd\u8bd5\u3002',

      // Nav
      'nav.features': '\u529f\u80fd',
      'nav.games': '\u6e38\u620f',
      'nav.packs': '\u52a8\u7269\u5305',
      'nav.parents': '\u5bb6\u957f\u4e13\u533a',
      'nav.cta': '抢先体验',

      // Hero
      'hero.title': '\u63a2\u7d22\u52a8\u7269\u738b\u56fd',
      'hero.eyebrow': '\u63a2\u7d22\u52a8\u7269\u738b\u56fd',
      'hero.tagline': '\u57f9\u517b\u63a2\u9669\u5bb6\uff0c<br>\u800c\u975e\u4f4e\u5934\u65cf\u3002',
      'hero.subtitle': '\u7ec8\u4e8e\u6709\u4e00\u6b3e<strong>\u8ba9\u4f60\u5f15\u4ee5\u4e3a\u8c6a</strong>\u7684\u5c4f\u5e55\u65f6\u95f4\u3002\u4e00\u573a\u4e92\u52a8\u52a8\u7269\u5192\u9669\uff0c\u4e13\u4e3a 3\u20139 \u5c81\u7684\u597d\u5947\u5b9d\u8d1d\u3002',
      'hero.little': '\u5c0f\u5c0f\u63a2\u7d22\u5bb6',
      'hero.little.ages': '5 \u5c81\u4ee5\u4e0b',
      'hero.young': '\u5e74\u8f7b\u63a2\u7d22\u5bb6',
      'hero.young.ages': '5 \u5c81\u53ca\u4ee5\u4e0a',

      // Trust strip
      'trust.noads': '\u65e0\u5e7f\u544a',
      'trust.noalgo': '\u65e0\u7b97\u6cd5',
      'trust.noreading': '\u65e0\u9700\u8bc6\u5b57',
      'trust.privacy': '\u9690\u79c1\u4f18\u5148\uff0c\u7b26\u5408 COPPA',

      // Languages section
      'lang.title': '\u652f\u6301 5 \u79cd\u8bed\u8a00',
      'lang.desc': '\u91ce\u751f\u5730\u56fe\u96c6\u5b8c\u6574\u652f\u6301\u82f1\u8bed\u3001\u5fb7\u8bed\u3001\u897f\u73ed\u7259\u8bed\u3001\u6cd5\u8bed\u548c\u7b80\u4f53\u4e2d\u6587\u2014\u2014\u5305\u62ec\u6240\u6709\u6587\u672c<em>\u548c</em>\u97f3\u9891\u6717\u8bfb\u3002\u6bcf\u4e00\u6761\u52a8\u7269\u77e5\u8bc6\u3001\u8da3\u5473\u8bcd\u6c47\u548c\u6d4b\u9a8c\u90fd\u7528\u60a8\u5b69\u5b50\u7684\u8bed\u8a00\u6717\u8bfb\u51fa\u6765\u3002',
      'lang.point1': '\u6240\u6709\u652f\u6301\u8bed\u8a00\u5747\u63d0\u4f9b\u5b8c\u6574\u97f3\u9891\u6717\u8bfb',
      'lang.point2': '\u6240\u6709\u6587\u672c\u3001\u4e8b\u5b9e\u548c\u6d4b\u9a8c\u5747\u5df2\u7ffb\u8bd1',
      'lang.point3': '非常适合双语家庭——或正在学习新语言的孩子',

      // Key Features
      'features.title': '\u91ce\u751f\u5730\u56fe\u96c6\u7684\u72ec\u7279\u4e4b\u5904',
      'features.quiz.title': '\u5b69\u5b50\u7231\u73a9\u7684\u5c0f\u6d4b\u9a8c',
      'features.quiz.desc': '\u4e24\u79cd\u6309\u5e74\u9f84\u5b9a\u5236\u7684\u6d4b\u9a8c\u6a21\u5f0f\u2014\u2014\u5c0f\u5c0f\u63a2\u7d22\u5bb6\u7b54\u56fe\u7247\u9898\uff0c\u5e74\u8f7b\u63a2\u7d22\u5bb6\u6311\u6218\u8bc6\u5b57\u5173\u3002\u5b69\u5b50\u4eec\u7231\u4e0d\u91ca\u624b\uff01',
      'features.quiz.little': '5 \u5c81\u4ee5\u4e0b',
      'features.quiz.young': '5 \u5c81\u53ca\u4ee5\u4e0a',
      'features.tts.title': '\u8f7b\u89e6\u5373\u53ef\u6717\u8bfb\u4e00\u5207',
      'features.tts.desc': '\u5b69\u5b50\u53ef\u4ee5\u8f7b\u89e6\u4efb\u4f55\u6587\u5b57\uff0c\u6e29\u6696\u53cb\u597d\u7684\u58f0\u97f3\u4f1a\u6717\u8bfb\u51fa\u6765\u3002\u4e13\u4e3a\u72ec\u7acb\u63a2\u7d22\u800c\u751f\u2014\u2014\u5bb6\u957f\u53ef\u4ee5\u653e\u5fc3\u628a\u8bbe\u5907\u4ea4\u7ed9\u5b69\u5b50\u3002',
      'features.tts.point1': '\u65e0\u9700\u8bc6\u5b57',
      'features.tts.point2': '\u5b89\u5168\u72ec\u7acb\u63a2\u7d22',
      'features.tts.point3': '\u5bb6\u957f\u53cb\u597d\u8bbe\u8ba1',

      // More Features
      'discover.title': '\u8fd8\u6709\u66f4\u591a\u53ef\u4ee5\u53d1\u73b0',
      'discover.facts.title': '\u8da3\u5473\u4e8b\u5b9e',
      'discover.facts.desc': '\u5173\u4e8e\u6bcf\u79cd\u52a8\u7269\u7684\u6709\u8da3\u4e8b\u5b9e\uff0c\u7528\u6e29\u6696\u53cb\u597d\u7684\u58f0\u97f3\u6717\u8bfb',
      'discover.videos.title': 'Wild Watch',
      'discover.videos.desc': '\u81ea\u52a8\u64ad\u653e\u7684\u52a8\u7269\u89e3\u8bf4\u89c6\u9891\u2014\u2014\u7eaf\u7cb9\u7684\u60ca\u5947\uff0c\u65e0\u9700\u64cd\u4f5c\u3002',
      'discover.map.title': '\u4e16\u754c\u63a2\u9669\u5bb6',
      'discover.map.desc': '\u5728\u5f69\u8272\u4e92\u52a8\u5730\u56fe\u4e0a\u770b\u52a8\u7269\u4f4f\u5728\u54ea\u91cc',
      'discover.size.title': '\u5927\u5c0f\u5bf9\u6bd4',
      'discover.size.desc': '\u5927\u767d\u9ca8\u6bd4\u4f60\u5927\u591a\u5c11\uff1f',
      'discover.badges.title': '\u63a2\u7d22\u5fbd\u7ae0',
      'discover.badges.desc': '\u63a2\u7d22\u8fc7\u7a0b\u4e2d\u83b7\u5f97\u91d1\u3001\u94f6\u3001\u94dc\u5fbd\u7ae0',
      'discover.achievements.title': '\u6210\u5c31',
      'discover.achievements.desc': '\u6bcf\u4e2a\u8ba4\u8bc6\u7684\u52a8\u7269\uff0c\u6bcf\u4e2a\u63a2\u7d22\u7684\u4e16\u754c\u2014\u2014\u6bcf\u4e00\u6b65\u90fd\u9f13\u52b1\u63a2\u7d22\u3002',

      // Games \u2014 DRAFT, needs native review
      'games.title': '\u4e3a\u597d\u5947\u5fc3\u6253\u9020\u7684\u6e38\u620f',
      'games.subtitle': '\u56db\u6b3e\u6e38\u620f\uff0c\u56db\u79cd\u6210\u957f\u65b9\u5f0f\u2014\u2014\u8bb0\u5fc6\u3001\u5730\u7406\u3001\u89c2\u5bdf\u548c\u7a7a\u95f4\u601d\u7ef4\u3002\u5bd3\u6559\u4e8e\u4e50\uff0c\u4e0d\u50cf\u5728\u5b66\u4e60\u3002',
      'games.memory.title': '\u8bb0\u5fc6\u914d\u5bf9',
      'games.memory.desc': '\u7ffb\u724c\u627e\u914d\u5bf9\u3002\u7eaf\u7cb9\u7684\u8bb0\u5fc6\u8bad\u7ec3\uff0c\u5305\u88c5\u6210\u4e00\u6b3e\u6e38\u620f\u3002',
      'games.puzzle.title': '\u5c0f\u72d7\u62fc\u56fe',
      'games.puzzle.desc': '\u628a\u62fc\u56fe\u62fc\u56de\u53bb\u3002\u7a7a\u95f4\u601d\u7ef4\uff0c\u65e0\u9700\u4e0a\u8bfe\u3002',
      'games.whos.title': '\u731c\u731c\u6211\u662f\u8c01',
      'games.whos.desc': '\u53d1\u73b0\u6bcf\u79cd\u52a8\u7269\u7684\u72ec\u7279\u4e4b\u5904\u3002\u628a\u89c2\u5bdf\u529b\u53d8\u6210\u6e38\u620f\u3002',
      'games.habitat.title': '\u6816\u606f\u5730\u5927\u8df3\u8dc3',
      'games.habitat.desc': '\u628a\u52a8\u7269\u9001\u56de\u5bb6\u2014\u2014\u8349\u539f\u3001\u5317\u6781\u3001\u68ee\u6797\u3001\u6d77\u6d0b\u3002\u5728\u73a9\u4e2d\u5b66\u5730\u7406\u3002',

      // Packs
      'packs.title': '12 \u4e2a\u52a8\u7269\u4e16\u754c\u7b49\u4f60\u63a2\u7d22',
      'packs.subtitle': '3 个永久免费动物包，加上孩子自选一个付费包——免费赠送。其他每个¥28，或购买 Explorer Pass（¥148）解锁全部。',
      'packs.free': '\u514d\u8d39',
      'packs.more': '\u66f4\u591a\u52a8\u7269\u5305\u5373\u5c06\u63a8\u51fa\uff01',

      // Animals
      'animals.title': '150+ \u79cd\u7f8e\u4e3d\u7684\u52a8\u7269',

      // Animal strip names (DRAFT — needs native review for non-EN)
      'showcase.scale.point1': '用孩子能理解的方式比较体重和大小',
      'showcase.scale.point2': '用小小探索家角色展示真实尺寸',
      'showcase.scale.point3': '每种动物都有身高、长度和体重',
      'showcase.map.point1': '互动式逐洲探索',
      'showcase.map.point2': '一起学习动物栖息地和地理',
      'showcase.map.point3': '色彩缤纷、适合儿童的地图设计',
      'showcase.scale.title': '有多大？有多重？',
      'showcase.scale.desc': '让孩子们看看动物与他们自己相比有多大！多少个五岁孩子才能凑出一只大猩猩的体重？站在大白鲨旁边，看看它究竟有多大！',
      'showcase.map.title': '探索整个世界',
      'showcase.map.desc': '一张色彩缤纷的精美世界地图，让孩子们准确看到每种动物的栖息地。点击一个大洲，发现生活在那里的奇妙生物。',
      'packs.happy_hounds': '快乐狗狗',
      'packs.cool_cats': '酷酷猫咪',
      'packs.cozy_critters': '温馨小宠',
      'packs.feathered_friends': '羽毛朋友',
      'packs.safari_stars': '草原明星',
      'packs.ocean_creatures': '海洋生物',
      'packs.dino_roars': '恐龙咆哮！',
      'packs.wild_americas': '美洲野趣',
      'packs.rainforest_explorers': '雨林探险家',
      'packs.farm_friends': '农场朋友',
      'packs.reptile_world': '爬行动物世界',
      'packs.planet_pioneers': '星球先锋',
      'animals.golden_retriever': '金毛犬',
      'animals.lion': '狮子',
      'animals.snow_leopard': '雪豹',
      'animals.toucan': '巨嘴鸟',
      'animals.great_white': '大白鲨',
      'animals.axolotl': '美西螈',
      'animals.tree_frog': '树蛙',

      // Parents
      'parents.title': '\u4e3a\u4f60\u7684\u5bb6\u5ead\u800c\u8bbe\u8ba1',
      'parents.point0': '\u4e24\u79cd\u63a2\u7d22\u65b9\u5f0f \u2014 <strong>\u5f00\u542f\u6717\u8bfb</strong>\u72ec\u7acb\u63a2\u7d22\uff0c\u6216<strong>\u5173\u95ed\u6717\u8bfb</strong>\u4e00\u8d77\u9605\u8bfb',
      'parents.point1': '\u8f7b\u89e6\u6717\u8bfb\uff0c<strong>\u65e0\u9700\u8bc6\u5b57</strong>',
      'parents.point2': '\u9002\u9f84\u5185\u5bb9\uff0c\u9488\u5bf9<strong>\u5c0f\u5c0f\u63a2\u7d22\u5bb6\uff085 \u5c81\u4ee5\u4e0b\uff09</strong>\u548c<strong>\u5e74\u8f7b\u63a2\u7d22\u5bb6\uff085 \u5c81\u53ca\u4ee5\u4e0a\uff09</strong>',
      'parents.point3': '\u5b69\u5b50\u53ef\u4ee5<strong>\u5b89\u5168\u72ec\u7acb\u5730\u63a2\u7d22</strong>',
      'parents.point4': '<strong>支持 5 种语言</strong>——用您孩子的母语学习，或用来巩固他们正在学习的语言。',
      'parents.point5': '<strong>\u65e0\u5e7f\u544a\u3001\u65e0\u5916\u90e8\u94fe\u63a5\u3001\u65e0\u793e\u4ea4\u529f\u80fd</strong>',

      // Signup
      'signup.title': '早期探险家专属优惠',
      'signup.desc': '留下邮箱，我们将发送<strong>专属欢迎优惠</strong>。仅此一封——感谢您的提前支持。',
      'signup.placeholder': '\u8f93\u5165\u7535\u5b50\u90ae\u7bb1',
      'signup.button': '立即订阅',
      'signup.success': '您已加入！请查收邮件——欢迎优惠即将送达。',
      'signup.error': '\u51fa\u9519\u4e86\uff0c\u8bf7\u91cd\u8bd5\uff01',

      // Footer
      'footer.privacy': '\u9690\u79c1\u653f\u7b56',
      'footer.contact': '\u8054\u7cfb\u6211\u4eec',
      'footer.about': '\u5173\u4e8e',
      'footer.terms': '服务条款',
      'about.eyebrow': 'App 背后',
      'about.title': '我们为什么打造野生地图集',
      'about.body': '你好——我是 Josh。野生地图集起初只是我为自己的孩子 Zuzu 和 Lurian 做的一款应用。完整的故事值得一个独立的页面。',
      'about.signoff': '— Josh',
      'about.cta': '阅读创始人来信 →',
      'about.letter': '<p><em>创始人来信目前仅提供英文版本。中文翻译即将推出。</em></p>',
      'about.metadesc': '我们为什么打造野生地图集。创始人 Josh Vincent 关于屏幕时间、好奇心与培养探险家的一封信。',

      // Hero platform line + brand pillars
      'hero.platforms': '2026 年 6 月起支持 iPhone 与 iPad',
      'brand.eyebrow': '我们的立场',
      'brand.title': '用信念打造，而非堆叠功能',
      'brand.pillar1.title': '好奇胜过多巴胺',
      'brand.pillar1.desc': '我们做的应用，目标是让孩子放下手机时比拿起时更有好奇心——而不是更黏在屏幕上。',
      'brand.pillar2.title': '孩子主导，不靠算法',
      'brand.pillar2.desc': '没有推荐引擎。没有自动播放。只有一个好奇的孩子，自己决定下一步去探索什么。',
      'brand.pillar3.title': '无需教室的教育',
      'brand.pillar3.desc': '真实的事实，像纪录片一样讲述，围绕孩子真正会问的问题展开。没有练习，没有评分，没有伪装成课程的内容。',
      'brand.pillar4.title': '自豪，而非愧疚',
      'brand.pillar4.desc': '大多数儿童应用是为了对抗家长而设计。这一款是与家长一起设计——让你交给孩子时，心里踏实。',
      'footer.copy': '\u00a9 2026 \u91ce\u751f\u5730\u56fe\u96c6\u3002\u4fdd\u7559\u6240\u6709\u6743\u5229\u3002',

      // Legal pages
      'legal.eyebrow': '法律信息',
      'legal.backhome': '返回野生地图集',
      'legal.disclaimer': '中文翻译仅供参考。英文版本为正式版本。',
      'legal.privacy.title': '隐私政策',
      'legal.privacy.metadesc': '野生地图集隐私政策。我们如何收集、使用和保护您的信息。',
      'legal.terms.title': '服务条款',
      'legal.terms.metadesc': '野生地图集服务条款。使用野生地图集应用时您的协议。',

      // Support page
      'footer.support': '支持',
      'support.eyebrow': '帮助',
      'support.title': '支持',
      'support.metadesc': '野生地图集的支持。联系我们、常见问题，以及为使用野生地图集 iOS 应用的家长提供的帮助。',

      // Age Suitability page
      'footer.agesuitability': '年龄适宜性',
      'agesuitability.eyebrow': '致家庭',
      'agesuitability.title': '年龄适宜性',
      'agesuitability.metadesc': '野生地图集的年龄适宜性。专为 3 至 12 岁的孩子设计。应用内有什么、没有什么，以及我们如何看待儿童内容。',

      // FAQ (structured data)
      'faq.q1': '\u91ce\u751f\u5730\u56fe\u96c6\u9002\u5408\u4ec0\u4e48\u5e74\u9f84\u7684\u5b69\u5b50\uff1f',
      'faq.a1': '\u91ce\u751f\u5730\u56fe\u96c6\u4e13\u4e3a 2 \u5c81\u53ca\u4ee5\u4e0a\u7684\u513f\u7ae5\u8bbe\u8ba1\uff0c\u6709\u4e24\u79cd\u5e74\u9f84\u6a21\u5f0f\uff1a\u5c0f\u5c0f\u63a2\u7d22\u5bb6\uff085 \u5c81\u4ee5\u4e0b\uff09\u6709\u56fe\u7247\u6d4b\u9a8c\uff0c\u5e74\u8f7b\u63a2\u7d22\u5bb6\uff085 \u5c81\u53ca\u4ee5\u4e0a\uff09\u6709\u8bc6\u5b57\u6311\u6218\u3002',
      'faq.q2': '\u91ce\u751f\u5730\u56fe\u96c6\u514d\u8d39\u5417\uff1f',
      'faq.a2': '野生地图集免费下载，包含 3 个免费动物包（Happy Hounds、Cool Cats 和 Cozy Critters）。其他动物包每个¥28，或购买 Explorer Pass（¥148）解锁全部内容——包括未来新增的动物包。',
      'faq.q3': '\u6211\u7684\u5b69\u5b50\u4e0d\u8bc6\u5b57\u4e5f\u80fd\u72ec\u7acb\u4f7f\u7528\u91ce\u751f\u5730\u56fe\u96c6\u5417\uff1f',
      'faq.a3': '\u53ef\u4ee5\uff01\u91ce\u751f\u5730\u56fe\u96c6\u6709\u8f7b\u89e6\u6717\u8bfb\u529f\u80fd\u3002\u5b69\u5b50\u8f7b\u89e6\u4efb\u4f55\u6587\u5b57\uff0c\u6e29\u6696\u53cb\u597d\u7684\u58f0\u97f3\u5c31\u4f1a\u6717\u8bfb\u51fa\u6765\u2014\u2014\u975e\u5e38\u9002\u5408\u4e0d\u8bc6\u5b57\u7684\u5b69\u5b50\u72ec\u7acb\u63a2\u7d22\u3002',
      'faq.q4': '\u91ce\u751f\u5730\u56fe\u96c6\u5bf9\u5b69\u5b50\u5b89\u5168\u5417\uff1f',
      'faq.a4': '\u7edd\u5bf9\u5b89\u5168\u3002\u91ce\u751f\u5730\u56fe\u96c6\u65e0\u5e7f\u544a\u3001\u65e0\u5916\u90e8\u94fe\u63a5\u3001\u65e0\u793e\u4ea4\u529f\u80fd\u3002\u5b83\u7684\u8bbe\u8ba1\u8ba9\u5bb6\u957f\u53ef\u4ee5\u653e\u5fc3\u628a\u8bbe\u5907\u4ea4\u7ed9\u5b69\u5b50\uff0c\u5b69\u5b50\u53ef\u4ee5\u81ea\u5df1\u5bfc\u822a\u4e00\u5207\u3002'
    }

  }
};
