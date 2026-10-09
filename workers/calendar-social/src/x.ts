// X API: OAuth 1.0a user context. Media via v1.1 upload (simple for images,
// INIT/APPEND/FINALIZE for video), tweet via POST /2/tweets.
import type { Env, Result, Social } from "./types";

const enc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

async function hmacSha1(key: string, data: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

/** `signParams` = query/urlencoded-form params only. JSON and multipart bodies are NOT signed. */
export async function oauthHeader(env: Env, method: string, url: string, signParams: Record<string, string> = {}): Promise<string> {
  const oauth: Record<string, string> = {
    oauth_consumer_key: env.X_API_KEY,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: env.X_ACCESS_TOKEN,
    oauth_version: "1.0",
  };
  const all = { ...signParams, ...oauth };
  const paramStr = Object.keys(all).sort().map((k) => `${enc(k)}=${enc(all[k])}`).join("&");
  const base = [method.toUpperCase(), enc(url.split("?")[0]), enc(paramStr)].join("&");
  oauth.oauth_signature = await hmacSha1(`${enc(env.X_API_SECRET)}&${enc(env.X_ACCESS_SECRET)}`, base);
  return "OAuth " + Object.keys(oauth).sort().map((k) => `${enc(k)}="${enc(oauth[k])}"`).join(", ");
}

const UPLOAD = "https://upload.twitter.com/1.1/media/upload.json";
const META = "https://upload.twitter.com/1.1/media/metadata/create.json";

async function xFetch(env: Env, method: string, url: string, signParams: Record<string, string>, body?: BodyInit, json = false): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: { Authorization: await oauthHeader(env, method, url, signParams), ...(json ? { "Content-Type": "application/json" } : {}) },
    body,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`X ${new URL(url).pathname} ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function download(url: string): Promise<{ bytes: ArrayBuffer; type: string }> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${url}: ${r.status}`);
  return { bytes: await r.arrayBuffer(), type: r.headers.get("content-type") ?? "application/octet-stream" };
}

async function uploadImage(env: Env, src: string, alt: string): Promise<string> {
  const { bytes, type } = await download(src);
  const form = new FormData();
  form.append("media", new Blob([bytes], { type }), "image");
  form.append("media_category", "tweet_image");
  const r = await xFetch(env, "POST", UPLOAD, {}, form);
  const id: string = r.media_id_string;
  if (alt) await xFetch(env, "POST", META, {}, JSON.stringify({ media_id: id, alt_text: { text: alt.slice(0, 1000) } }), true);
  return id;
}

/** urlencoded form calls: body fields are part of the OAuth signature. */
const form = (env: Env, params: Record<string, string>) =>
  xFetch(env, "POST", UPLOAD, params, new URLSearchParams(params));

async function uploadVideo(env: Env, src: string): Promise<string> {
  const { bytes } = await download(src);
  const init = await form(env, {
    command: "INIT", total_bytes: String(bytes.byteLength), media_type: "video/mp4", media_category: "tweet_video",
  });
  const id: string = init.media_id_string;
  const CHUNK = 4 * 1024 * 1024;
  for (let i = 0, off = 0; off < bytes.byteLength; i++, off += CHUNK) {
    const f = new FormData(); // multipart bodies are not signed
    f.append("command", "APPEND");
    f.append("media_id", id);
    f.append("segment_index", String(i));
    f.append("media", new Blob([bytes.slice(off, off + CHUNK)]), "chunk");
    await xFetch(env, "POST", UPLOAD, {}, f);
  }
  let fin = await form(env, { command: "FINALIZE", media_id: id });
  for (let i = 0; fin.processing_info && i < 30; i++) {
    const st = fin.processing_info.state;
    if (st === "succeeded") break;
    if (st === "failed") throw new Error(`X video processing failed: ${JSON.stringify(fin.processing_info.error)}`);
    await new Promise((r) => setTimeout(r, Math.max(1, fin.processing_info.check_after_secs ?? 3) * 1000));
    const q = { command: "STATUS", media_id: id };
    fin = await xFetch(env, "GET", `${UPLOAD}?${new URLSearchParams(q)}`, q); // query params are signed
  }
  return id;
}

export async function postX(env: Env, s: Social, text: string): Promise<Result> {
  const ids: string[] = [];
  if (s.video) ids.push(await uploadVideo(env, s.video));
  else for (const img of s.images.slice(0, 4)) ids.push(await uploadImage(env, img.src, img.alt));
  const r = await xFetch(env, "POST", "https://api.x.com/2/tweets", {}, JSON.stringify({ text, media: { media_ids: ids } }), true);
  const id = r.data?.id as string;
  return { platform: "x", ok: true, id, url: `https://x.com/i/status/${id}` };
}
