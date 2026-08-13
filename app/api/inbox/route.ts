import { NextResponse } from "next/server";
import { bearerMatches, inboxReadToken } from "@/lib/inbox-auth";
import { intakeBlobPath } from "@/lib/intake";
import { deleteIntake, listIntake } from "@/lib/intake-store";

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

  const items = await listIntake(20);
  return NextResponse.json(
    { ok: true, items },
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
