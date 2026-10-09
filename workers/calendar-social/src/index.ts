import { buildCaption, checkText, X_LIMIT, xLength } from "./caption";
import { previewHtml, resultsHtml, sendEmail } from "./email";
import { MetaTokenError, postFacebook, postInstagram } from "./meta";
import type { Env, LatestDay, Platform, Result, Social } from "./types";
import { postX } from "./x";

/** Current Pacific date + time parts (handles DST; no cron arithmetic). */
export function pacificNow(d = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute) };
}

async function getJson<T>(url: string): Promise<T | null> {
  const r = await fetch(url, { cf: { cacheTtl: 0 } } as RequestInit);
  return r.ok ? ((await r.json()) as T) : null;
}

/** Decide what (if anything) to post today. Returns a reason string when skipping. */
async function todaysSocial(env: Env, date: string): Promise<{ social?: Social; skip?: string; alert?: string }> {
  let slug = env.FORCE_SLUG;
  if (!slug) {
    // Compare iso to the Pacific date ourselves: `isToday` is baked at (UTC) build time.
    const feed = await getJson<{ latest: LatestDay | null }>(`${env.SITE}/calendar/latest.json`);
    const latest = feed?.latest;
    if (!latest || latest.iso !== date) return { skip: "no calendar day today" };
    if (!latest.featured) return { skip: `${latest.day} is a lite/not-featured day` };
    slug = latest.url.replace(/^\/calendar\/|\/$/g, "");
  }
  const social = await getJson<Social>(`${env.SITE}/calendar/${slug}/social.json`);
  if (!social) return { alert: `social.json missing for ${slug} — not posting` };
  if (social.images.length < 1) return { alert: `${slug}: no images in social.json — not posting` };
  if (social.facts.length < 3) return { alert: `${slug}: social.facts has ${social.facts.length}/3 facts (backfill needed) — not posting` };
  return { social };
}

const PLATFORMS: Platform[] = ["fb", "ig", "x"];

function captionsFor(social: Social, date: string): { captions: Partial<Record<Platform, string>>; problems: string[] } {
  const captions: Partial<Record<Platform, string>> = {};
  const problems: string[] = [];
  for (const p of PLATFORMS) {
    const text = buildCaption(p, social, date);
    const bad = checkText(text);
    if (bad) { problems.push(`${p}: ${bad}`); continue; }
    if (p === "x" && xLength(text) > X_LIMIT) { problems.push(`x: caption ${xLength(text)} > ${X_LIMIT}`); continue; }
    if (p === "ig" && /https?:\/\//.test(text)) { problems.push("ig: caption contains a URL"); continue; }
    captions[p] = text;
  }
  return { captions, problems };
}

async function preview(env: Env, date: string, origin: string): Promise<void> {
  if (await env.CALENDAR_SOCIAL.get(`preview:${date}`)) return;
  const t = await todaysSocial(env, date);
  if (t.alert) { await sendEmail(env, `⚠️ Calendar social: ${date}`, `<p>${t.alert}</p>`); await env.CALENDAR_SOCIAL.put(`preview:${date}`, "alerted"); return; }
  if (!t.social) { console.log(`preview ${date}: ${t.skip}`); return; }
  const { captions, problems } = captionsFor(t.social, date);
  const skipUrl = `${origin}/skip?date=${date}&key=${env.KILL_KEY}`;
  await sendEmail(env, `Calendar social preview: ${t.social.day}`,
    previewHtml(t.social, captions as Record<string, string>, skipUrl, env.DRY_RUN === "1") +
    (problems.length ? `<p><b>Blocked:</b> ${problems.join("; ")}</p>` : ""));
  await env.CALENDAR_SOCIAL.put(`preview:${date}`, JSON.stringify({ slug: t.social.slug, problems }));
}

async function publish(env: Env, date: string): Promise<void> {
  if (await env.CALENDAR_SOCIAL.get(`posted:${date}`)) return; // idempotent
  if (await env.CALENDAR_SOCIAL.get(`skip:${date}`)) { await log(env, `${date} skipped by kill switch`); return; }
  const t = await todaysSocial(env, date);
  if (t.alert) { await sendEmail(env, `⚠️ Calendar social: ${date}`, `<p>${t.alert}</p>`); await env.CALENDAR_SOCIAL.put(`posted:${date}`, JSON.stringify({ alert: t.alert })); return; }
  if (!t.social) return;
  const dry = env.DRY_RUN === "1";
  const { captions, problems } = captionsFor(t.social, date);
  const results: Result[] = problems.map((e) => ({ platform: e.slice(0, e.indexOf(":")) as Platform, ok: false, error: e }));
  const run: Record<Platform, () => Promise<Result>> = {
    fb: () => postFacebook(env, t.social!, captions.fb!),
    ig: () => postInstagram(env, t.social!, captions.ig!),
    x: () => postX(env, t.social!, captions.x!),
  };
  for (const p of PLATFORMS) { // FB, IG, X in that order; one failing never blocks the others; no retries
    if (!captions[p]) continue;
    if (dry) { results.push({ platform: p, ok: true, id: "dry-run" }); continue; }
    try { results.push(await run[p]()); }
    catch (e) {
      results.push({ platform: p, ok: false, error: String((e as Error).message) });
      if (e instanceof MetaTokenError) await sendEmail(env, "🔑 Meta token expired", `<p>${(e as Error).message}</p>`);
    }
  }
  await env.CALENDAR_SOCIAL.put(`posted:${date}`, JSON.stringify({ dry, slug: t.social.slug, results }));
  await log(env, `${date} ${t.social.slug} ${dry ? "DRY " : ""}${results.map((r) => `${r.platform}=${r.ok ? "ok" : "FAIL"}`).join(" ")}`);
  await sendEmail(env, `${results.some((r) => !r.ok) ? "⚠️ " : ""}Calendar social posted: ${t.social.day}`, resultsHtml(t.social, results, dry));
}

async function log(env: Env, line: string): Promise<void> {
  const prev = (await env.CALENDAR_SOCIAL.get("log")) ?? "";
  await env.CALENDAR_SOCIAL.put("log", (prev + `${new Date().toISOString()} ${line}\n`).split("\n").slice(-200).join("\n"));
}

export default {
  async scheduled(_c: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const { date, hour, minute } = pacificNow();
    const origin = env.WORKER_ORIGIN;
    if (hour === 6 && minute < 30) ctx.waitUntil(preview(env, date, origin));
    else if (hour === 17 && minute >= 30) ctx.waitUntil(publish(env, date));
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    const u = new URL(req.url);
    if (u.pathname === "/skip") {
      const date = u.searchParams.get("date") ?? "";
      if (u.searchParams.get("key") !== env.KILL_KEY || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return new Response("forbidden", { status: 403 });
      await env.CALENDAR_SOCIAL.put(`skip:${date}`, "1", { expirationTtl: 60 * 60 * 24 * 7 });
      await log(env, `${date} skip requested`);
      return new Response(`Skipped ${date}. Nothing will post.`, { status: 200 });
    }
    return new Response("calendar-social", { status: 200 });
  },
} satisfies ExportedHandler<Env>;
