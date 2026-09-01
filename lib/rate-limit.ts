export const INBOX_ANON_MAX = 10;
export const INBOX_AUTH_MAX = 60;
export const INBOX_RATE_WINDOW_MS = 60 * 60 * 1000;
export const PUBLIC_RATE_WINDOW_MS = 60 * 60 * 1000;
export const INTAKE_PUBLIC_MAX = 5;
export const STATUS_PUBLIC_MAX = 10;
export const REPLY_PUBLIC_MAX = 8;
export const CHECKOUT_PUBLIC_MAX = 8;

const IP_KEY_RE = /[^A-Za-z0-9.:_-]/g;
const PUBLIC_BUCKETS = ["intake", "status", "reply", "checkout"] as const;
export type PublicRateBucket = (typeof PUBLIC_BUCKETS)[number];

export type RateLimitStore = Map<string, number[]>;

export type HeaderReader = {
  get(name: string): string | null;
};

export function sanitizeRateIp(value: unknown): string {
  return (typeof value === "string" ? value : "").trim().replace(IP_KEY_RE, "").slice(0, 80) ||
    "unknown";
}

export function publicRateIp(input: {
  trusted?: string | null;
  forwardedFor?: string | null;
}): string {
  const trusted = sanitizeRateIp(input.trusted);
  if (trusted !== "unknown") return trusted;
  const forwarded = typeof input.forwardedFor === "string" ? input.forwardedFor : "";
  const hops = forwarded.split(",");
  const last = hops.length ? hops[hops.length - 1] : "";
  return sanitizeRateIp(last);
}

export function requestIp(headers: HeaderReader): string {
  return publicRateIp({
    trusted: headers.get("x-vercel-forwarded-for") || headers.get("x-real-ip"),
    forwardedFor: headers.get("x-forwarded-for"),
  });
}

export function inboxRateKey(ip: string, authorized: boolean): string {
  return `${authorized ? "auth" : "anon"}:${sanitizeRateIp(ip)}`;
}

export function publicRateKey(ip: string, bucket: PublicRateBucket | string): string {
  const raw = typeof bucket === "string" ? bucket.trim().toLowerCase() : "";
  const safeBucket = PUBLIC_BUCKETS.includes(raw as PublicRateBucket) ? raw : "pub";
  return `${safeBucket}:${sanitizeRateIp(ip)}`;
}

export function allowRateLimit(
  store: RateLimitStore,
  key: string,
  opts: { now?: number; windowMs: number; max: number },
): boolean {
  const now = opts.now ?? Date.now();
  const prior = (store.get(key) ?? []).filter((ts) => now - ts < opts.windowMs);
  if (prior.length >= opts.max) {
    store.set(key, prior);
    return false;
  }
  prior.push(now);
  store.set(key, prior);
  return true;
}

export function allowInboxRequest(
  store: RateLimitStore,
  input: { ip: string; authorized: boolean; now?: number },
): boolean {
  const authorized = Boolean(input.authorized);
  return allowRateLimit(store, inboxRateKey(input.ip, authorized), {
    now: input.now,
    windowMs: INBOX_RATE_WINDOW_MS,
    max: authorized ? INBOX_AUTH_MAX : INBOX_ANON_MAX,
  });
}

function publicMax(bucket: PublicRateBucket): number {
  if (bucket === "intake") return INTAKE_PUBLIC_MAX;
  if (bucket === "status") return STATUS_PUBLIC_MAX;
  if (bucket === "reply") return REPLY_PUBLIC_MAX;
  return CHECKOUT_PUBLIC_MAX;
}

export function parsePublicRateBucket(value: unknown): PublicRateBucket | null {
  if (typeof value !== "string") return null;
  const bucket = value.trim().toLowerCase();
  return PUBLIC_BUCKETS.includes(bucket as PublicRateBucket)
    ? (bucket as PublicRateBucket)
    : null;
}

export function allowPublicRequest(
  store: RateLimitStore,
  input: { ip: string; bucket: PublicRateBucket; now?: number },
): boolean {
  const bucket = parsePublicRateBucket(input.bucket);
  if (!bucket) {
    return allowRateLimit(store, publicRateKey(input.ip, "pub"), {
      now: input.now,
      windowMs: PUBLIC_RATE_WINDOW_MS,
      max: 1,
    });
  }
  return allowRateLimit(store, publicRateKey(input.ip, bucket), {
    now: input.now,
    windowMs: PUBLIC_RATE_WINDOW_MS,
    max: publicMax(bucket),
  });
}
