import { createHash } from "node:crypto";
import {
  hydrateThread,
  intakeBlobPath,
  intakeIdFromBlobPath,
  isValidEmail,
  parseDueAt,
  parseIntakeStatus,
  sanitizeText,
  FIELD_LIMITS,
  type IntakeRecord,
  type IntakeStatus,
} from "./intake.ts";
import { parseAmountCents } from "./payment.ts";
import { emailsMatch, hasOpenQuestion, openQuestionAt } from "./status.ts";

export { hasOpenQuestion, openQuestionAt };

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

export function opsWorkPath(): string {
  return "ops/work.json";
}

export function opsWorkPathFromPath(pathname: unknown): string | null {
  if (typeof pathname !== "string") return null;
  const raw = pathname.trim();
  if (raw.includes("\0") || raw.includes("\\") || raw.includes("..")) return null;
  const normalized = raw.toLowerCase();
  if (normalized !== "ops/work.json") return null;
  return "ops/work.json";
}

export function opsLastPathFromPath(pathname: unknown): string | null {
  if (typeof pathname !== "string") return null;
  const raw = pathname.trim();
  if (raw.includes("\0") || raw.includes("\\") || raw.includes("..")) return null;
  const normalized = raw.toLowerCase();
  if (normalized !== "ops/last.json") return null;
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

export function toOpsLastPayload(input: {
  event: unknown;
  id: unknown;
  status: unknown;
  at: unknown;
}): (OpsEvent & { path: string }) | null {
  const event = toOpsEvent(input);
  if (!event) return null;
  return {
    event: event.event,
    id: event.id,
    status: event.status,
    at: event.at,
    path: opsLastPath(),
  };
}

export function parseOpsEventAtPath(raw: string, pathname: unknown): OpsEvent | null {
  const expected = opsLastPathFromPath(pathname);
  if (!expected) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    !("path" in row) ||
    "ids" in row ||
    "digest" in row ||
    "receivedAt" in row ||
    "quotedAt" in row ||
    "dueAt" in row ||
    "updateAt" in row ||
    "acceptedAt" in row ||
    "declinedAt" in row ||
    "confirmedAt" in row ||
    "deliveredAt" in row ||
    "paidAt" in row ||
    "withdrawnAt" in row ||
    "customerReplyAt" in row ||
    "notedAt" in row ||
    "quoteText" in row ||
    "amountCents" in row ||
    "doneWhen" in row ||
    "customerReply" in row
  ) {
    return null;
  }
  const path = typeof row.path === "string" ? row.path.trim().toLowerCase() : "";
  if (path !== expected) return null;
  return parseOpsEvent(raw);
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

function latestStamp(...values: unknown[]): string {
  let latest = "";
  for (const value of values) {
    const at = eventStamp(value);
    if (at && at > latest) latest = at;
  }
  return latest;
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
        ? latestStamp(
            record.paidAt,
            record.updateAt,
            record.customerReplyAt,
            record.receivedAt,
          )
        : record.status === "accepted"
          ? latestStamp(
              record.acceptedAt,
              record.updateAt,
              record.customerReplyAt,
              record.receivedAt,
            )
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
      ? latestStamp(
          record.acceptedAt,
          record.updateAt,
          record.customerReplyAt,
          record.receivedAt,
        )
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
  quotedAt?: string;
  replyAt?: string;
  paidAt?: string;
  notedAt?: string;
};

export const INTAKE_LIST_GET_LIMIT = 50;
export const INTAKE_LIST_META_MAX = 200;
export const EMAIL_INDEX_MAX_IDS = 50;
export const WORK_INDEX_MAX_IDS = 50;

const EMAIL_INDEX_DIGEST_RE = /^[0-9a-f]{64}$/;

export function emailIndexDigest(email: string): string | null {
  const normalized = sanitizeText(email, FIELD_LIMITS.email).toLowerCase();
  if (!isValidEmail(normalized)) return null;
  const digest = createHash("sha256").update(normalized).digest("hex");
  return EMAIL_INDEX_DIGEST_RE.test(digest) ? digest : null;
}

export function emailIndexPath(email: string): string | null {
  const digest = emailIndexDigest(email);
  return digest ? `ops/xref/${digest}.json` : null;
}

export function emailIndexPathFromPath(pathname: unknown): string | null {
  const digest = emailIndexDigestFromPath(pathname);
  return digest ? `ops/xref/${digest}.json` : null;
}

export function emailIndexDigestFromPath(pathname: unknown): string | null {
  if (typeof pathname !== "string") return null;
  const raw = pathname.trim();
  if (!raw.startsWith("ops/xref/") || !raw.endsWith(".json")) return null;
  if (raw.includes("\0") || raw.includes("\\") || raw.includes("..")) return null;
  const digest = raw.slice("ops/xref/".length, -".json".length).trim().toLowerCase();
  if (!digest || digest.includes("/") || digest.includes("\\") || digest.includes("..")) {
    return null;
  }
  return EMAIL_INDEX_DIGEST_RE.test(digest) ? digest : null;
}

function parseIndexId(value: unknown): string | null {
  const id = typeof value === "string" ? value.trim().toLowerCase() : "";
  return intakeBlobPath(id) ? id : null;
}

export function parseIdIndex(raw: string, max = EMAIL_INDEX_MAX_IDS): string[] {
  const cap = Number.isInteger(max) ? Math.min(Math.max(max, 0), INTAKE_LIST_META_MAX) : 0;
  if (!cap) return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  const idsRaw = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? (value as { ids?: unknown }).ids
      : null;
  if (!Array.isArray(idsRaw)) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of idsRaw) {
    const id = parseIndexId(item);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= cap) break;
  }
  return ids;
}

