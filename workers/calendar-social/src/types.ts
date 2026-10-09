export interface Env {
  CALENDAR_SOCIAL: KVNamespace;
  SITE: string;
  WORKER_ORIGIN: string; // public origin of this Worker, used in the email's skip link
  DRY_RUN: string;
  EMAIL_FROM: string;
  EMAIL_TO: string;
  EMAIL: SendEmail; // Cloudflare Email Service binding
  KILL_KEY: string;
  FORCE_SLUG?: string;
  META_PAGE_TOKEN: string;
  META_PAGE_ID: string;
  IG_USER_ID: string;
  X_API_KEY: string;
  X_API_SECRET: string;
  X_ACCESS_TOKEN: string;
  X_ACCESS_SECRET: string;
}

/** /calendar/<slug>/social.json — see docs/CALENDAR_SOCIAL_WORKER.md Phase 1. */
export interface Social {
  slug: string;
  day: string;
  official: boolean | null;
  animal: string;
  article: string;
  appId: string | null;
  pack: string | null;
  campaign: string;
  greeting: string;
  facts: string[];
  images: { src: string; alt: string }[];
  video: string | null;
  pageUrl: string;
  appUrl: string;
}

export interface LatestDay {
  day: string; animal: string; iso: string; url: string; image: string;
  featured: boolean; isToday: boolean;
}

export type Platform = "fb" | "ig" | "x";
export interface Result { platform: Platform; ok: boolean; id?: string; url?: string; error?: string }
