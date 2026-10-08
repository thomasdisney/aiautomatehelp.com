// Host canonicalization for the landing site.
//
// Requests on an alias host are sent to the canonical host with the same path
// and query (308, so a POST stays a POST). /api/* is never redirected: it is
// answered on every host so a page or client that still talks to an old host
// keeps working.
//
// aiautomatehelp.com, www.aiautomatehelp.com and www.notjunk.si -> notjunk.si.
// The canonical host itself never redirects, so notjunk.si can't loop. Hosts
// come from lib/site-config.ts (env overrides). Vercel's project domain
// redirects can do the same job at the edge; this works without them.

export type HostConfig = { canonicalHost: string; aliasHosts: readonly string[] };

export const DEFAULT_HOST_CONFIG: HostConfig = {
  canonicalHost: "notjunk.si",
  aliasHosts: ["www.notjunk.si", "aiautomatehelp.com", "www.aiautomatehelp.com"],
};

/** Alias-host requests go to the canonical host, always over https. */
export function canonicalHostRedirect(
  hostHeader: unknown,
  url: URL,
  config: HostConfig = DEFAULT_HOST_CONFIG,
): URL | null {
  if (typeof hostHeader !== "string") return null;
  const host = hostHeader.split(":")[0].trim().toLowerCase();
  const canonical = config.canonicalHost.toLowerCase();
  if (!host || host === canonical) return null;
  if (!config.aliasHosts.map((h) => h.toLowerCase()).includes(host)) return null;
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return null;
  const next = new URL(url.href);
  next.protocol = "https:";
  next.hostname = canonical;
  next.port = "";
  return next;
}

/**
 * Decode %2F / %5C (and a few nested encodings) so encoded consecutive slashes
 * are visible. The URL parser keeps %2F in pathname; Next.js then 500s that
 * path with a public Location-less 500, or a public 308 if it decodes later.
 */
function decodePathSlashes(pathname: string): string {
  let current = pathname;
  for (let i = 0; i < 4; i++) {
    let next = current.replace(/%5c/gi, "\\").replace(/%2f/gi, "/");
    if (next === current) {
      try {
        next = decodeURIComponent(current);
      } catch {
        break;
      }
    }
    if (next === current) break;
    current = next;
  }
  return current;
}

/** Collapse //, \\, and encoded slashes into one clean public path. */
export function repeatedSlashRedirect(url: URL): URL | null {
  const pathname = decodePathSlashes(url.pathname);
  if (!pathname.includes("//") && !pathname.includes("\\")) return null;
  const next = new URL(url.href);
  next.pathname = pathname.replace(/\\/g, "/").replace(/\/{2,}/g, "/") || "/";
  return next;
}
