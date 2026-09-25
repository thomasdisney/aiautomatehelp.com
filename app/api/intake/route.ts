import { NextResponse } from "next/server";
import { toPublicIntakeCreate } from "@/lib/brief-receipt";
import { parseIntake } from "@/lib/intake";
import { intakeStoreConfigured, persistIntake } from "@/lib/intake-store";
import { allowPublicRequest, requestIp } from "@/lib/rate-limit";

const hits = new Map<string, number[]>();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export function GET() {
  return json({ connected: intakeStoreConfigured() });
}

export async function POST(request: Request) {
  if (!allowPublicRequest(hits, { ip: requestIp(request.headers), bucket: "intake" })) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid" }, 400);
  }

  const parsed = parseIntake(body);
  if (!parsed.ok) {
    return json({ ok: false, code: parsed.error }, 400);
  }
  if (parsed.dropped) {
    return json({ ok: true, id: "ok" });
  }
  if (!intakeStoreConfigured()) {
    return json({ ok: false, code: "intake_not_connected" }, 503);
  }

  const result = await persistIntake(parsed.data);
  if (!result.stored) {
    return json({ ok: false, code: "intake_not_connected" }, 503);
  }
  const created = toPublicIntakeCreate({ id: result.id, receivedAt: result.receivedAt });
  if (!created) {
    return json({ ok: false, code: "intake_not_connected" }, 503);
  }
  return json(created);
}
