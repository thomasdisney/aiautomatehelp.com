import { NextResponse } from "next/server";
import { replyToIntake } from "@/lib/intake-store";
import { parseCustomerAction, toPublicStatus } from "@/lib/status";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 8;
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

function notFound() {
  return NextResponse.json(
    { ok: false, code: "not_found" },
    { status: 404, headers: { "cache-control": "no-store" } },
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

  const parsed = parseCustomerAction(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, code: parsed.error }, { status: 400 });
  }
  if (parsed.dropped) return notFound();

  const updated = await replyToIntake(parsed.id, parsed.email, {
    decision: parsed.decision,
    note: parsed.note,
    doneWhen: parsed.decision === "accept" ? parsed.doneWhen : undefined,
    amountCents: parsed.decision === "accept" ? parsed.amountCents : undefined,
    dueAt: parsed.decision === "accept" ? parsed.dueAt : undefined,
  });
  if (!updated.ok) {
    const status =
      updated.error === "not_found" ? 404 : updated.error === "not_allowed" ? 409 : 503;
    return NextResponse.json(
      { ok: false, code: updated.error },
      { status, headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.json(
    { ok: true, ...toPublicStatus(updated.record) },
    { headers: { "cache-control": "no-store" } },
  );
}
