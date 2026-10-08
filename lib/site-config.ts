// Public hostnames for the landing site and the agent app.
//
// The defaults are today's live hosts, so this file changes nothing until the
// domain cutover sets the env vars below (see docs/CUTOVER-notjunk.md):
//
//   NEXT_PUBLIC_SITE_URL          canonical landing origin   (cutover: https://notjunk.si)
//   NEXT_PUBLIC_AGENT_URL         agent app origin           (cutover: https://app.notjunk.si)
//   NEXT_PUBLIC_SITE_ALIAS_HOSTS  comma list of hosts that 308 to the canonical host
//                                 (cutover: www.notjunk.si,aiautomatehelp.com,www.aiautomatehelp.com)
//
// NEXT_PUBLIC_* values are inlined at build time, so changing them needs a
// redeploy. Keep this module free of imports so tests can load it directly.

export const DEFAULT_SITE_URL = "https://www.aiautomatehelp.com";
export const DEFAULT_AGENT_URL = "https://agent.aiautomatehelp.com";
export const DEFAULT_ALIAS_HOSTS = ["aiautomatehelp.com"];

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