export function parseEmailIndex(raw: string): string[] {
  return parseIdIndex(raw, EMAIL_INDEX_MAX_IDS);
}

export function toEmailIndexPayload(
  ids: string[],
  email: string,
): { ids: string[]; digest: string; path: string } | null {
  const digest = emailIndexDigest(email);
  const path = emailIndexPath(email);
  if (!digest || !path) return null;
  return {
    ids: parseIdIndex(JSON.stringify({ ids }), EMAIL_INDEX_MAX_IDS),
    digest,
    path,
  };
}

export function parseEmailIndexAtPath(
  raw: string,
  pathname: unknown,
  email?: string,
): string[] {
  const expectedPath = emailIndexPathFromPath(pathname);
  const expectedDigest = emailIndexDigestFromPath(pathname);
  if (!expectedPath || !expectedDigest) return [];
  if (email !== undefined) {
    const digest = emailIndexDigest(email);
    if (digest !== expectedDigest) return [];
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const row = value as Record<string, unknown>;
  if (
    !("path" in row) ||
    !("digest" in row) ||
    "event" in row ||
    "at" in row ||
    "receivedAt" in row ||
    "quotedAt" in row ||
    "dueAt" in row ||
    "updateAt" in row ||
    "acceptedAt" in row ||
    "declinedAt" in row ||
    "confirmedAt" in row ||
    "deliveredAt" in row ||
    "paidAt" in row ||
    "withdrawnAt" in row ||
    "customerReplyAt" in row ||
    "notedAt" in row ||
    "quoteText" in row ||
    "amountCents" in row ||
    "doneWhen" in row
  ) {
    return [];
  }
  const path = typeof row.path === "string" ? row.path.trim().toLowerCase() : "";
  if (path !== expectedPath) return [];
  const digest = typeof row.digest === "string" ? row.digest.trim().toLowerCase() : "";
  if (digest !== expectedDigest) return [];
  if ("email" in row) {
    const emailDigest = emailIndexDigest(typeof row.email === "string" ? row.email : "");
    if (emailDigest !== expectedDigest) return [];
  }
  return parseIdIndex(raw, EMAIL_INDEX_MAX_IDS);
}

export function parseWorkIndex(raw: string): string[] {
  return parseIdIndex(raw, WORK_INDEX_MAX_IDS);
}

export function toWorkIndexPayload(ids: string[]): { ids: string[]; path: string } {
  return {
    ids: parseIdIndex(JSON.stringify({ ids }), WORK_INDEX_MAX_IDS),
    path: opsWorkPath(),
  };
}

export function parseWorkIndexAtPath(raw: string, pathname: unknown): string[] {
  const expected = opsWorkPathFromPath(pathname);
  if (!expected) return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const row = value as Record<string, unknown>;
  if (
    !("path" in row) ||
    "digest" in row ||
    "event" in row ||
    "at" in row ||
    "receivedAt" in row ||
    "quotedAt" in row ||
    "dueAt" in row ||
    "updateAt" in row ||
    "acceptedAt" in row ||
    "declinedAt" in row ||
    "confirmedAt" in row ||
    "deliveredAt" in row ||
    "paidAt" in row ||
    "withdrawnAt" in row ||
    "customerReplyAt" in row ||
    "notedAt" in row ||
    "quoteText" in row ||
    "amountCents" in row ||
    "doneWhen" in row
  ) {
    return [];
  }
  const path = typeof row.path === "string" ? row.path.trim().toLowerCase() : "";
  if (path !== expected) return [];
  return parseIdIndex(raw, WORK_INDEX_MAX_IDS);
}

function idIndexAfterAdd(ids: string[], id: string, max: number): string[] {
  const nextId = parseIndexId(id);
  if (!nextId) {
    return parseIdIndex(JSON.stringify({ ids }), max);
  }
  const kept = parseIdIndex(JSON.stringify({ ids }), max).filter((item) => item !== nextId);
  return [nextId, ...kept].slice(0, max);
}

function idIndexAfterDelete(ids: string[], id: string, max: number): string[] {
  const drop = parseIndexId(id);
  const kept = parseIdIndex(JSON.stringify({ ids }), max);
  if (!drop) return kept;
  return kept.filter((item) => item !== drop);
}

export function emailIndexAfterAdd(ids: string[], id: string): string[] {
  return idIndexAfterAdd(ids, id, EMAIL_INDEX_MAX_IDS);
}

export function emailIndexAfterDelete(ids: string[], id: string): string[] {
  return idIndexAfterDelete(ids, id, EMAIL_INDEX_MAX_IDS);
}

export function workIndexAfterAdd(ids: string[], id: string): string[] {
  return idIndexAfterAdd(ids, id, WORK_INDEX_MAX_IDS);
}

export function workIndexAfterDelete(ids: string[], id: string): string[] {
  return idIndexAfterDelete(ids, id, WORK_INDEX_MAX_IDS);
}

export function workIndexAfterSave(
  ids: string[],
  record: IntakeRecord,
  paymentConnected = false,
): string[] {
  const id = typeof record.id === "string" ? record.id : "";
  if (!intakeBlobPath(id)) {
    return parseWorkIndex(JSON.stringify({ ids }));
  }
  if (toWorkItem(record, paymentConnected) || toWaitingItem(record, paymentConnected)) {
    return workIndexAfterAdd(ids, id);
  }
  return workIndexAfterDelete(ids, id);
}

export function selectIntakeByEmail(
  records: IntakeRecord[],
  email: string,
  limit: number,
): IntakeRecord[] {
  return mergeIntakeForEmail([], records, email, limit);
}

export function mergeIntakeForEmail(
  indexed: IntakeRecord[],
  recent: IntakeRecord[],
  email: string,
  limit: number,
): IntakeRecord[] {
  const normalized = sanitizeText(email, FIELD_LIMITS.email).toLowerCase();
  if (!isValidEmail(normalized)) return [];
  const match = (record: IntakeRecord) => emailsMatch(record.email, normalized);
  return selectIntakeForList(indexed.filter(match), recent.filter(match), limit);
}

export function mergeIntakeForQueue(
  indexed: IntakeRecord[],
  recent: IntakeRecord[],
): IntakeRecord[] {
  const byId = new Map<string, IntakeRecord>();
  for (const record of [...indexed, ...recent]) {
    if (!intakeBlobPath(record.id)) continue;
    byId.set(record.id, record);
  }
  return [...byId.values()];
}

function isOpenWork(record: IntakeRecord, paymentConnected = false): boolean {
  return Boolean(toWorkItem(record, paymentConnected) || toWaitingItem(record, paymentConnected));
}

export function selectIntakeForList(
  indexed: IntakeRecord[],
  recent: IntakeRecord[],
  limit: number,
  paymentConnected = false,
): IntakeRecord[] {
  const cap = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 0), INTAKE_LIST_META_MAX)
    : 0;
  if (cap === 0) return [];
  const merged = mergeIntakeForQueue(indexed, recent);
  const open: IntakeRecord[] = [];
  const closed: IntakeRecord[] = [];
  for (const record of merged) {
    if (isOpenWork(record, paymentConnected)) {
      open.push(record);
    } else {
      closed.push(record);
    }
  }
  const openSorted = selectIntakeForInbox(open, cap);
  const remaining = cap - openSorted.length;
  const closedSorted = remaining > 0 ? selectIntakeForInbox(closed, remaining) : [];
  return [...openSorted, ...closedSorted];
}

