import type { Env, Result, Social } from "./types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** No email (decided 2026-10-09): alerts and results go to the KV `log` (read by the weekly check)
 *  and, for the day's captions, to the /preview page. Never throws. */
export async function notify(env: Env, subject: string, html: string): Promise<void> {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
  console.log(`[notify] ${subject} — ${text}`);
  try {
    const prev = (await env.CALENDAR_SOCIAL.get("log")) ?? "";
    await env.CALENDAR_SOCIAL.put("log", (prev + `${new Date().toISOString()} NOTE ${subject} — ${text}\n`).split("\n").slice(-200).join("\n"));
  } catch (e) {
    console.error("notify failed", String((e as Error).message ?? e));
  }
}

export function previewHtml(s: Social, captions: Record<string, string>, skipUrl: string, dry: boolean): string {
  const imgs = s.images.map((i) => `<img src="${esc(i.src)}" alt="${esc(i.alt)}" style="max-width:240px;margin:4px;border-radius:8px">`).join("");
  const cap = (k: string) => `<h3>${k.toUpperCase()}</h3><pre style="white-space:pre-wrap;font-family:inherit">${esc(captions[k] ?? "(not built — see issues)")}</pre>`;
  return `<h2>${esc(s.day)} — ${esc(s.animal)}</h2>
<p>${dry ? "<b>DRY RUN — nothing will be posted.</b>" : "Posts at 17:30 PT unless skipped."}${s.video ? " Video: yes." : " Photos only."}</p>
<p><a href="${esc(skipUrl)}" style="font-size:18px">⛔ Skip today's posts</a></p>
<div>${imgs}</div>${cap("fb")}${cap("ig")}${cap("x")}`;
}

export function resultsHtml(s: Social, results: Result[], dry: boolean): string {
  const rows = results.map((r) => `<li><b>${r.platform}</b>: ${r.ok ? `ok ${r.url ? `<a href="${esc(r.url)}">${esc(r.url)}</a>` : esc(r.id ?? "")}` : `<b>FAILED</b> ${esc(r.error ?? "")}`}</li>`).join("");
  return `<h2>${dry ? "[DRY RUN] " : ""}${esc(s.day)} — post results</h2><ul>${rows}</ul>`;
}
