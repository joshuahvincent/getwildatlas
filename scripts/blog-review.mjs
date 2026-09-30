// Blog review loop — run daily by .github/workflows/blog-review.yml.
//
// For every post in content/blog/ with `status: scheduled`:
//   - 5 days (or fewer) before its date: open a review issue assigned to the
//     reviewer (GitHub emails them), with the preview link and how to approve
//     or request changes.
//   - 1 day before, still not approved: post a last-call comment.
//   - on/after its date, still not approved: comment that it was skipped and
//     label the issue `blog-skipped`. The post stays hidden; nothing publishes
//     without approval.
//
// Approval itself is handled by blog-approve.yml ("approve" comment).
// Requires: GH_TOKEN (issues: write), `gh` CLI. Dates are Pacific time.

import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const REVIEWER = process.env.BLOG_REVIEWER || "joshuahvincent";
const PREVIEW_BASE = "https://preview.wildatlaswebsite.pages.dev";
const LEAD_DAYS = 5;
const DRY_RUN = process.argv.includes("--dry-run");

function todayPacific() {
  const s = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  return new Date(s + "T00:00:00Z");
}
function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
function gh(args, input) {
  if (DRY_RUN && !(args[0] === "issue" && args[1] === "list")) {
    console.log("[dry-run] gh", args.join(" "));
    return "[]";
  }
  return execFileSync("gh", args, { encoding: "utf8", input });
}

const today = todayPacific();
const openIssues = JSON.parse(
  gh(["issue", "list", "--label", "blog-review", "--state", "open", "--json", "number,title", "--limit", "200"])
);

for (const file of readdirSync("content/blog").filter((f) => f.endsWith(".md"))) {
  const fm = frontMatter(readFileSync(`content/blog/${file}`, "utf8"));
  if (fm.status !== "scheduled" || !fm.date) continue;

  const date = new Date(fm.date.slice(0, 10) + "T00:00:00Z");
  const daysOut = Math.round((date - today) / 86400000);
  const slug = file.replace(/\.md$/, "");
  const tag = `[${slug}]`;
  const issue = openIssues.find((i) => i.title.includes(tag));
  const preview = PREVIEW_BASE + (fm.permalink || `/blog/${slug}/`);
  const when = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

  if (daysOut <= LEAD_DAYS && daysOut > 0 && !issue) {
    const body = `@${REVIEWER} — this blog post is scheduled for **${when}** (${daysOut} day${daysOut === 1 ? "" : "s"} away) and needs your OK before it goes live.

**Read it:** ${preview}
_(Review copy of the site — the post isn't on wildatlasapp.com until you approve.)_

**To approve:** reply to this email (or comment here) with just the word **approve**. It will go live automatically at 6am Pacific on ${when}.

**To request changes:** reply with what you'd like changed. Then either:
- open **Claude Code** (desktop app → Code tab) on the \`Codex Projects\` folder and say:
  > Apply Josh's comments on getwildatlas issue #<this issue number> to the blog post \`content/blog/${file}\`, re-run the naturalist and child-psych gates on the changed lines, push the fix, and reply on the issue with the preview link.
- or paste the post link into any Claude chat and edit it together there, then ask Claude to push the change.

When you're happy, reply **approve**.

**If you do nothing:** it will **not** publish. You'll get a last call the day before; after the date it's marked skipped.

---
File: \`content/blog/${file}\` · Title: ${fm.title || slug}`;
    gh(["issue", "create", "--title", `Blog review: ${fm.title || slug} — ${when} ${tag}`, "--label", "blog-review", "--assignee", REVIEWER, "--body-file", "-"], body);
    console.log(`opened review issue for ${slug} (${daysOut}d)`);
  } else if (issue && daysOut === 1) {
    gh(["issue", "comment", String(issue.number), "--body-file", "-"], `@${REVIEWER} last call — this goes live **tomorrow at 6am Pacific** only if you reply **approve** today. Preview: ${preview}`);
  } else if (issue && daysOut <= 0) {
    gh(["issue", "comment", String(issue.number), "--body-file", "-"], `@${REVIEWER} the date passed without approval, so this post was **skipped** (it's still hidden). To publish it late, reply **approve** and it will go live at the next daily build.`);
    gh(["issue", "edit", String(issue.number), "--add-label", "blog-skipped"]);
  }
}
