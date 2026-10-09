// Public hostnames for the landing site and the agent app.
//
// The defaults are the live hosts since the notjunk.si move, so no env var is
// needed. The env vars below only override them (e.g. for a staging copy):
//
//   NEXT_PUBLIC_SITE_URL          canonical landing origin   (default https://notjunk.si)
//   NEXT_PUBLIC_AGENT_URL         agent app origin           (default https://app.notjunk.si)
//   NEXT_PUBLIC_SITE_ALIAS_HOSTS  comma list of hosts that 308 to the canonical host
//                                 (default www.notjunk.si)
//
// NEXT_PUBLIC_* values are inlined at build time, so changing them needs a
// redeploy. Keep this module free of imports so tests can load it directly.

export const DEFAULT_SITE_URL = "https://notjunk.si";
export const DEFAULT_AGENT_URL = "https://app.notjunk.si";
export const DEFAULT_ALIAS_HOSTS = ["www.notjunk.si"];

/** Accept only a bare https origin; anything else falls back to the default. */
export function originOr(value: string | undefined, fallback: string): string {
  const raw = (value ?? "").trim();
  if (!raw) return fallback;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.pathname !== "/" || u.search || u.hash) return fallback;
    return u.origin;
  } catch {
    return fallback;
  }
}

export function hostList(value: string | undefined, fallback: readonly string[]): string[] {
  const raw = (value ?? "").trim();
  if (!raw) return [...fallback];
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter((h) => /^[a-z0-9.-]+$/.test(h));
}

export const SITE_URL = originOr(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL);
export const AGENT_URL = originOr(process.env.NEXT_PUBLIC_AGENT_URL, DEFAULT_AGENT_URL);
export const SITE_HOST = new URL(SITE_URL).host;
export const SITE_ALIAS_HOSTS = hostList(process.env.NEXT_PUBLIC_SITE_ALIAS_HOSTS, DEFAULT_ALIAS_HOSTS);
