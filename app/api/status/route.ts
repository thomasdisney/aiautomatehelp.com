import { NextResponse } from "next/server";
import { getIntake } from "@/lib/intake-store";
import { allowPublicRequest, requestIp } from "@/lib/rate-limit";
import { emailsMatch, parseStatusLookup, toPublicStatus } from "@/lib/status";

const hits = new Map<string, number[]>();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!allowPublicRequest(hits, { ip: requestIp(request.headers), bucket: "status" })) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid" }, 400);
  }

  const parsed = parseStatusLookup(body);
  if (!parsed.ok) {
    return json({ ok: false, code: parsed.error }, 400);
  }
  if (parsed.dropped) return json({ ok: false, code: "not_found" }, 404);

  const record = await getIntake(parsed.id);
  if (!record || !emailsMatch(record.email, parsed.email)) {
    return json({ ok: false, code: "not_found" }, 404);
  }

  return json({ ok: true, ...toPublicStatus(record) });
}
