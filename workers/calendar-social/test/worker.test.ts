import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCaption, checkText, xLength } from "../src/caption";
import { pacificNow } from "../src/index";
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
    assert.ok(!/https?:\/\//.test(ig), "IG has no URL");
    assert.ok(ig.includes("link in bio"));
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
