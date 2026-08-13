import { timingSafeEqualString } from "./inbox-auth.ts";
import {
  FIELD_LIMITS,
  appendThread,
  dueAtInRange,
  hydrateThread,
  intakeBlobPath,
  isValidEmail,
  parseDueAt,
  parseIntakeStatus,
  sanitizeText,
  type IntakeRecord,
  type IntakeStatus,
  type ThreadEntry,
} from "./intake.ts";
import { parseAmountCents } from "./payment.ts";

export type PublicStatus = {
  id: string;
  status: IntakeRecord["status"];
  receivedAt: string;
  quoteText?: string;
  customerReply?: string;
  updateText?: string;
  amountCents?: number;
  dueAt?: string;
  doneWhen?: string;
  thread?: ThreadEntry[];
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
      decision: Exclude<CustomerDecision, "accept">;
      note: string;
    }
  | {
      ok: true;
      dropped: false;
      id: string;
      email: string;
      decision: "accept";
      note: string;
      doneWhen: string;
      amountCents: number;
      dueAt: string;
      quoteText: string;
    }
  | { ok: false; error: "invalid" };

export type ApplyCustomerAction =
  | { ok: true; record: IntakeRecord }
  | { ok: false; error: "not_allowed" };

export type InboxPatch =
  | {
      ok: true;
      id: string;
      status: IntakeStatus | null;
      quoteText: string;
      amountCents: number;
      dueAt: string;
      updateText: string;
      operatorNote: string;
      doneWhen: string;
    }
  | { ok: false; error: "invalid" };

export type ApplyOperatorPatch =
  | { ok: true; record: IntakeRecord }
  | { ok: false; error: "not_allowed" };

export type StatusLookup =
  | { ok: true; dropped: true }
  | { ok: true; dropped: false; id: string; email: string }
  | { ok: false; error: "invalid" };

export function parseInboxId(value: unknown): string | null {
  const id = typeof value === "string" ? value.trim().toLowerCase() : "";
  return intakeBlobPath(id) ? id : null;
}

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
  if (record.updateText) view.updateText = record.updateText;
  if (record.amountCents > 0) view.amountCents = record.amountCents;
  if (record.dueAt) view.dueAt = record.dueAt;
  if (record.doneWhen) view.doneWhen = record.doneWhen;
  const thread = hydrateThread(record);
  if (thread.length) view.thread = thread;
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
  const doneWhen = sanitizeText(raw.doneWhen, FIELD_LIMITS.doneWhen);
  if (!intakeBlobPath(idRaw) || !isValidEmail(email)) {
    return { ok: false, error: "invalid" };
  }
  if (!CUSTOMER_DECISIONS.includes(decisionRaw as CustomerDecision)) {
    return { ok: false, error: "invalid" };
  }
  if (decisionRaw === "question" && !note) return { ok: false, error: "invalid" };
  if (decisionRaw === "accept") {
    if (!doneWhen) return { ok: false, error: "invalid" };
    const amountCents = parseAmountCents(raw.amountCents);
    const dueAt = parseDueAt(raw.dueAt);
    const quoteText = sanitizeText(raw.quoteText, FIELD_LIMITS.quoteText);
    if (amountCents === null || !dueAt || !quoteText) return { ok: false, error: "invalid" };
    return {
      ok: true,
      dropped: false,
      id: idRaw,
      email,
      decision: "accept",
      note,
      doneWhen,
      amountCents,
      dueAt,
      quoteText,
    };
  }
  return {
    ok: true,
    dropped: false,
    id: idRaw,
    email,
    decision: decisionRaw as Exclude<CustomerDecision, "accept">,
    note,
  };
}

export function doneWhenMatches(offered: string, accepted: string): boolean {
  const left = sanitizeText(offered, FIELD_LIMITS.doneWhen);
  const right = sanitizeText(accepted, FIELD_LIMITS.doneWhen);
  return Boolean(left) && left === right;
}

export function quoteTextMatches(offered: string, accepted: string): boolean {
  const left = sanitizeText(offered, FIELD_LIMITS.quoteText);
  const right = sanitizeText(accepted, FIELD_LIMITS.quoteText);
  return Boolean(left) && left === right;
}

export function quoteTermsMatch(
  record: { amountCents: number; dueAt: string; doneWhen: string; quoteText: string },
  action: { amountCents?: number; dueAt?: string; doneWhen?: string; quoteText?: string },
): boolean {
  if (!doneWhenMatches(record.doneWhen, action.doneWhen ?? "")) return false;
  if (!quoteTextMatches(record.quoteText, action.quoteText ?? "")) return false;
  const amount = parseAmountCents(action.amountCents);
  if (amount === null || amount !== record.amountCents) return false;
  const dueAt = parseDueAt(action.dueAt ?? "");
  const storedDue = parseDueAt(record.dueAt);
  return Boolean(dueAt && storedDue && dueAt === storedDue);
}

