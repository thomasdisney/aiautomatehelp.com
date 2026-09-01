export const INBOX_ANON_MAX = 10;
export const INBOX_AUTH_MAX = 60;
export const INBOX_RATE_WINDOW_MS = 60 * 60 * 1000;

const IP_KEY_RE = /[^A-Za-z0-9.:_-]/g;

export type RateLimitStore = Map<string, number[]>;

export function inboxRateKey(ip: string, authorized: boolean): string {
  const safe =
    (typeof ip === "string" ? ip : "").trim().replace(IP_KEY_RE, "").slice(0, 80) ||
    "unknown";
  return `${authorized ? "auth" : "anon"}:${safe}`;
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
