import { NextResponse } from "next/server";
import { bearerMatches, inboxReadToken } from "@/lib/inbox-auth";
import { intakeBlobPath } from "@/lib/intake";
import { deleteIntake, getOpsLastEvent, getOpsQueue, listIntake, updateIntake } from "@/lib/intake-store";
import { summarizeQueue } from "@/lib/ops-queue";
import { parseInboxPatch, toPublicStatus } from "@/lib/status";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 30;
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

function unauthorized() {
  return NextResponse.json(
    { ok: false, code: "unauthorized" },
    { status: 401, headers: { "cache-control": "no-store" } },
  );
}

function authorize(request: Request): boolean {
  return bearerMatches(request.headers.get("authorization"), inboxReadToken());
}

export async function GET(request: Request) {
  if (!allowRequest(clientIp(request))) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  if (!authorize(request)) return unauthorized();

  const url = new URL(request.url);
  const queueOnly = url.searchParams.get("view") === "queue";
  if (queueOnly) {
    const queue = await getOpsQueue();
    return NextResponse.json(
      { ok: true, queue },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const [items, last] = await Promise.all([listIntake(20), getOpsLastEvent()]);
  return NextResponse.json(
    { ok: true, queue: summarizeQueue(items, last), items },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  if (!allowRequest(clientIp(request))) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  if (!authorize(request)) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  const parsed = parseInboxPatch(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, code: parsed.error }, { status: 400 });
  }

  const updated = await updateIntake(parsed.id, {
    status: parsed.status,
    quoteText: parsed.quoteText,
  });
  if (!updated.ok) {
    return NextResponse.json(
      { ok: false, code: updated.error },
      {
        status: updated.error === "not_found" ? 404 : 503,
        headers: { "cache-control": "no-store" },
      },
    );
  }
  return NextResponse.json(
    { ok: true, ...toPublicStatus(updated.record) },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function DELETE(request: Request) {
  if (!allowRequest(clientIp(request))) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  if (!authorize(request)) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }
  const id = body && typeof body === "object" ? (body as { id?: unknown }).id : "";
  if (typeof id !== "string" || !intakeBlobPath(id)) {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }
  const deleted = await deleteIntake(id);
  return NextResponse.json(
    { ok: deleted },
    { status: deleted ? 200 : 404, headers: { "cache-control": "no-store" } },
  );
}