export function applyCustomerAction(
  record: IntakeRecord,
  action: {
    decision: CustomerDecision;
    note: string;
    doneWhen?: string;
    amountCents?: number;
    dueAt?: string;
    quoteText?: string;
  },
  now: string,
): ApplyCustomerAction {
  const stamp = now.slice(0, 40);
  const thread = hydrateThread(record);
  if (action.decision === "question") {
    if (!action.note) return { ok: false, error: "not_allowed" };
    return {
      ok: true,
      record: {
        ...record,
        customerReply: action.note,
        customerReplyAt: stamp,
        thread: appendThread(thread, { role: "customer", text: action.note, at: stamp }),
      },
    };
  }

  if (action.decision === "decline") {
    if (record.status !== "quoted" && record.status !== "accepted") {
      return { ok: false, error: "not_allowed" };
    }
    return {
      ok: true,
      record: {
        ...record,
        status: "withdrawn",
        customerReply: action.note || record.customerReply,
        customerReplyAt: action.note ? stamp : record.customerReplyAt,
        thread: action.note
          ? appendThread(thread, { role: "customer", text: action.note, at: stamp })
          : thread,
      },
    };
  }

  if (record.status !== "quoted") return { ok: false, error: "not_allowed" };
  if (!quoteTermsMatch(record, action)) {
    return { ok: false, error: "not_allowed" };
  }

  return {
    ok: true,
    record: {
      ...record,
      status: "accepted",
      customerReply: action.note || record.customerReply,
      customerReplyAt: action.note ? stamp : record.customerReplyAt,
      thread: action.note
        ? appendThread(thread, { role: "customer", text: action.note, at: stamp })
        : thread,
    },
  };
}

export function parseInboxPatch(body: unknown): InboxPatch {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid" };
  const raw = body as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id.trim().toLowerCase() : "";
  if (!intakeBlobPath(id)) return { ok: false, error: "invalid" };

  const statusRaw = raw.status;
  const hasStatus = statusRaw !== undefined && statusRaw !== null && statusRaw !== "";
  const status = hasStatus ? parseIntakeStatus(statusRaw) : null;
  if (
    hasStatus &&
    (!status || status === "paid" || status === "accepted" || status === "withdrawn")
  ) {
    return { ok: false, error: "invalid" };
  }

  const quoteText = sanitizeText(raw.quoteText, FIELD_LIMITS.quoteText);
  const updateText = sanitizeText(raw.updateText, FIELD_LIMITS.updateText);
  const operatorNote = sanitizeText(raw.operatorNote, FIELD_LIMITS.operatorNote);
  if (!status && !updateText && !operatorNote) return { ok: false, error: "invalid" };
  if (status === "quoted" && !quoteText) return { ok: false, error: "invalid" };
  if (status === "declined" && !updateText) return { ok: false, error: "invalid" };
  if (status === "delivered" && !updateText) return { ok: false, error: "invalid" };
  const amountCents = status === "quoted" ? parseAmountCents(raw.amountCents) : 0;
  if (status === "quoted" && amountCents === null) return { ok: false, error: "invalid" };
  const dueAt = status === "quoted" ? parseDueAt(raw.dueAt) : "";
  if (status === "quoted" && (!dueAt || !dueAtInRange(dueAt))) {
    return { ok: false, error: "invalid" };
  }
  const doneWhen = status === "quoted" ? sanitizeText(raw.doneWhen, FIELD_LIMITS.doneWhen) : "";
  if (status === "quoted" && !doneWhen) return { ok: false, error: "invalid" };
  return {
    ok: true,
    id,
    status,
    quoteText,
    amountCents: amountCents ?? 0,
    dueAt: dueAt || "",
    updateText,
    operatorNote,
    doneWhen,
  };
}

function operatorMayChangeStatus(
  current: IntakeStatus,
  next: IntakeStatus | null,
): boolean {
  if (next === "paid" || next === "accepted" || next === "withdrawn") return false;
  if (!next || next === current) return true;
  if (current === "paid") return next === "delivered";
  if (current === "delivered") return next === "delivered";
  if (current === "accepted") return false;
  if (current === "withdrawn" || current === "declined") return next === "quoted";
  return next !== "delivered";
}

export function applyOperatorPatch(
  record: IntakeRecord,
  patch: {
    status: IntakeStatus | null;
    quoteText: string;
    amountCents: number;
    dueAt: string;
    updateText: string;
    operatorNote?: string;
    doneWhen?: string;
  },
  now: string,
): ApplyOperatorPatch {
  if (!operatorMayChangeStatus(record.status, patch.status)) {
    return { ok: false, error: "not_allowed" };
  }

  const nextStatus = patch.status ?? record.status;
  const nextDoneWhen =
    patch.status === "quoted"
      ? sanitizeText(patch.doneWhen ?? "", FIELD_LIMITS.doneWhen)
      : record.doneWhen || "";
  if (patch.status === "quoted" && !nextDoneWhen) {
    return { ok: false, error: "not_allowed" };
  }

  const stamp = now.slice(0, 40);
  return {
    ok: true,
    record: {
      ...record,
      status: nextStatus,
      quoteText: patch.status === "quoted" ? patch.quoteText : record.quoteText,
      amountCents: patch.status === "quoted" ? patch.amountCents : record.amountCents,
      dueAt: patch.status === "quoted" ? patch.dueAt : record.dueAt,
      doneWhen: nextDoneWhen,
      updateText: patch.updateText ? patch.updateText : record.updateText,
      updateAt: patch.updateText ? stamp : record.updateAt,
      operatorNote: patch.operatorNote ? patch.operatorNote : record.operatorNote || "",
      thread: patch.updateText
        ? appendThread(hydrateThread(record), {
            role: "operator",
            text: patch.updateText,
            at: stamp,
          })
        : hydrateThread(record),
    },
  };
}
