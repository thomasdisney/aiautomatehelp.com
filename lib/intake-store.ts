import {
  detectIntakeBackend,
  intakeBlobPath,
  intakeBlobPutOptions,
  parseIntakeRecord,
  toIntakeRecord,
  type IntakeFields,
  type IntakeRecord,
} from "@/lib/intake";
import {
  customerEventAt,
  eventFromCustomerDecision,
  eventFromStatus,
  INTAKE_LIST_GET_LIMIT,
  INTAKE_LIST_META_MAX,
  opsLastAfterDelete,
  opsLastPath,
  opsSignalPayload,
  opsSignalUrl,
  parseOpsEvent,
  rankIntakeBlobs,
  selectIntakeForInbox,
  summarizeQueue,
  toOpsEvent,
  type OpsEvent,
  type OpsQueue,
} from "@/lib/ops-queue";
import { applyPaid, paymentConfigured } from "@/lib/payment";
import {
  applyCustomerAction,
  applyOperatorPatch,
  emailsMatch,
  type CustomerDecision,
} from "@/lib/status";

export {
  detectIntakeBackend,
  intakeBlobPath,
  intakeBlobPutOptions,
  parseIntakeRecord,
  toIntakeRecord,
} from "@/lib/intake";
export type { IntakeBackend, IntakeRecord } from "@/lib/intake";

export function intakeStoreConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return detectIntakeBackend(env) !== "none";
}

function assertSafeDir(dir: string): string {
  if (!dir.startsWith("/") || dir.includes("\0") || dir.includes("..")) {
    throw new Error("unsafe_intake_dir");
  }
  return dir;
}

export async function saveIntake(record: IntakeRecord): Promise<boolean> {
  const backend = detectIntakeBackend();
  try {
    if (backend === "blob") return await persistBlob(record);
    if (backend === "webhook") {
      return await persistWebhook(record, process.env.INTAKE_WEBHOOK_URL ?? "");
    }
    if (backend === "dir") {
      return await persistDir(record, process.env.INTAKE_DIR ?? "");
    }
  } catch {
    return false;
  }
  return false;
}

export type UpdateIntakeResult =
  | { ok: true; record: IntakeRecord }
  | { ok: false; error: "not_found" | "store" | "not_allowed" };

export async function updateIntake(
  id: string,
  patch: {
    status: IntakeRecord["status"] | null;
    quoteText: string;
    amountCents: number;
    dueAt: string;
    updateText: string;
    operatorNote: string;
    doneWhen: string;
  },
): Promise<UpdateIntakeResult> {
  const current = await getIntake(id);
  if (!current) return { ok: false, error: "not_found" };
  const applied = applyOperatorPatch(current, patch, new Date().toISOString(), {
    paymentConnected: paymentConfigured(),
  });
  if (!applied.ok) return applied;
  const stored = await saveIntake(applied.record);
  if (stored) {
    const statusChanged = applied.record.status !== current.status;
    const publicUpdate = Boolean(patch.updateText);
    if (statusChanged || publicUpdate) {
      const event = statusChanged
        ? eventFromStatus(applied.record.status)
        : "update";
      await recordOpsEvent({
        event,
        id: applied.record.id,
        status: applied.record.status,
        at: applied.record.updateAt || new Date().toISOString(),
      });
    }
  }
  return stored ? { ok: true, record: applied.record } : { ok: false, error: "store" };
}

async function persistBlob(record: IntakeRecord): Promise<boolean> {
  const path = intakeBlobPath(record.id);
  if (!path) return false;
  const { put } = await import("@vercel/blob");
  await put(path, JSON.stringify(record), intakeBlobPutOptions());
  return true;
}

async function persistWebhook(record: IntakeRecord, webhook: string): Promise<boolean> {
  const url = new URL(webhook);
  if (url.protocol !== "https:") return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-intake-id": record.id,
      },
      body: JSON.stringify(record),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function persistDir(record: IntakeRecord, dir: string): Promise<boolean> {
  const path = intakeBlobPath(record.id);
  if (!path) return false;
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const safe = assertSafeDir(dir);
  await mkdir(safe, { recursive: true });
  await writeFile(join(safe, `${record.id}.json`), JSON.stringify(record, null, 2), {
    mode: 0o600,
  });
  return true;
}

export async function replyToIntake(
  id: string,
  email: string,
  action: {
    decision: CustomerDecision;
    note: string;
    doneWhen?: string;
    amountCents?: number;
    dueAt?: string;
    quoteText?: string;
  },
): Promise<
  | { ok: true; record: IntakeRecord }
  | { ok: false; error: "not_found" | "not_allowed" | "store" }
> {
  const current = await getIntake(id);
  if (!current || !emailsMatch(current.email, email)) {
    return { ok: false, error: "not_found" };
  }
  const applied = applyCustomerAction(current, action, new Date().toISOString());
  if (!applied.ok) return applied;
  const stored = await saveIntake(applied.record);
  if (stored) {
    await recordOpsEvent({
      event: eventFromCustomerDecision(action.decision),
      id: applied.record.id,
      status: applied.record.status,
      at: customerEventAt(applied.record, action.decision) || new Date().toISOString(),
    });
  }
  return stored ? { ok: true, record: applied.record } : { ok: false, error: "store" };
}

