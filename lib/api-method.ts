const API_ALLOWED_METHODS: Record<string, readonly string[]> = {
  "/api/agent-code": ["POST"],
  "/api/checkout": ["GET", "POST"],
  "/api/inbox": ["GET", "POST", "PATCH", "DELETE"],
  "/api/intake": ["GET", "POST"],
  "/api/status": ["POST"],
  "/api/status/reply": ["POST"],
  "/api/webhooks/stripe": ["POST"],
};

const METHOD_ORDER = [
  "OPTIONS",
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;

function normalizeApiPath(pathname: unknown): string {
  if (typeof pathname !== "string") return "";
  const raw = pathname.trim();
  if (!raw.startsWith("/api/") || raw.length > 200) return "";
  if (/[\s\r\n\0]/.test(raw)) return "";
  return raw.replace(/\/+$/g, "");
}

function isApiPath(pathname: unknown): boolean {
  if (typeof pathname !== "string") return false;
  const raw = pathname.trim();
  return raw === "/api" || raw.startsWith("/api/");
}

export function apiRewritePath(pathname: unknown): string | null {
  if (typeof pathname !== "string") return null;
  if (!pathname.endsWith("/")) return null;
  const path = normalizeApiPath(pathname);
  return path || null;
}

export function apiAllowHeader(allowed: readonly string[]): string {
  const set = new Set<string>(["OPTIONS", ...allowed]);
  if (allowed.includes("GET")) set.add("HEAD");
  return METHOD_ORDER.filter((method) => set.has(method)).join(", ");
}

export function apiMethodGuard(
  pathname: unknown,
  method: unknown,
): { status: 204 | 404 | 405; allow?: string } | null {
  const path = normalizeApiPath(pathname);
  const allowed = path ? API_ALLOWED_METHODS[path] : undefined;
  if (!allowed) {
    if (isApiPath(pathname)) return { status: 404 };
    return null;
  }
  const allow = apiAllowHeader(allowed);
  const verb = typeof method === "string" ? method.trim().toUpperCase() : "";
  if (verb === "OPTIONS") return { status: 204, allow };
  if (verb === "HEAD" && allowed.includes("GET")) return null;
  if (allowed.includes(verb)) return null;
  return { status: 405, allow };
}
