import { NextResponse } from "next/server";
import { getIntake } from "@/lib/intake-store";
import { paymentConfigured } from "@/lib/payment";
import { emailsMatch, parseStatusLookup } from "@/lib/status";
import { checkoutAllowed, createCheckoutUrl } from "@/lib/stripe";

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

export function GET() {
  return NextResponse.json(
    { connected: paymentConfigured() },
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

  const parsed = parseStatusLookup(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, code: parsed.error }, { status: 400 });
  }
  if (parsed.dropped) return notFound();

  const record = await getIntake(parsed.id);
  if (!record || !emailsMatch(record.email, parsed.email)) return notFound();

  if (record.status === "paid") {
    return NextResponse.json(
      { ok: false, code: "already_paid" },
      { status: 409, headers: { "cache-control": "no-store" } },
    );
  }
  if (!checkoutAllowed(record)) {
    return NextResponse.json(
      { ok: false, code: "not_allowed" },
      { status: 409, headers: { "cache-control": "no-store" } },
    );
  }
  if (!paymentConfigured()) {
    return NextResponse.json(
      { ok: false, code: "payment_not_connected" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const url = await createCheckoutUrl(record);
    if (!url) {
      return NextResponse.json(
        { ok: false, code: "payment_not_connected" },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: true, url },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, code: "payment_not_connected" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
