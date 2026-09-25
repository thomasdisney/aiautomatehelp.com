import { NextResponse } from "next/server";
import { replyToIntake } from "@/lib/intake-store";
import { allowPublicRequest, requestIp } from "@/lib/rate-limit";
import { parseCustomerAction, toPublicStatus } from "@/lib/status";

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

export async function POST(request: Request) {
  if (!allowPublicRequest(hits, { ip: requestIp(request.headers), bucket: "reply" })) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid" }, 400);
  }

  const parsed = parseCustomerAction(body);
  if (!parsed.ok) {
    return json({ ok: false, code: parsed.error }, 400);
  }
  if (parsed.dropped) return notFound();

  const updated = await replyToIntake(parsed.id, parsed.email, {
    decision: parsed.decision,
    note: parsed.note,
    doneWhen:
      parsed.decision === "accept" || parsed.decision === "confirm"
        ? parsed.doneWhen
        : undefined,
    amountCents: parsed.decision === "accept" ? parsed.amountCents : undefined,
    dueAt: parsed.decision === "accept" ? parsed.dueAt : undefined,
    quoteText: parsed.decision === "accept" ? parsed.quoteText : undefined,
  });
  if (!updated.ok) {
    const status =
      updated.error === "not_found" ? 404 : updated.error === "not_allowed" ? 409 : 503;
    return json({ ok: false, code: updated.error }, status);
  }

  return json({ ok: true, ...toPublicStatus(updated.record) });
}
