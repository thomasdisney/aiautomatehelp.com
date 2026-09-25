const APEX_HOST = "aiautomatehelp.com";
const CANONICAL_HOST = "www.aiautomatehelp.com";

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
  for (const key of [...next.searchParams.keys()]) {
    if (key.toLowerCase() === "email") next.searchParams.delete(key);
  }
  return next;
}
