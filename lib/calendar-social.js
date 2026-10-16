// Builds the /calendar/<slug>/social.json payload the calendar-social Worker
// (workers/calendar-social/, docs/CALENDAR_SOCIAL_WORKER.md) reads. Pure
// extraction — facts are copied verbatim from the page, never generated.
const fs = require("fs");
const path = require("path");

const SITE = "https://wildatlasapp.com";
const APP_STORE = "https://apps.apple.com/us/app/wild-atlas/id6761081031";
const FIGURE = /\{%\s*figure\s+"([^"]+)"\s*,\s*"((?:[^"\\]|\\.)*)"/g;

const abs = (p) => (/^https?:/.test(p) ? p : SITE + p);
const plain = (s) => String(s || "")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
  .replace(/\s+/g, " ").trim();

function bodyFigures(inputPath) {
  let raw = "";
  try { raw = fs.readFileSync(inputPath, "utf8"); } catch (e) { return []; }
  const out = [];
  for (const m of raw.matchAll(FIGURE)) out.push({ src: m[1], alt: m[2].replace(/\\"/g, '"') });
  return out;
}

function socialPayload(item, animalDays, root = process.cwd()) {
  const d = item.data.animalDay;
  const slug = item.page.fileSlug;
  const entry = (animalDays.days || []).find((x) => x.slug === slug) || {};
  const figs = bodyFigures(item.inputPath);
  const cover = item.data.coverImage;
  if (cover && !figs.some((f) => f.src === cover)) {
    figs.unshift({ src: cover, alt: plain(item.data.title) });
  } else if (cover) {
    figs.sort((a, b) => (b.src === cover) - (a.src === cover)); // stable: cover first
  }
  const seen = new Set();
  const images = figs.filter((f) => !seen.has(f.src) && seen.add(f.src))
    .map((f) => ({ src: abs(f.src), alt: f.alt }));

  const pack = ((d.appCta || "").match(/\bin the ([A-Z][A-Za-z' &]*?) pack\b/) || [])[1] || null;
  const appId = entry.appId || null;
  const videoRel = appId ? `/assets/calendar-videos/${appId}.mp4` : null;
  const hasVideo = videoRel && fs.existsSync(path.join(root, videoRel));

  return {
    slug,
    day: d.dayName,
    official: entry.official === undefined ? null : entry.official,
    animal: d.animalName,
    article: d.animalArticle || "a",
    appId,
    pack,
    campaign: d.campaign,
    greeting: (item.data.social && item.data.social.greeting) || plain(d.greeting),
    facts: ((item.data.social && item.data.social.facts) || []).map(plain),
    images,
    video: hasVideo ? SITE + videoRel : null,
    pageUrl: `${SITE}/calendar/${slug}/`,
    appUrl: `${APP_STORE}?ct=${encodeURIComponent(d.campaign || slug)}`,
  };
}

// Standalone sentences only: ones that lean on the previous line mislead in a post.
const DANGLING = /^(and|but|so|together|that|those|these|this|they|them|their|it|its|he|she|then|now|also)\b/i;

// Lite ("simpleDay") pages have no app animal, so there is no pack/appId/animal
// hook. Facts are the page's own funFacts, verbatim; the app line is the page's
// own relatedApp text, verbatim (it is honest when the animal is not in the app).
function litePayload(item, animalDays) {
  const d = item.data.simpleDay;
  const slug = item.page.fileSlug;
  const entry = (animalDays.alsoCelebrated || []).find((x) => x.pageSlug === slug)
    || (animalDays.days || []).find((x) => x.slug === slug || x.pageSlug === slug) || {};
  const day = plain(String(entry.day || String(item.data.title || "").split(":")[0]).replace(/\s*\([^)]*\)\s*$/, ""));
  const override = (item.data.social && item.data.social.facts) || [];
  const facts = (override.length ? override : (d.funFacts || []).filter((f) => !DANGLING.test(plain(f)))).map(plain).slice(0, 3);
  const img = d.image && d.image.src ? d.image : (item.data.coverImage ? { src: item.data.coverImage, alt: plain(item.data.title) } : null);
  return {
    slug,
    kind: "lite",
    day,
    official: true,
    animal: "",
    article: "a",
    appId: null,
    pack: null,
    campaign: d.campaign || slug,
    greeting: (item.data.social && item.data.social.greeting) || plain(d.greeting),
    facts,
    images: img ? [{ src: abs(img.src), alt: plain(img.alt) }] : [],
    video: null,
    appLine: plain(d.relatedApp && d.relatedApp.text),
    pageUrl: `${SITE}/calendar/${slug}/`,
    appUrl: `${APP_STORE}?ct=${encodeURIComponent(d.campaign || slug)}`,
  };
}

module.exports = { socialPayload, litePayload, bodyFigures, plain };
