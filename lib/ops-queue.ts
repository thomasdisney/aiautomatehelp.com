import {
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
] as const;
export type OpsEventType = (typeof OPS_EVENTS)[number];

export type OpsEvent = {
  event: OpsEventType;
  id: string;
  status: IntakeStatus;
  at: string;
};

export type OpsQueue = {
  received: number;
  quoted: number;
  accepted: number;
  declined: number;
  withdrawn: number;
  questions: number;
  attention: number;
  last: OpsEvent | null;
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
    questions: 0,
    attention: 0,
    last,
  };
}

export function summarizeQueue(records: IntakeRecord[], last: OpsEvent | null): OpsQueue {
  const queue = emptyQueue(last);
  for (const record of records) {
    queue[record.status] += 1;
    if (record.customerReply && record.status === "quoted") queue.questions += 1;
  }
  queue.attention = queue.received + queue.questions + queue.accepted;
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
    lowered.includes("customerreply")
  );
}
