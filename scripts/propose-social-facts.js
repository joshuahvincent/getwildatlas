#!/usr/bin/env node
// One-off helper for docs/CALENDAR_SOCIAL_WORKER.md Phase 1: proposes three
// `social.facts` per calendar page (first sentences that are bold or contain a
// digit, copied verbatim). Writes a review file — it never edits pages.
// Josh approves in bulk, then `--apply` writes the approved list to front matter.
//   node scripts/propose-social-facts.js            → scripts/social-facts-proposals.json
//   node scripts/propose-social-facts.js --apply    → writes social.facts into pages
const fs = require("fs");
const path = require("path");
const { plain } = require("../lib/calendar-social.js");

const dir = path.join(__dirname, "..", "content", "calendar");
const out = path.join(__dirname, "social-facts-proposals.json");

function propose(raw) {
  const body = raw.replace(/^---[\s\S]*?\n---\n/, "").replace(/\{%[\s\S]*?%\}/g, "");
  const sentences = body.split(/\n+/).flatMap((l) => l.match(/[^.!?]+[.!?]+["')\]*]*/g) || []).map((s) => s.trim());
  const pick = sentences.filter((s) => s.length >= 12 && s.length <= 140 && !s.endsWith("?") && (/\*\*/.test(s) || /\d/.test(s)));
  return [...new Set(pick.map(plain))].slice(0, 3);
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
if (process.argv.includes("--apply")) {
  const approved = JSON.parse(fs.readFileSync(out, "utf8"));
  for (const [slug, facts] of Object.entries(approved)) {
    const p = path.join(dir, slug + ".md");
    let s = fs.readFileSync(p, "utf8");
    if (/^social:/m.test(s) || facts.length < 3) continue;
    const block = "social:\n  facts:\n" + facts.map((f) => `    - ${JSON.stringify(f)}\n`).join("");
    s = s.replace(/^animalDay:/m, block + "animalDay:");
    fs.writeFileSync(p, s);
  }
} else {
  const res = {};
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    if (!/^animalDay:/m.test(raw)) continue;
    res[f.replace(/\.md$/, "")] = propose(raw);
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 2) + "\n");
  const short = Object.entries(res).filter(([, v]) => v.length < 3).length;
  console.log(`${Object.keys(res).length} pages, ${short} with <3 proposals → ${out}`);
}
