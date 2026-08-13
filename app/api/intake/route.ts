import { NextResponse } from "next/server";
import { parseIntake } from "@/lib/intake";
import { intakeStoreConfigured, persistIntake } from "@/lib/intake-store";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

function allowRequest(ip: string): boolean {
  const now = Date.now();
  const prior = (hits.get(ip) ?? []).filter((ts) => now - ts < WINDOW_MS);
  if (prior.length >= MAX_PER_WINDOW) {
    hits.set(ip, prior);
    return false;
  }
  prior.push(now);
  hits.set(ip, prior);
  return true;
}

export function GET() {
  return NextResponse.json(
    { connected: intakeStoreConfigured() },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!allowRequest(clientIp(request))) {
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
