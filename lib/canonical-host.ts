const APEX_HOST = "aiautomatehelp.com";
const CANONICAL_HOST = "www.aiautomatehelp.com";

function isEmailSearchParamKey(key: string): boolean {
  const n = key.toLowerCase().replace(/[-_]/g, "");
  return (
    n.startsWith("email") ||
    n.endsWith("email") ||
    n.startsWith("mail") ||
    n.endsWith("mail")
  );
}

function stripEmailSearchParams(url: URL): void {
  for (const key of [...url.searchParams.keys()]) {
    if (isEmailSearchParamKey(key)) url.searchParams.delete(key);
  }
}

export function canonicalHostRedirect(
  hostHeader: unknown,
  url: URL,
): URL | null {
  if (typeof hostHeader !== "string") return null;
  const host = hostHeader.split(":")[0].trim().toLowerCase();
  if (host !== APEX_HOST) return null;
  const next = new URL(url.href);
  next.protocol = "https:";
  next.hostname = CANONICAL_HOST;
  next.port = "";
  stripEmailSearchParams(next);
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

/** Collapse //, \\, and encoded slashes so a public 308/500 cannot keep ?email=. */
export function repeatedSlashRedirect(url: URL): URL | null {
  const pathname = decodePathSlashes(url.pathname);
  if (!pathname.includes("//") && !pathname.includes("\\")) return null;
  const next = new URL(url.href);
  next.pathname = pathname.replace(/\\/g, "/").replace(/\/{2,}/g, "/") || "/";
  stripEmailSearchParams(next);
  return next;
}

/** Public, cacheable files. A shared cache must not store ?email= on these URLs. */
const PUBLIC_CACHE_PATHS = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
  "/apple-icon",
  "/icon.svg",
  "/workflow.svg",
]);

function canonicalPublicCachePath(pathname: string): string {
  const collapsed = pathname.replace(/\/+$/, "") || "/";
  return collapsed;
}

function isPublicCachePath(pathname: string): boolean {
  if (PUBLIC_CACHE_PATHS.has(pathname)) return true;
  if (pathname === "/_next/static" || pathname.startsWith("/_next/static/")) {
    return true;
  }
  if (pathname === "/_next/image" || pathname.startsWith("/_next/image/")) {
    return true;
  }
  return (
    pathname === "/_vercel/speed-insights" ||
    pathname.startsWith("/_vercel/speed-insights/")
  );
}

function searchHasEmailParam(url: URL): boolean {
  return [...url.searchParams.keys()].some((key) => isEmailSearchParamKey(key));
}

/**
 * Drop ?email= on publicly cached assets so a shared cache cannot store a
 * customer address in the cache key. Status ?email= prefilling is unchanged.
 */
export function publicCacheEmailRedirect(url: URL): URL | null {
  const pathname = canonicalPublicCachePath(url.pathname);
  if (!isPublicCachePath(pathname)) return null;
  if (!searchHasEmailParam(url)) return null;
  const next = new URL(url.href);
  next.pathname = pathname;
  stripEmailSearchParams(next);
  if (next.pathname === url.pathname && next.search === url.search) return null;
  return next;
}
