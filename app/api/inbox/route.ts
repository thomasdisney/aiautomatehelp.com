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
import { parseInboxListView, toInboxIdRows, toInboxIdRowsForEmail, toInboxItem } from "@/lib/ops-queue";
import { allowInboxRequest, requestIp } from "@/lib/rate-limit";
import { parseInboxFind, parseInboxId, parseInboxPatch, toPublicStatus } from "@/lib/status";

const hits = new Map<string, number[]>();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function clientIp(request: Request): string {
  return requestIp(request.headers);
}

function allowRequest(request: Request, authorized: boolean): boolean {
  return allowInboxRequest(hits, { ip: clientIp(request), authorized });
}

function unauthorized() {
  return json({ ok: false, code: "unauthorized" }, 401);
}

function authorize(request: Request): boolean {
  return bearerMatches(request.headers.get("authorization"), inboxReadToken());
}

export async function GET(request: Request) {
  const authorized = authorize(request);
  if (!allowRequest(request, authorized)) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }
  if (!authorized) return unauthorized();

  const url = new URL(request.url);
  const requestedId = parseInboxId(url.searchParams.get("id"));
  if (url.searchParams.has("id") && !requestedId) {
    return json({ ok: false, code: "invalid" }, 400);
  }
  if (requestedId) {
    const item = await getIntake(requestedId);
    if (!item) {
      return json({ ok: false, code: "not_found" }, 404);
    }
    return json({ ok: true, item: toInboxItem(item) });
  }

  const view = parseInboxListView(url.searchParams.get("view"));
  if (view === "invalid") {
    return json({ ok: false, code: "invalid" }, 400);
  }
  if (view === "ids") {
    const ids = toInboxIdRows(await listIntakeForList(20));
    return json({ ok: true, ids });
  }

  const queue = await getOpsQueue();
  return json({ ok: true, queue });
}

export async function POST(request: Request) {
  const authorized = authorize(request);
  if (!allowRequest(request, authorized)) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }
  if (!authorized) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid" }, 400);
  }

  const parsed = parseInboxFind(body);
  if (!parsed.ok) {
    return json({ ok: false, code: parsed.error }, 400);
  }

  const ids = toInboxIdRowsForEmail(await listIntakeByEmail(parsed.email), parsed.email);
  return json({ ok: true, ids });
}

export async function PATCH(request: Request) {
  const authorized = authorize(request);
  if (!allowRequest(request, authorized)) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }
  if (!authorized) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid" }, 400);
  }

  const parsed = parseInboxPatch(body);
  if (!parsed.ok) {
    return json({ ok: false, code: parsed.error }, 400);
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
    return json({ ok: false, code: updated.error }, status);
  }
  return json({ ok: true, ...toPublicStatus(updated.record) });
}

export async function DELETE(request: Request) {
  const authorized = authorize(request);
  if (!allowRequest(request, authorized)) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }
  if (!authorized) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid" }, 400);
  }
  const id = parseInboxId(body && typeof body === "object" ? (body as { id?: unknown }).id : "");
  if (!id) {
    return json({ ok: false, code: "invalid" }, 400);
  }
  const deleted = await deleteIntake(id);
  return json({ ok: deleted }, deleted ? 200 : 404);
}
