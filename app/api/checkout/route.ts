import { NextResponse } from "next/server";
import { getIntake } from "@/lib/intake-store";
import { paymentConfigured } from "@/lib/payment";
import { allowPublicRequest, requestIp } from "@/lib/rate-limit";
import { emailsMatch, parseStatusLookup } from "@/lib/status";
import { checkoutAllowed, createCheckoutUrl } from "@/lib/stripe";

const hits = new Map<string, number[]>();

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
  if (!allowPublicRequest(hits, { ip: requestIp(request.headers), bucket: "checkout" })) {
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
