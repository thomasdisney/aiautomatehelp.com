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
  customerReply?: string;
};

export const CUSTOMER_DECISIONS = ["accept", "decline", "question"] as const;
export type CustomerDecision = (typeof CUSTOMER_DECISIONS)[number];

export type CustomerActionParse =
  | { ok: true; dropped: true }
  | {
      ok: true;
      dropped: false;
      id: string;
      email: string;
      decision: CustomerDecision;
      note: string;
    }
  | { ok: false; error: "invalid" };

export type ApplyCustomerAction =
  | { ok: true; record: IntakeRecord }
  | { ok: false; error: "not_allowed" };

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
  if (record.customerReply) view.customerReply = record.customerReply;
  return view;
}

export function parseCustomerAction(body: unknown): CustomerActionParse {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid" };
  const raw = body as Record<string, unknown>;
  const honeypot = typeof raw.website === "string" ? raw.website.trim() : "";
  if (honeypot) return { ok: true, dropped: true };

  const idRaw = typeof raw.id === "string" ? raw.id.trim().toLowerCase() : "";
  const email = sanitizeText(raw.email, FIELD_LIMITS.email).toLowerCase();
  const decisionRaw = typeof raw.decision === "string" ? raw.decision.trim() : "";
  const note = sanitizeText(raw.note, FIELD_LIMITS.customerReply);
  if (!intakeBlobPath(idRaw) || !isValidEmail(email)) {
    return { ok: false, error: "invalid" };
  }
  if (!CUSTOMER_DECISIONS.includes(decisionRaw as CustomerDecision)) {
    return { ok: false, error: "invalid" };
  }
  if (decisionRaw === "question" && !note) return { ok: false, error: "invalid" };
  return {
    ok: true,
    dropped: false,
    id: idRaw,
    email,
    decision: decisionRaw as CustomerDecision,
    note,
  };
}

export function applyCustomerAction(
  record: IntakeRecord,
  action: { decision: CustomerDecision; note: string },
  now: string,
): ApplyCustomerAction {
  const stamp = now.slice(0, 40);
  if (action.decision === "question") {
    if (!action.note) return { ok: false, error: "not_allowed" };
    return {
      ok: true,
      record: {
        ...record,
        customerReply: action.note,
        customerReplyAt: stamp,
      },
    };
  }

  if (record.status !== "quoted") return { ok: false, error: "not_allowed" };

  const nextStatus = action.decision === "accept" ? "accepted" : "withdrawn";
  return {
    ok: true,
    record: {
      ...record,
      status: nextStatus,
      customerReply: action.note || record.customerReply,
      customerReplyAt: action.note ? stamp : record.customerReplyAt,
    },
  };
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
