// Facebook Page + Instagram publishing via the Graph API. The Page token
// (non-expiring when derived from a long-lived user token) works for both.
import type { Env, Result, Social } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

export class MetaTokenError extends Error {}

async function graph(env: Env, path: string, params: Record<string, string>, method = "POST"): Promise<any> {
  const body = new URLSearchParams({ ...params, access_token: env.META_PAGE_TOKEN });
  const res = await fetch(method === "GET" ? `${GRAPH}/${path}?${body}` : `${GRAPH}/${path}`, {
    method, ...(method === "GET" ? {} : { body }),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error ?? {};
    if (e.code === 190) throw new MetaTokenError(`Meta token invalid (code 190): ${e.message}`);
    throw new Error(`Meta ${path} failed: ${e.message ?? res.status} (code ${e.code ?? "?"})`);
  }
  return json;
}

/** v1: photos only (the API can't mix video + photos in one FB post). */
export async function postFacebook(env: Env, s: Social, caption: string): Promise<Result> {
  const ids: string[] = [];
  for (const img of s.images.slice(0, 10)) {
    const r = await graph(env, `${env.META_PAGE_ID}/photos`, { url: img.src, published: "false", alt_text_custom: img.alt });
    ids.push(r.id);
  }
  const post = await graph(env, `${env.META_PAGE_ID}/feed`, {
    message: caption,
    attached_media: JSON.stringify(ids.map((id) => ({ media_fbid: id }))),
  });
  return { platform: "fb", ok: true, id: post.id, url: `https://www.facebook.com/${post.id}` };
}

async function waitFinished(env: Env, containerId: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    const r = await graph(env, containerId, { fields: "status_code,status" }, "GET");
    if (r.status_code === "FINISHED") return;
    if (r.status_code === "ERROR" || r.status_code === "EXPIRED") throw new Error(`IG container ${containerId}: ${r.status_code} ${r.status ?? ""}`);
    await new Promise((res) => setTimeout(res, 4000));
  }
  throw new Error(`IG container ${containerId} not FINISHED in time`);
}

/** Carousel: video first when present, then images in page order (max 10 items). */
export async function postInstagram(env: Env, s: Social, caption: string): Promise<Result> {
  const items: Record<string, string>[] = [];
  if (s.video) items.push({ media_type: "VIDEO", video_url: s.video });
  for (const img of s.images) items.push({ image_url: img.src, alt_text: img.alt });
  const children: string[] = [];
  for (const it of items.slice(0, 10)) {
    const c = await graph(env, `${env.IG_USER_ID}/media`, { ...it, is_carousel_item: "true" });
    await waitFinished(env, c.id);
    children.push(c.id);
  }
  // The API requires ≥2 carousel children; a single item posts as a plain image/video.
  let container: { id: string };
  if (children.length >= 2) {
    container = await graph(env, `${env.IG_USER_ID}/media`, { media_type: "CAROUSEL", children: children.join(","), caption });
  } else {
    const it = items[0];
    container = await graph(env, `${env.IG_USER_ID}/media`, { ...it, caption, ...(it.media_type === "VIDEO" ? { media_type: "REELS" } : {}) });
  }
  await waitFinished(env, container.id);
  const pub = await graph(env, `${env.IG_USER_ID}/media_publish`, { creation_id: container.id });
  const info = await graph(env, pub.id, { fields: "permalink" }, "GET").catch(() => ({}));
  return { platform: "ig", ok: true, id: pub.id, url: info.permalink };
}
