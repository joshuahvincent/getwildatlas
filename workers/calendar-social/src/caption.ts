import templates from "../templates.json";
import type { Platform, Social } from "./types";

// Subset of the banned list in docs/agents/MARKETING_SOCIAL_DISTRIBUTION_AGENT.md
// (the doc itself says "etc." — the full list is in the Brand Bible; extend here).
// Fail closed: any hit blocks the whole post.
const BANNED = /\b(educational|curriculum|STEM|award-winning|screen time done right|did you know\??|excited to announce|limited time|click here|act now)\b/i;
const COMPETITORS = /\b(khan academy kids|toca boca|sago mini|abcmouse|pbs kids|pok pok)\b/i;

export const X_LIMIT = 280;
const X_URL_LEN = 23; // t.co wraps every URL to 23 chars

export function checkText(text: string): string | null {
  const b = text.match(BANNED) ?? text.match(COMPETITORS);
  return b ? `banned/competitor term: "${b[0]}"` : null;
}

/** X counts every URL as 23 chars regardless of its real length. */
export function xLength(text: string): number {
  return text.replace(/https?:\/\/\S+/g, "x".repeat(X_URL_LEN)).length;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const tag = (s: string) => "#" + s.replace(/[^A-Za-z0-9 ]+/g, "").split(/\s+/).filter(Boolean).map(cap).join("");
const firstSentence = (s: string) => (s.match(/^.*?[.!?](?=\s|$)/) ?? [s])[0];

export function variantIndex(iso: string): number {
  return Math.floor(Date.parse(iso + "T00:00:00Z") / 86400000) % 3;
}

function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{([A-Z_0-9]+)\}/g, (_, k) => vars[k] ?? "");
}

export function buildCaption(p: Platform, s: Social, iso: string): string {
  const v = variantIndex(iso);
  const hashtags = [tag(s.day), tag(s.animal), ...templates.hashtagsFixed].slice(0, 5).join(" ");
  const base: Record<string, string> = {
    DAY: s.day, ANIMAL: s.animal, ANIMAL_CAP: cap(s.animal), PACK: s.pack ?? "",
    PAGE: p === "fb" ? s.pageUrl.replace(/^https?:\/\//, "") : s.pageUrl,
    FACT_1: s.facts[0] ?? "", FACT_2: s.facts[1] ?? "", FACT_3: s.facts[2] ?? "",
    HASHTAGS: hashtags,
  };
  const withUtm = (u: string, medium: string) => `${u}&utm_source=${p}&utm_medium=${medium}&utm_campaign=${s.campaign}`;
  const link = withUtm(s.appUrl, "social");
  const line = fill(s.pack ? templates.appLine : templates.appLineNoPack, base);
  // No real awareness day ("Wild Atlas Spotlight"): don't imply a holiday in the day-name frames.
  const spotlight = s.official === false || /spotlight/i.test(s.day);
  const greet = (pageGreeting: string) =>
    fill(spotlight && v !== 0 ? templates.greetingSpotlight : templates.greetings[v], { ...base, PAGE_GREETING: pageGreeting });

  const build = (pageGreeting: string) => fill(templates[p][v], {
    ...base, GREETING: greet(pageGreeting), LINK: link, APPLINE: line,
    APPLINE_IG: line, // IG: no URLs allowed in captions
  }).replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trim();

  if (p !== "x") return build(s.greeting);
  // X: ≤280. Shrink the page greeting to its first sentence if needed.
  let t = build(s.greeting);
  if (xLength(t) > X_LIMIT) t = build(firstSentence(s.greeting));
  return t;
}
