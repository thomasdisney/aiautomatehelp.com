import {
  hydrateThread,
  intakeBlobPath,
  parseIntakeStatus,
  type IntakeRecord,
  type IntakeStatus,
} from "./intake.ts";

export const OPS_EVENTS = [
  "received",
  "quoted",
  "declined",
  "accepted",
  "withdrawn",
  "question",
  "paid",
  "update",
  "delivered",
] as const;
export type OpsEventType = (typeof OPS_EVENTS)[number];

export type OpsEvent = {
  event: OpsEventType;
  id: string;
  status: IntakeStatus;
  at: string;
};

export type OpsWorkItem = {
  id: string;
  status: IntakeStatus;
  event: OpsEventType;
  at: string;
};

export type OpsQueue = {
  received: number;
  quoted: number;
  accepted: number;
  declined: number;
  withdrawn: number;
  paid: number;
  delivered: number;
  questions: number;
  attention: number;
  last: OpsEvent | null;
  needs: OpsWorkItem[];
  waiting: OpsWorkItem[];
};

export function opsLastPath(): string {
  return "ops/last.json";
}

export function isOpsEventType(value: unknown): value is OpsEventType {
  return typeof value === "string" && (OPS_EVENTS as readonly string[]).includes(value);
}

export function toOpsEvent(input: {
  event: unknown;
  id: unknown;
  status: unknown;
  at: unknown;
}): OpsEvent | null {
  const event = typeof input.event === "string" ? input.event.trim() : "";
  const id = typeof input.id === "string" ? input.id.trim().toLowerCase() : "";
  const status = parseIntakeStatus(input.status);
  const atRaw = typeof input.at === "string" ? input.at.trim().slice(0, 40) : "";
  if (!isOpsEventType(event) || !intakeBlobPath(id) || !status || !atRaw) return null;
  return { event, id, status, at: atRaw };
}

export function parseOpsEvent(raw: string): OpsEvent | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return toOpsEvent({
    event: row.event,
    id: row.id,
    status: row.status,
    at: row.at,
  });
}

export function eventFromCustomerDecision(
  decision: "accept" | "decline" | "question",
): OpsEventType {
  if (decision === "accept") return "accepted";
  if (decision === "decline") return "withdrawn";
  return "question";
}

export function eventFromStatus(status: IntakeStatus): OpsEventType {
  return status;
}

export function emptyQueue(last: OpsEvent | null = null): OpsQueue {
  return {
    received: 0,
    quoted: 0,
    accepted: 0,
    declined: 0,
    withdrawn: 0,
    paid: 0,
    delivered: 0,
    questions: 0,
    attention: 0,
    last,
    needs: [],
    waiting: [],
  };
}

export function hasOpenQuestion(record: IntakeRecord): boolean {
  const thread = hydrateThread(record);
  if (thread.length) {
    let lastCustomer = "";
    let lastOperator = "";
    for (const entry of thread) {
      if (entry.role === "customer") lastCustomer = entry.at;
      if (entry.role === "operator") lastOperator = entry.at;
    }
    if (!lastCustomer) return false;
    if (!lastOperator) return true;
    return lastOperator < lastCustomer;
  }
  if (!record.customerReply) return false;
  if (!record.updateAt) return true;
  if (!record.customerReplyAt) return true;
  return record.updateAt < record.customerReplyAt;
}

export function hasPublicOperatorUpdate(record: IntakeRecord): boolean {
  const thread = hydrateThread(record);
  if (thread.length) {
    return thread.some((entry) => entry.role === "operator");
  }
  return Boolean(record.updateText);
}

export function isWaitingOnCustomer(record: IntakeRecord): boolean {
  if (record.status !== "received") return false;
  if (hasOpenQuestion(record)) return false;
  return hasPublicOperatorUpdate(record);
}

export function toWorkItem(record: IntakeRecord): OpsWorkItem | null {
  const open = hasOpenQuestion(record);
  if (isWaitingOnCustomer(record)) return null;
  const waiting =
    record.status === "received" || record.status === "accepted" || record.status === "paid";
  if (!open && !waiting) return null;

  const event: OpsEventType = open ? "question" : eventFromStatus(record.status);
  const at =
    event === "question"
      ? record.customerReplyAt || record.receivedAt
      : record.status === "paid"
        ? record.paidAt || record.receivedAt
        : record.status === "accepted"
          ? record.customerReplyAt || record.receivedAt
          : record.receivedAt;
  return {
    id: record.id,
    status: record.status,
    event,
    at: at.slice(0, 40),
  };
}

export function toWaitingItem(record: IntakeRecord): OpsWorkItem | null {
  if (!isWaitingOnCustomer(record)) return null;
  const at = record.updateAt || record.receivedAt;
  return {
    id: record.id,
    status: record.status,
    event: "received",
    at: at.slice(0, 40),
  };
}

export function summarizeQueue(records: IntakeRecord[], last: OpsEvent | null): OpsQueue {
  const queue = emptyQueue(last);
  for (const record of records) {
    queue[record.status] += 1;
    if (hasOpenQuestion(record)) queue.questions += 1;
    const item = toWorkItem(record);
    if (item) queue.needs.push(item);
    const waiting = toWaitingItem(record);
    if (waiting) queue.waiting.push(waiting);
  }
  queue.attention = queue.needs.length;
  return queue;
}

export function opsSignalPayload(event: OpsEvent): OpsEvent {
  return {
    event: event.event,
    id: event.id,
    status: event.status,
    at: event.at,
  };
}

export function opsSignalUrl(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const raw = env.OPS_SIGNAL_URL?.trim() ?? "";
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function queueJsonHasCustomerText(json: string): boolean {
  const lowered = json.toLowerCase();
  return (
    lowered.includes("email") ||
    lowered.includes("message") ||
    lowered.includes("name") ||
    lowered.includes("company") ||
    lowered.includes("quotetext") ||
    lowered.includes("customerreply") ||
    lowered.includes("updatetext") ||
    lowered.includes("operatornote") ||
    lowered.includes('"thread"')
  );
}

export const INBOX_LIST_VIEWS = ["queue", "ids"] as const;
export type InboxListView = (typeof INBOX_LIST_VIEWS)[number];

export type InboxIdRow = {
  id: string;
  status: IntakeStatus;
  receivedAt: string;
};

export function parseInboxListView(value: unknown): InboxListView | "invalid" {
  if (value === null || value === undefined || value === "") return "queue";
  if (typeof value !== "string") return "invalid";
  const view = value.trim().toLowerCase();
  if (view === "queue") return "queue";
  if (view === "ids") return "ids";
  return "invalid";
}

export function toInboxIdRow(record: IntakeRecord): InboxIdRow | null {
  if (!intakeBlobPath(record.id)) return null;
  return {
    id: record.id,
    status: record.status,
    receivedAt: record.receivedAt.slice(0, 40),
  };
}

export function toInboxIdRows(records: IntakeRecord[]): InboxIdRow[] {
  const rows: InboxIdRow[] = [];
  for (const record of records) {
    const row = toInboxIdRow(record);
    if (row) rows.push(row);
  }
  return rows;
}
