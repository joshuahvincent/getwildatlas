import type { Env, Result, Social } from "./types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Cloudflare Email Service binding (`send_email` → env.EMAIL). Failures are logged, never thrown:
 *  a broken preview email must not stop (or fake) a post. */
export async function sendEmail(env: Env, subject: string, html: string): Promise<void> {
  try {
    const m = env.EMAIL_FROM.match(/^(.*)<(.+)>$/);
    await env.EMAIL.send({
      to: env.EMAIL_TO,
      from: m ? { email: m[2].trim(), name: m[1].trim() } : env.EMAIL_FROM,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    });
  } catch (e) {
    console.error("email failed", String((e as Error).message ?? e));
  }
}

export function previewHtml(s: Social, captions: Record<string, string>, skipUrl: string, dry: boolean): string {
  const imgs = s.images.map((i) => `<img src="${esc(i.src)}" alt="${esc(i.alt)}" style="max-width:240px;margin:4px;border-radius:8px">`).join("");
  const cap = (k: string) => `<h3>${k.toUpperCase()}</h3><pre style="white-space:pre-wrap;font-family:inherit">${esc(captions[k] ?? "(not built — see issues)")}</pre>`;
  return `<h2>${esc(s.day)} — ${esc(s.animal)}</h2>
<p>${dry ? "<b>DRY RUN — nothing will be posted.</b>" : "Posts at 17:30 PT unless you skip."}${s.video ? " Video: yes." : " Photos only."}</p>
<p><a href="${esc(skipUrl)}" style="font-size:18px">⛔ Skip today's posts</a></p>
<div>${imgs}</div>${cap("fb")}${cap("ig")}${cap("x")}`;
}

export function resultsHtml(s: Social, results: Result[], dry: boolean): string {
  const rows = results.map((r) => `<li><b>${r.platform}</b>: ${r.ok ? `ok ${r.url ? `<a href="${esc(r.url)}">${esc(r.url)}</a>` : esc(r.id ?? "")}` : `<b>FAILED</b> ${esc(r.error ?? "")}`}</li>`).join("");
  return `<h2>${dry ? "[DRY RUN] " : ""}${esc(s.day)} — post results</h2><ul>${rows}</ul>`;
}
