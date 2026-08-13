import { timingSafeEqualString } from "./inbox-auth.ts";
import {
  FIELD_LIMITS,
  intakeBlobPath,
  isValidEmail,
  parseIntakeStatus,
  sanitizeText,
  type IntakeRecord,
  type IntakeStatus,
} from "./intake.ts";

export type PublicStatus = {
  id: string;
  status: IntakeRecord["status"];
  receivedAt: string;
  quoteText?: string;
};

export type InboxPatch =
  | { ok: true; id: string; status: IntakeStatus; quoteText: string }
  | { ok: false; error: "invalid" };

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
  const view: PublicStatus = {
    id: record.id,
    status: record.status,
    receivedAt: record.receivedAt,
  };
  if (record.quoteText) view.quoteText = record.quoteText;
  return view;
}

export function parseInboxPatch(body: unknown): InboxPatch {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid" };
  const raw = body as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id.trim().toLowerCase() : "";
  if (!intakeBlobPath(id)) return { ok: false, error: "invalid" };
  const status = parseIntakeStatus(raw.status);
  if (!status) return { ok: false, error: "invalid" };
  const quoteText = sanitizeText(raw.quoteText, FIELD_LIMITS.quoteText);
  if (status === "quoted" && !quoteText) return { ok: false, error: "invalid" };
  return { ok: true, id, status, quoteText };
}
