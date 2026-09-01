import { NextResponse } from "next/server";
import { parseIntake } from "@/lib/intake";
import { intakeStoreConfigured, persistIntake } from "@/lib/intake-store";
import { allowPublicRequest, requestIp } from "@/lib/rate-limit";

const hits = new Map<string, number[]>();

export function GET() {
  return NextResponse.json(
    { connected: intakeStoreConfigured() },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!allowPublicRequest(hits, { ip: requestIp(request.headers), bucket: "intake" })) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  const parsed = parseIntake(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, code: parsed.error }, { status: 400 });
  }
  if (parsed.dropped) {
    return NextResponse.json({ ok: true, id: "ok" });
  }
  if (!intakeStoreConfigured()) {
    return NextResponse.json(
      { ok: false, code: "intake_not_connected" },
      { status: 503 },
    );
  }

  const result = await persistIntake(parsed.data);
  if (!result.stored) {
    return NextResponse.json(
      { ok: false, code: "intake_not_connected" },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, id: result.id });
}
