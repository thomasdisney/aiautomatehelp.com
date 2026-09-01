import {
  hydrateThread,
  intakeBlobPath,
  parseDueAt,
  parseIntakeStatus,
  type IntakeRecord,
  type IntakeStatus,
} from "./intake.ts";
import { parseAmountCents } from "./payment.ts";
import { emailsMatch } from "./status.ts";

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
  "confirmed",
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

export function opsLastAfterDelete(
  last: OpsEvent | null,
  deletedId: string,
): OpsEvent | null {
  if (!last) return null;
  const id = typeof deletedId === "string" ? deletedId.trim().toLowerCase() : "";
  if (!intakeBlobPath(id)) {
    return {
      event: last.event,
      id: last.id,
      status: last.status,
      at: last.at,
    };
  }
  if (last.id === id) return null;
  return {
    event: last.event,
    id: last.id,
    status: last.status,
    at: last.at,
  };
}

export function eventFromCustomerDecision(
  decision: "accept" | "decline" | "question" | "confirm",
): OpsEventType {
  if (decision === "accept") return "accepted";
  if (decision === "decline") return "withdrawn";
  if (decision === "confirm") return "confirmed";
  return "question";
}

function eventStamp(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 40) : "";
}

export function customerEventAt(
  record: {
    acceptedAt?: string;
    confirmedAt?: string;
    withdrawnAt?: string;
    customerReplyAt?: string;
  },
  decision: "accept" | "decline" | "question" | "confirm",
): string {
  if (decision === "decline") {
    const at = eventStamp(record.withdrawnAt);
    if (at) return at;
  } else if (decision === "confirm") {
    const at = eventStamp(record.confirmedAt);
    if (at) return at;
  } else if (decision === "accept") {
    const at = eventStamp(record.acceptedAt);
    if (at) return at;
  }
  return eventStamp(record.customerReplyAt);
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

function closedAtStamp(record: IntakeRecord): string {
  const stamps = [
    eventStamp(record.confirmedAt),
    eventStamp(record.withdrawnAt),
    eventStamp(record.acceptedAt),
  ].filter(Boolean);
  if (!stamps.length) return "";
  return stamps.reduce((latest, at) => (at > latest ? at : latest));
}

function isAfterClose(at: string, closedAt: string): boolean {
  if (!closedAt) return true;
  return at > closedAt;
}

export function hasOpenQuestion(record: IntakeRecord): boolean {
  const closedAt = closedAtStamp(record);
  const thread = hydrateThread(record);
  if (thread.length) {
    let lastCustomer = "";
    let lastOperator = "";
    for (const entry of thread) {
      if (!isAfterClose(entry.at, closedAt)) continue;
      if (entry.role === "customer") lastCustomer = entry.at;
      if (entry.role === "operator") lastOperator = entry.at;
    }
    if (!lastCustomer) return false;
    if (!lastOperator) return true;
    return lastOperator < lastCustomer;
  }
  if (!record.customerReply) return false;
  const replyAt =
    typeof record.customerReplyAt === "string" ? record.customerReplyAt.trim().slice(0, 40) : "";
  if (closedAt && (!replyAt || !isAfterClose(replyAt, closedAt))) return false;
  if (!record.updateAt) return true;
  if (!replyAt) return true;
  return record.updateAt < replyAt;
}

export function openQuestionAt(record: IntakeRecord): string | null {
  if (!hasOpenQuestion(record)) return null;
  const closedAt = closedAtStamp(record);
  const thread = hydrateThread(record);
  if (thread.length) {
    for (let i = thread.length - 1; i >= 0; i -= 1) {
      if (thread[i].role !== "customer") continue;
      if (!isAfterClose(thread[i].at, closedAt)) continue;
      const at = thread[i].at.trim().slice(0, 40);
      if (at) return at;
    }
  }
  const replyAt =
    typeof record.customerReplyAt === "string" ? record.customerReplyAt.trim().slice(0, 40) : "";
  if (replyAt && isAfterClose(replyAt, closedAt)) return replyAt;
  return null;
}

export function hasPublicOperatorUpdate(record: IntakeRecord): boolean {
  const thread = hydrateThread(record);
  if (thread.length) {
    return thread.some((entry) => entry.role === "operator");
  }
  return Boolean(record.updateText);
}

export type QueueOptions = {
  paymentConnected?: boolean;
};

export function isWaitingOnCustomer(
  record: IntakeRecord,
  paymentConnected = false,
): boolean {
  if (hasOpenQuestion(record)) return false;
  if (record.status === "quoted") return true;
  if (record.status === "accepted") return paymentConnected;
  if (record.status === "delivered") return !record.confirmedAt;
  if (record.status !== "received") return false;
  return hasPublicOperatorUpdate(record);
}

export function toWorkItem(
  record: IntakeRecord,
  paymentConnected = false,
): OpsWorkItem | null {
  const open = hasOpenQuestion(record);
  if (isWaitingOnCustomer(record, paymentConnected)) return null;
  const needsWork =
    record.status === "received" ||
    record.status === "paid" ||
    (record.status === "accepted" && !paymentConnected);
  if (!open && !needsWork) return null;

  const event: OpsEventType = open ? "question" : eventFromStatus(record.status);
  const at =
    event === "question"
      ? record.customerReplyAt || record.receivedAt
      : record.status === "paid"
        ? record.paidAt || record.receivedAt
        : record.status === "accepted"
          ? record.acceptedAt || record.customerReplyAt || record.updateAt || record.receivedAt
          : record.receivedAt;
  return {
    id: record.id,
    status: record.status,
    event,
    at: at.slice(0, 40),
  };
}

export function compareWorkItems(a: OpsWorkItem, b: OpsWorkItem): number {
  const byAt = b.at.localeCompare(a.at);
  if (byAt !== 0) return byAt;
  return a.id.localeCompare(b.id);
}

export function sortWorkItems(items: OpsWorkItem[]): OpsWorkItem[] {
  return [...items].sort(compareWorkItems);
}

export function toWaitingItem(
  record: IntakeRecord,
  paymentConnected = false,
): OpsWorkItem | null {
  if (!isWaitingOnCustomer(record, paymentConnected)) return null;
  const at =
    record.status === "accepted"
      ? record.acceptedAt || record.updateAt || record.customerReplyAt || record.receivedAt
      : record.status === "delivered"
        ? record.updateAt || record.paidAt || record.receivedAt
        : record.updateAt || record.receivedAt;
  const event =
    record.status === "quoted"
      ? "quoted"
      : record.status === "accepted"
        ? "accepted"
        : record.status === "delivered"
          ? "delivered"
          : "received";
  return {
    id: record.id,
    status: record.status,
    event,
    at: at.slice(0, 40),
  };
}

export function summarizeQueue(
  records: IntakeRecord[],
  last: OpsEvent | null,
  options: QueueOptions = {},
): OpsQueue {
  const paymentConnected = Boolean(options.paymentConnected);
  const queue = emptyQueue(last);
  for (const record of records) {
    queue[record.status] += 1;
    if (hasOpenQuestion(record)) queue.questions += 1;
    const item = toWorkItem(record, paymentConnected);
    if (item) queue.needs.push(item);
    const waiting = toWaitingItem(record, paymentConnected);
    if (waiting) queue.waiting.push(waiting);
  }
  queue.needs = sortWorkItems(queue.needs);
  queue.waiting = sortWorkItems(queue.waiting);
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
    lowered.includes("donewhen") ||
    lowered.includes('"thread"')
  );
}