export type IntakeBlobMeta = {
  pathname?: unknown;
  uploadedAt?: unknown;
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
  const quotedAt =
    typeof record.quotedAt === "string" ? record.quotedAt.trim().slice(0, 40) : "";
  if (quotedAt) row.quotedAt = quotedAt;
  const replyAt =
    typeof record.customerReplyAt === "string" ? record.customerReplyAt.trim().slice(0, 40) : "";
  if (replyAt) row.replyAt = replyAt;
  const paidAt =
    typeof record.paidAt === "string" ? record.paidAt.trim().slice(0, 40) : "";
  if (paidAt) row.paidAt = paidAt;
  const notedAt =
    typeof record.notedAt === "string" ? record.notedAt.trim().slice(0, 40) : "";
  if (notedAt) row.notedAt = notedAt;
  return row;
}

export function inboxActivityAt(record: IntakeRecord): string {
  return latestStamp(
    record.receivedAt,
    record.updateAt,
    record.customerReplyAt,
    record.acceptedAt,
    record.deliveredAt,
    record.withdrawnAt,
    record.declinedAt,
    record.quotedAt,
    record.confirmedAt,
    record.paidAt,
    record.notedAt,
  );
}

function intakePathFromBlob(pathname: unknown): string | null {
  const id = intakeIdFromBlobPath(pathname);
  return id ? intakeBlobPath(id) : null;
}

