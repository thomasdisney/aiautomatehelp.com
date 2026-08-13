import { timingSafeEqualString } from "./inbox-auth.ts";
import {
  intakeBlobPath,
  isValidEmail,
  sanitizeText,
  type IntakeRecord,
} from "./intake.ts";

export type PublicStatus = {
  id: string;
  status: IntakeRecord["status"];
  receivedAt: string;
};

export type StatusLookup =
  | { ok: true; dropped: true }
  | { ok: true; dropped: false; id: string; email: string }
  | { ok: false; error: "invalid" };

export function parseStatusLookup(body: unknown): StatusLookup {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid" };
  const raw = body as Record<string, unknown>;
  const honeypot = typeof raw.website === "string" ? raw.website.trim() : "";
  if (honeypot) return { ok: true, dropped: true };

  const idRaw = typeof raw.id === "string" ? raw.id.trim().toLowerCase() : "";
  const email = sanitizeText(raw.email, 120).toLowerCase();
  if (!intakeBlobPath(idRaw) || !isValidEmail(email)) {
    return { ok: false, error: "invalid" };
  }
  return { ok: true, dropped: false, id: idRaw, email };
}

export function emailsMatch(left: string, right: string): boolean {
  return timingSafeEqualString(left.trim().toLowerCase(), right.trim().toLowerCase());
}

export function toPublicStatus(record: IntakeRecord): PublicStatus {
  return {
    id: record.id,
    status: record.status,
    receivedAt: record.receivedAt,
  };
}