export const INBOX_LIST_VIEWS = ["queue", "ids"] as const;
export type InboxListView = (typeof INBOX_LIST_VIEWS)[number];

export type InboxIdRow = {
  id: string;
  status: IntakeStatus;
  receivedAt: string;
  confirmedAt?: string;
  dueAt?: string;
  amountCents?: number;
  questionAt?: string;
  updateAt?: string;
  acceptedAt?: string;
  deliveredAt?: string;
  withdrawnAt?: string;
  declinedAt?: string;
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
  const row: InboxIdRow = {
    id: record.id,
    status: record.status,
    receivedAt: record.receivedAt.slice(0, 40),
  };
  const confirmedAt =
    typeof record.confirmedAt === "string" ? record.confirmedAt.trim().slice(0, 40) : "";
  if (confirmedAt) row.confirmedAt = confirmedAt;
  const dueAt = parseDueAt(record.dueAt);
  if (dueAt) row.dueAt = dueAt;
  const amountCents = parseAmountCents(record.amountCents);
  if (amountCents !== null) row.amountCents = amountCents;
  const questionAt = openQuestionAt(record);
  if (questionAt) row.questionAt = questionAt;
  const updateAt =
    typeof record.updateAt === "string" ? record.updateAt.trim().slice(0, 40) : "";
  if (updateAt) row.updateAt = updateAt;
  const acceptedAt =
    typeof record.acceptedAt === "string" ? record.acceptedAt.trim().slice(0, 40) : "";
  if (acceptedAt) row.acceptedAt = acceptedAt;
  const deliveredAt =
    typeof record.deliveredAt === "string" ? record.deliveredAt.trim().slice(0, 40) : "";
  if (deliveredAt) row.deliveredAt = deliveredAt;
  const withdrawnAt =
    typeof record.withdrawnAt === "string" ? record.withdrawnAt.trim().slice(0, 40) : "";
  if (withdrawnAt) row.withdrawnAt = withdrawnAt;
  const declinedAt =
    typeof record.declinedAt === "string" ? record.declinedAt.trim().slice(0, 40) : "";
  if (declinedAt) row.declinedAt = declinedAt;
  return row;
}

export function toInboxIdRows(records: IntakeRecord[]): InboxIdRow[] {
  const rows: InboxIdRow[] = [];
  for (const record of records) {
    const row = toInboxIdRow(record);
    if (row) rows.push(row);
  }
  return rows;
}

export function toInboxIdRowsForEmail(records: IntakeRecord[], email: string): InboxIdRow[] {
  const rows: InboxIdRow[] = [];
  for (const record of records) {
    if (!emailsMatch(record.email, email)) continue;
    const row = toInboxIdRow(record);
    if (row) rows.push(row);
  }
  return rows;
}
