import { NextResponse } from "next/server";
import { allowPublicRequest, requestIp } from "@/lib/rate-limit";

const AGENT_URL = "https://agent.aiautomatehelp.com";
const CODE_RE = /^[a-z0-9-]{4,64}$/;

const hits = new Map<string, number[]>();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!allowPublicRequest(hits, { ip: requestIp(request.headers), bucket: "agent" })) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid" }, 400);
  }
  const raw =
    typeof body === "object" && body && "code" in body
      ? String((body as { code?: unknown }).code ?? "")
      : "";
  const code = raw.trim().toLowerCase();
  if (!CODE_RE.test(code)) {
    return json({ ok: false, code: "invalid" }, 400);
  }

  try {
    const res = await fetch(`${AGENT_URL}/${encodeURIComponent(code)}`, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
    });
    // Unknown pairing codes 404 on the agent host. Anything else (200/302/401) is worth opening.
    if (res.status === 404) {
      return json({ ok: false, code: "not_found" }, 404);
    }
    return json({ ok: true, href: `${AGENT_URL}/${encodeURIComponent(code)}` });
  } catch {
    // Network failure: fall through and let the client navigate (better than blocking connect).
    return json({
      ok: true,
      href: `${AGENT_URL}/${encodeURIComponent(code)}`,
      unchecked: true,
    });
  }
}
