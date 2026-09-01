import { NextResponse } from "next/server";
import { getIntake } from "@/lib/intake-store";
import { allowPublicRequest, requestIp } from "@/lib/rate-limit";
import { emailsMatch, parseStatusLookup, toPublicStatus } from "@/lib/status";

const hits = new Map<string, number[]>();

function notFound() {
  return NextResponse.json(
    { ok: false, code: "not_found" },
    { status: 404, headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!allowPublicRequest(hits, { ip: requestIp(request.headers), bucket: "status" })) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  const parsed = parseStatusLookup(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, code: parsed.error }, { status: 400 });
  }
  if (parsed.dropped) return notFound();

  const record = await getIntake(parsed.id);
  if (!record || !emailsMatch(record.email, parsed.email)) return notFound();

  return NextResponse.json(
    { ok: true, ...toPublicStatus(record) },
    { headers: { "cache-control": "no-store" } },
  );
}
