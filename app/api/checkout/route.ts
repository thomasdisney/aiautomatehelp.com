import { NextResponse } from "next/server";
import { getIntake } from "@/lib/intake-store";
import { paymentConfigured } from "@/lib/payment";
import { allowPublicRequest, requestIp } from "@/lib/rate-limit";
import { emailsMatch, parseStatusLookup } from "@/lib/status";
import { checkoutAllowed, createCheckoutUrl } from "@/lib/stripe";

const hits = new Map<string, number[]>();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function notFound() {
  return json({ ok: false, code: "not_found" }, 404);
}

export function GET() {
  return json({ connected: paymentConfigured() });
}

export async function POST(request: Request) {
  if (!allowPublicRequest(hits, { ip: requestIp(request.headers), bucket: "checkout" })) {
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
  if (parsed.dropped) return notFound();

  const record = await getIntake(parsed.id);
  if (!record || !emailsMatch(record.email, parsed.email)) return notFound();

  if (record.status === "paid") {
    return json({ ok: false, code: "already_paid" }, 409);
  }
  if (!checkoutAllowed(record)) {
    return json({ ok: false, code: "not_allowed" }, 409);
  }
  if (!paymentConfigured()) {
    return json({ ok: false, code: "payment_not_connected" }, 503);
  }

  try {
    const url = await createCheckoutUrl(record);
    if (!url) {
      return json({ ok: false, code: "payment_not_connected" }, 503);
    }
    return json({ ok: true, url });
  } catch {
    return json({ ok: false, code: "payment_not_connected" }, 503);
  }
}
