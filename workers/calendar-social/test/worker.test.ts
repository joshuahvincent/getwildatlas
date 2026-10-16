import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCaption, checkText, xLength } from "../src/caption";
import { pacificNow, todaysSocial } from "../src/index";
import { oauthHeader } from "../src/x";
import type { Env, Social } from "../src/types";

const social: Social = {
  slug: "world-octopus-day", day: "World Octopus Day", official: true, animal: "giant Pacific octopus", article: "a",
  appId: "octopus", pack: "Ocean Creatures", campaign: "world_octopus_day_2026",
  greeting: "Happy World Octopus Day! It's on October 8 — the eighth day of the month, for an animal with eight arms. So today we're diving into the North Pacific to meet the biggest octopus we know of: the giant Pacific octopus.",
  facts: ["It has three hearts.", "Its blood is blue, not red like ours.", "Every arm is covered in suckers, and every sucker can taste."],
  images: [{ src: "https://wildatlasapp.com/a.jpg", alt: "a" }], video: null,
  pageUrl: "https://wildatlasapp.com/calendar/world-octopus-day/",
  appUrl: "https://apps.apple.com/us/app/wild-atlas/id6761081031?ct=world_octopus_day_2026",
};

test("captions respect platform rules for all three variants", () => {
  for (const iso of ["2026-10-08", "2026-10-09", "2026-10-10"]) {
    const ig = buildCaption("ig", social, iso);
    assert.ok(!/https?:\/\//.test(ig), "IG prints addresses as plain text, no scheme");
    assert.ok(ig.includes("wildatlasapp.com/calendar/world-octopus-day/") && ig.includes("link in bio"));
    assert.ok(ig.split("#").length - 1 <= 5);
    assert.ok(ig.includes("#WorldOctopusDay"));
    const x = buildCaption("x", social, iso);
    assert.ok(xLength(x) <= 280, `x ${xLength(x)}`);
    assert.ok(x.includes("id6761081031"));
    const fb = buildCaption("fb", social, iso);
    assert.ok(fb.includes("wildatlasapp.com/calendar/world-octopus-day/") && fb.includes("apps.apple.com"));
    for (const t of [ig, x, fb]) assert.equal(checkText(t), null);
  }
});

test("banned vocabulary and competitors fail closed", () => {
  assert.ok(checkText("Did you know? octopuses have three hearts"));
  assert.ok(checkText("a fun educational app"));
  assert.ok(checkText("better than Toca Boca"));
});

test("pacificNow handles PDT and PST", () => {
  assert.deepEqual(pacificNow(new Date("2026-10-09T13:05:00Z")), { date: "2026-10-09", hour: 6, minute: 5 });
  assert.deepEqual(pacificNow(new Date("2026-12-09T14:05:00Z")), { date: "2026-12-09", hour: 6, minute: 5 });
  assert.deepEqual(pacificNow(new Date("2026-10-10T00:35:00Z")), { date: "2026-10-09", hour: 17, minute: 35 });
});

test("OAuth1 header carries every required field", async () => {
  const env = { X_API_KEY: "ck", X_API_SECRET: "cs", X_ACCESS_TOKEN: "at", X_ACCESS_SECRET: "as" } as Env;
  const h = await oauthHeader(env, "POST", "https://api.x.com/2/tweets");
  assert.match(h, /^OAuth /);
  for (const k of ["oauth_consumer_key", "oauth_nonce", "oauth_signature", "oauth_signature_method", "oauth_timestamp", "oauth_token", "oauth_version"]) assert.ok(h.includes(k));
});

test("spotlight days never claim a holiday; official days use the day-name frames", () => {
  const spot = { ...social, day: "Wild Atlas Spotlight", official: false };
  // variantIndex: 10-08 → 1, 10-09 → 2, 10-10 → 0 (page greeting)
  for (const iso of ["2026-10-08", "2026-10-09"]) {
    const t = buildCaption("fb", spot, iso);
    assert.ok(t.startsWith("Meet the giant Pacific octopus."), t);
    assert.ok(!t.includes("Spotlight"));
  }
  const official = [buildCaption("fb", social, "2026-10-08"), buildCaption("fb", social, "2026-10-09")];
  assert.ok(official[0].startsWith("World Octopus Day belongs to the giant Pacific octopus."));
  assert.ok(official[1].startsWith("On World Octopus Day, say hello to the giant Pacific octopus."));
});

const lite: Social = {
  slug: "international-sawfish-day", kind: "lite", day: "International Sawfish Day", official: true, animal: "", article: "a",
  appId: null, pack: null, campaign: "day_international_sawfish_day",
  greeting: "Happy International Sawfish Day! Today we celebrate a very unusual ocean animal with a long snout shaped like a saw.",
  facts: ["A sawfish is a kind of ray, and rays are related to sharks.", "The saw is called a rostrum, and it is covered in tiny sensors for finding food.", "Sawfish swim in warm, shallow waters, and some visit rivers."],
  images: [{ src: "https://wildatlasapp.com/a.jpg", alt: "a" }], video: null,
  appLine: "Sawfish are not in Wild Atlas yet. You can meet their ray cousin, the Manta Ray, in the Ocean Creatures pack.",
  pageUrl: "https://wildatlasapp.com/calendar/international-sawfish-day/",
  appUrl: "https://apps.apple.com/us/app/wild-atlas/id6761081031?ct=day_international_sawfish_day",
};

test("lite days: page greeting leads, no animal/pack claims, platform rules hold on every variant", () => {
  for (const iso of ["2026-10-15", "2026-10-16", "2026-10-17"]) {
    const fb = buildCaption("fb", lite, iso);
    assert.ok(fb.startsWith("Happy International Sawfish Day!"), fb);
    assert.ok(fb.includes("Sawfish are not in Wild Atlas yet.") && fb.includes("apps.apple.com"));
    assert.ok(!/where to see one|belongs to the|Meet the/.test(fb));
    const ig = buildCaption("ig", lite, iso);
    assert.ok(!/https?:\/\//.test(ig) && ig.includes("link in bio") && ig.includes("wildatlasapp.com/calendar/international-sawfish-day/"));
    assert.ok(ig.includes("#InternationalSawfishDay") && ig.split("#").length - 1 <= 5);
    const x = buildCaption("x", lite, iso);
    assert.ok(xLength(x) <= 280, `x ${xLength(x)}`);
    for (const t of [fb, ig, x]) assert.equal(checkText(t), null);
  }
});

test("animal-page captions are unchanged by the lite path", () => {
  const fb = buildCaption("fb", social, "2026-10-10");
  assert.ok(fb.includes("Read-aloud story + where to see one") && fb.includes("Giant Pacific octopus is in Wild Atlas, in Ocean Creatures."));
});

function withFeed(files: Record<string, unknown>, run: () => Promise<void>) {
  const real = globalThis.fetch;
  globalThis.fetch = (async (u: string) => {
    const path = new URL(u).pathname;
    if (path in files) return typeof files[path] === "string" ? new Response(files[path] as string, { status: 200 }) : Response.json(files[path]);
    return new Response("<!doctype html>spa", { status: 200 }); // the site's HTML fallback for unknown paths
  }) as typeof fetch;
  return run().finally(() => { globalThis.fetch = real; });
}
const feed = (featured: boolean) => ({ latest: { day: "International Sawfish Day", animal: "Sawfish", iso: "2026-10-17", url: "/calendar/international-sawfish-day/", image: "x", featured, isToday: false } });
const env = { SITE: "https://wildatlasapp.com" } as Env;

test("gate: a not-featured day posts only with a lite social.json", async () => {
  await withFeed({ "/calendar/latest.json": feed(false), "/calendar/international-sawfish-day/social.json": lite }, async () => {
    assert.equal((await todaysSocial(env, "2026-10-17")).social?.slug, "international-sawfish-day");
  });
  // today's behaviour: the SPA fallback (HTML, 200) is not a payload, so the day is skipped quietly
  await withFeed({ "/calendar/latest.json": feed(false) }, async () => {
    const r = await todaysSocial(env, "2026-10-17");
    assert.ok(r.skip && !r.social && !r.alert);
  });
  // an animal page that lost the same-date tie (not featured, no kind) never posts
  await withFeed({ "/calendar/latest.json": feed(false), "/calendar/international-sawfish-day/social.json": { ...social, kind: undefined } }, async () => {
    assert.ok((await todaysSocial(env, "2026-10-17")).skip);
  });
  // featured animal days are unchanged; wrong date is still no post
  await withFeed({ "/calendar/latest.json": feed(true), "/calendar/international-sawfish-day/social.json": social }, async () => {
    assert.ok((await todaysSocial(env, "2026-10-17")).social);
    assert.ok((await todaysSocial(env, "2026-10-18")).skip);
  });
});
