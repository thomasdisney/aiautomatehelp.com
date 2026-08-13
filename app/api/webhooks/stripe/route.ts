import { NextResponse } from "next/server";
import { markIntakePaid } from "@/lib/intake-store";
import { paidFromStripeSession, paymentConfigured } from "@/lib/payment";
import { verifyStripeWebhook } from "@/lib/stripe";

export const runtime = "nodejs";

function ok() {
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!paymentConfigured()) {
    return NextResponse.json(
      { ok: false, code: "payment_not_connected" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const raw = await request.text();
  const event = verifyStripeWebhook(raw, request.headers.get("stripe-signature"));
  if (!event) {
    return NextResponse.json(
      { ok: false, code: "invalid" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  if (event.type !== "checkout.session.completed") return ok();

  const notice = paidFromStripeSession(event.data.object);
  if (!notice) return ok();

  const updated = await markIntakePaid(notice);
  if (!updated.ok && updated.error === "store") {
    return NextResponse.json(
      { ok: false, code: "store" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
  return ok();
}
