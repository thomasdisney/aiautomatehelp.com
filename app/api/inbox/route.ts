import { NextResponse } from "next/server";
import { bearerMatches, inboxReadToken } from "@/lib/inbox-auth";
import {
  deleteIntake,
  getIntake,
  getOpsQueue,
  listIntakeByEmail,
  listIntakeForList,
  updateIntake,
} from "@/lib/intake-store";
import { parseInboxListView, toInboxIdRows, toInboxIdRowsForEmail } from "@/lib/ops-queue";
import { allowInboxRequest } from "@/lib/rate-limit";
import { parseInboxFind, parseInboxId, parseInboxPatch, toPublicStatus } from "@/lib/status";

const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

function allowRequest(request: Request, authorized: boolean): boolean {
  return allowInboxRequest(hits, { ip: clientIp(request), authorized });
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
  const authorized = authorize(request);
  if (!allowRequest(request, authorized)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  if (!authorized) return unauthorized();

  const url = new URL(request.url);
  const requestedId = parseInboxId(url.searchParams.get("id"));
  if (url.searchParams.has("id") && !requestedId) {
    return NextResponse.json(
      { ok: false, code: "invalid" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }
  if (requestedId) {
    const item = await getIntake(requestedId);
    if (!item) {
      return NextResponse.json(
        { ok: false, code: "not_found" },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: true, item },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const view = parseInboxListView(url.searchParams.get("view"));
  if (view === "invalid") {
    return NextResponse.json(
      { ok: false, code: "invalid" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }
  if (view === "ids") {
    const ids = toInboxIdRows(await listIntakeForList(20));
    return NextResponse.json(
      { ok: true, ids },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const queue = await getOpsQueue();
  return NextResponse.json(
    { ok: true, queue },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const authorized = authorize(request);
  if (!allowRequest(request, authorized)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  if (!authorized) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  const parsed = parseInboxFind(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, code: parsed.error },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const ids = toInboxIdRowsForEmail(await listIntakeByEmail(parsed.email), parsed.email);
  return NextResponse.json(
    { ok: true, ids },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  const authorized = authorize(request);
  if (!allowRequest(request, authorized)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  if (!authorized) return unauthorized();

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
    amountCents: parsed.amountCents,
    dueAt: parsed.dueAt,
    updateText: parsed.updateText,
    operatorNote: parsed.operatorNote,
    doneWhen: parsed.doneWhen,
  });
  if (!updated.ok) {
    const status =
      updated.error === "not_found" ? 404 : updated.error === "not_allowed" ? 409 : 503;
    return NextResponse.json(
      { ok: false, code: updated.error },
      {
        status,
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
  const authorized = authorize(request);
  if (!allowRequest(request, authorized)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  if (!authorized) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }
  const id = parseInboxId(body && typeof body === "object" ? (body as { id?: unknown }).id : "");
  if (!id) {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }
  const deleted = await deleteIntake(id);
  return NextResponse.json(
    { ok: deleted },
    { status: deleted ? 200 : 404, headers: { "cache-control": "no-store" } },
  );
}
