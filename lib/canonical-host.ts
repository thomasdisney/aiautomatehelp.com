const APEX_HOST = "aiautomatehelp.com";
const CANONICAL_HOST = "www.aiautomatehelp.com";

function stripEmailSearchParams(url: URL): void {
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase() === "email") url.searchParams.delete(key);
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

/** Collapse // and \\ so Next.js cannot 308 with a public Location that includes ?email=. */
export function repeatedSlashRedirect(url: URL): URL | null {
  const pathname = url.pathname;
  if (!pathname.includes("//") && !pathname.includes("\\")) return null;
  const next = new URL(url.href);
  next.pathname = pathname.replace(/\\/g, "/").replace(/\/{2,}/g, "/") || "/";
  stripEmailSearchParams(next);
  return next;
}
