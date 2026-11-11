// One-off posts (POST /post): turn the request body into the `Social` the
// platform code consumes. Pure, so it is unit-tested without any network.
import type { Platform, Social } from "./types";

export interface AdhocBody {
  platforms: Platform[];
  captions: Partial<Record<Platform, string>>;
  images?: Partial<Record<Platform, string[]>>;
  /** One public https .mp4 used on every selected platform. */
  video?: string;
  /** Per-platform override of `video` (e.g. a different cut for X). */
  videos?: Partial<Record<Platform, string>>;
  alt?: string;
}

/** A public https URL whose path ends in .mp4 (Meta and X both fetch/download it). */
export function isMp4Url(u: unknown): u is string {
  if (typeof u !== "string") return false;
  try {
    const url = new URL(u);
    return url.protocol === "https:" && /\.mp4$/i.test(url.pathname);
  } catch { return false; }
}

/**
 * Media rules per platform when a video is present:
 *   FB  video only (the Graph API cannot mix a video and photos in one post)
 *   X   video only (X allows one video, no photos alongside it)
 *   IG  video first, then any images, as a carousel; a lone video posts as a Reel
 */
export function buildAdhocSocial(p: Platform, b: AdhocBody): { social?: Social; error?: string } {
  const video = b.videos?.[p] ?? b.video ?? null;
  if (video !== null && !isMp4Url(video)) return { error: "video must be a public https URL ending in .mp4" };
  const images = b.images?.[p] ?? [];
  if (!video && !images.length) return { error: "missing text or image" };
  const alt = b.alt ?? "";
  const kept = video && p !== "ig" ? [] : images;
  return { social: { images: kept.map((src) => ({ src, alt })), video } as unknown as Social };
}