export async function markIntakePaid(
  notice: { briefId: string; amountTotal: number; paymentRef: string },
): Promise<UpdateIntakeResult> {
  const current = await getIntake(notice.briefId);
  if (!current) return { ok: false, error: "not_found" };
  const applied = applyPaid(current, {
    amountTotal: notice.amountTotal,
    paymentRef: notice.paymentRef,
    paidAt: new Date().toISOString(),
  });
  if (!applied.ok) return { ok: false, error: "not_allowed" };
  if (current.status === "paid") return { ok: true, record: current };
  const stored = await saveIntake(applied.record);
  if (stored) {
    await recordOpsEvent({
      event: "paid",
      id: applied.record.id,
      status: applied.record.status,
      at: applied.record.paidAt || new Date().toISOString(),
    });
  }
  return stored ? { ok: true, record: applied.record } : { ok: false, error: "store" };
}

export async function persistIntake(
  data: IntakeFields,
): Promise<{ stored: boolean; id: string }> {
  const id = crypto.randomUUID();
  const record = toIntakeRecord(id, data, new Date().toISOString());
  const stored = await saveIntake(record);
  if (stored) {
    await recordOpsEvent({
      event: "received",
      id: record.id,
      status: record.status,
      at: record.receivedAt,
    });
  }
  return { stored, id };
}

export async function recordOpsEvent(input: {
  event: unknown;
  id: unknown;
  status: unknown;
  at: unknown;
}): Promise<void> {
  const event = toOpsEvent(input);
  if (!event) return;
  try {
    if (detectIntakeBackend() === "blob") {
      const { put } = await import("@vercel/blob");
      await put(opsLastPath(), JSON.stringify(opsSignalPayload(event)), intakeBlobPutOptions());
    }
  } catch {
    // Queue writes must not fail the customer path.
  }
  void pingOpsSignal(event);
}

export async function getOpsLastEvent(): Promise<OpsEvent | null> {
  if (detectIntakeBackend() !== "blob") return null;
  try {
    const { get } = await import("@vercel/blob");
    const file = await get(opsLastPath(), { access: "private", useCache: false });
    if (!file?.stream) return null;
    const text = await new Response(file.stream).text();
    return parseOpsEvent(text);
  } catch {
    return null;
  }
}

export async function getOpsQueue(): Promise<OpsQueue> {
  const [items, last] = await Promise.all([
    loadIntakeRecords(INTAKE_LIST_GET_LIMIT),
    getOpsLastEvent(),
  ]);
  return summarizeQueue(items, last, { paymentConnected: paymentConfigured() });
}

async function pingOpsSignal(event: OpsEvent): Promise<void> {
  const url = opsSignalUrl();
  if (!url) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(opsSignalPayload(event)),
      signal: controller.signal,
    });
  } catch {
    // Optional outbound ping. Never block or retry-storm.
  } finally {
    clearTimeout(timer);
  }
}

export async function getIntake(id: string): Promise<IntakeRecord | null> {
  const path = intakeBlobPath(id);
  if (!path || detectIntakeBackend() !== "blob") return null;
  try {
    const { get } = await import("@vercel/blob");
    const file = await get(path, { access: "private", useCache: false });
    if (!file?.stream) return null;
    const text = await new Response(file.stream).text();
    return parseIntakeRecord(text);
  } catch {
    return null;
  }
}

async function loadIntakeRecords(getLimit: number): Promise<IntakeRecord[]> {
  if (detectIntakeBackend() !== "blob") return [];
  const cap = Number.isInteger(getLimit)
    ? Math.min(Math.max(getLimit, 0), INTAKE_LIST_GET_LIMIT)
    : 0;
  if (!cap) return [];
  try {
    const { list, get } = await import("@vercel/blob");
    const listed: { pathname: string; uploadedAt: Date }[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 8 && listed.length < INTAKE_LIST_META_MAX; page += 1) {
      const result = await list({
        prefix: "intake/",
        limit: 100,
        ...(cursor ? { cursor } : {}),
      });
      for (const blob of result.blobs) {
        listed.push({ pathname: blob.pathname, uploadedAt: blob.uploadedAt });
        if (listed.length >= INTAKE_LIST_META_MAX) break;
      }
      if (!result.hasMore || !result.cursor) break;
      cursor = result.cursor;
    }
    const records: IntakeRecord[] = [];
    for (const path of rankIntakeBlobs(listed, cap)) {
      const file = await get(path, { access: "private", useCache: false });
      if (!file?.stream) continue;
      const text = await new Response(file.stream).text();
      const parsed = parseIntakeRecord(text);
      if (parsed) records.push(parsed);
    }
    return records;
  } catch {
    return [];
  }
}

export async function listIntake(limit = 20): Promise<IntakeRecord[]> {
  const records = await loadIntakeRecords(INTAKE_LIST_GET_LIMIT);
  return selectIntakeForInbox(records, limit);
}

export async function deleteIntake(id: string): Promise<boolean> {
  const path = intakeBlobPath(id);
  if (!path || detectIntakeBackend() !== "blob") return false;
  const { del } = await import("@vercel/blob");
  await del(path);
  try {
    const last = await getOpsLastEvent();
    if (last && opsLastAfterDelete(last, id) === null) {
      await del(opsLastPath());
    }
  } catch {
    // Clearing last must not fail the delete.
  }
  return true;
}