function uploadedAtMs(value: unknown): number {
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const ms = Date.parse(value.trim().slice(0, 40));
    return Number.isFinite(ms) ? ms : 0;
  }
  return 0;
}

export function rankIntakeBlobs(blobs: IntakeBlobMeta[], getLimit: number): string[] {
  const cap = Number.isInteger(getLimit) ? Math.min(Math.max(getLimit, 0), INTAKE_LIST_META_MAX) : 0;
  if (cap === 0) return [];
  const rows: { path: string; at: number }[] = [];
  for (const blob of blobs) {
    const path = intakePathFromBlob(blob.pathname);
    if (!path) continue;
    rows.push({ path, at: uploadedAtMs(blob.uploadedAt) || 1 });
  }
  rows.sort((a, b) => {
    if (b.at !== a.at) return b.at - a.at;
    return a.path.localeCompare(b.path);
  });
  const seen = new Set<string>();
  const paths: string[] = [];
  for (const row of rows) {
    if (seen.has(row.path)) continue;
    seen.add(row.path);
    paths.push(row.path);
    if (paths.length >= cap) break;
  }
  return paths;
}

export function selectIntakeForInbox(records: IntakeRecord[], limit: number): IntakeRecord[] {
  const cap = Number.isInteger(limit) ? Math.min(Math.max(limit, 0), INTAKE_LIST_META_MAX) : 0;
  if (cap === 0) return [];
  return [...records]
    .sort((a, b) => {
      const byAt = inboxActivityAt(b).localeCompare(inboxActivityAt(a));
      if (byAt !== 0) return byAt;
      return a.id.localeCompare(b.id);
    })
    .slice(0, cap);
}

function toSortedInboxIdRows(records: IntakeRecord[]): InboxIdRow[] {
  const rows: { row: InboxIdRow; at: string; open: boolean }[] = [];
  for (const record of records) {
    const row = toInboxIdRow(record);
    if (row) {
      rows.push({
        row,
        at: inboxActivityAt(record),
        open: isOpenWork(record),
      });
    }
  }
  rows.sort((a, b) => {
    if (a.open !== b.open) return a.open ? -1 : 1;
    const byAt = b.at.localeCompare(a.at);
    if (byAt !== 0) return byAt;
    return a.row.id.localeCompare(b.row.id);
  });
  return rows.map((item) => item.row);
}

export function toInboxIdRows(records: IntakeRecord[]): InboxIdRow[] {
  return toSortedInboxIdRows(records);
}

export function toInboxIdRowsForEmail(records: IntakeRecord[], email: string): InboxIdRow[] {
  return toSortedInboxIdRows(records.filter((record) => emailsMatch(record.email, email)));
}
