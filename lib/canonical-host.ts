const APEX_HOST = "aiautomatehelp.com";
const CANONICAL_HOST = "www.aiautomatehelp.com";

/** Apex requests go to the canonical www host, always over https. */
export function canonicalHostRedirect(hostHeader: unknown, url: URL): URL | null {
  if (typeof hostHeader !== "string") return null;
  const host = hostHeader.split(":")[0].trim().toLowerCase();
  if (host !== APEX_HOST) return null;
  const next = new URL(url.href);
  next.protocol = "https:";
  next.hostname = CANONICAL_HOST;
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
