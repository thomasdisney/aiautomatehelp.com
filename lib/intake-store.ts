import {
  detectIntakeBackend,
  intakeBlobPath,
  intakeBlobPutOptions,
  parseIntakeRecordAtPath,
  toIntakeRecord,
  type IntakeFields,
  type IntakeRecord,
} from "@/lib/intake";
import {
  customerEventAt,
  emailIndexAfterAdd,
  emailIndexAfterDelete,
  emailIndexPath,
  eventFromCustomerDecision,
  eventFromStatus,
  INTAKE_LIST_GET_LIMIT,
  INTAKE_LIST_META_MAX,
  mergeIntakeForQueue,
  opsLastAfterDelete,
  opsLastPath,
  opsSignalPayload,
  opsSignalUrl,
  opsWorkPath,
  parseEmailIndexAtPath,
  parseOpsEventAtPath,
  parseWorkIndexAtPath,
  toOpsLastPayload,
  toEmailIndexPayload,
  toWorkIndexPayload,
  rankIntakeBlobs,
  mergeIntakeForEmail,
  selectIntakeForInbox,
  selectIntakeForList,
  summarizeQueue,
  toOpsEvent,
  workIndexAfterDelete,
  workIndexAfterSave,
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
  parseIntakeRecordAtPath,
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
  await rememberIntakeEmail(record.email, record.id);
  await rememberWork(record);
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
): Promise<{ stored: true; id: string; receivedAt: string } | { stored: false; id: string }> {
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
    return { stored: true, id: record.id, receivedAt: record.receivedAt };
  }
  return { stored: false, id };
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
      const payload = toOpsLastPayload(event) ?? opsSignalPayload(event);
      await put(opsLastPath(), JSON.stringify(payload), intakeBlobPutOptions());
    }
  } catch {
    // Queue writes must not fail the customer path.
  }
  void pingOpsSignal(event);
}

export async function getOpsLastEvent(): Promise<OpsEvent | null> {
  if (detectIntakeBackend() !== "blob") return null;
  const path = opsLastPath();
  try {
    const { get } = await import("@vercel/blob");
    const file = await get(path, { access: "private", useCache: false });
    if (!file?.stream) return null;
    const text = await new Response(file.stream).text();
    return parseOpsEventAtPath(text, path);
  } catch {
    return null;
  }
}

export async function getOpsQueue(): Promise<OpsQueue> {
  const paymentConnected = paymentConfigured();
  const [recent, workIds, last] = await Promise.all([
    loadIntakeRecords(INTAKE_LIST_GET_LIMIT),
    readWorkIndex(),
    getOpsLastEvent(),
  ]);
  const recentIds = new Set(recent.map((item) => item.id));
  const missing = workIds.filter((id) => !recentIds.has(id));
  const indexed = missing.length ? await loadIntakeByIds(missing) : [];
  return summarizeQueue(mergeIntakeForQueue(indexed, recent), last, { paymentConnected });
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
    return parseIntakeRecordAtPath(text, path);
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
      const parsed = parseIntakeRecordAtPath(text, path);
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

export async function listIntakeForList(limit = 20): Promise<IntakeRecord[]> {
  const paymentConnected = paymentConfigured();
  const [recent, workIds] = await Promise.all([
    loadIntakeRecords(INTAKE_LIST_GET_LIMIT),
    readWorkIndex(),
  ]);
  const recentIds = new Set(recent.map((item) => item.id));
  const missing = workIds.filter((id) => !recentIds.has(id));
  const indexed = missing.length ? await loadIntakeByIds(missing) : [];
  return selectIntakeForList(indexed, recent, limit, paymentConnected);
}

export async function listIntakeByEmail(
  email: string,
  limit = INTAKE_LIST_GET_LIMIT,
): Promise<IntakeRecord[]> {
  const [indexed, recent, workIds] = await Promise.all([
    loadIndexedIntakeForEmail(email),
    listIntake(INTAKE_LIST_GET_LIMIT),
    readWorkIndex(),
  ]);
  const known = new Set(indexed.map((item) => item.id));
  for (const item of recent) known.add(item.id);
  const missing = workIds.filter((id) => !known.has(id));
  const fromWork = missing.length ? await loadIntakeByIds(missing) : [];
  return mergeIntakeForEmail([...indexed, ...fromWork], recent, email, limit);
}

async function loadIntakeByIds(ids: string[]): Promise<IntakeRecord[]> {
  const records: IntakeRecord[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (!intakeBlobPath(id) || seen.has(id)) continue;
    seen.add(id);
    const record = await getIntake(id);
    if (record) records.push(record);
  }
  return records;
}

async function loadIndexedIntakeForEmail(email: string): Promise<IntakeRecord[]> {
  const records = await loadIntakeByIds(await readEmailIndex(email));
  return records.filter((record) => emailsMatch(record.email, email));
}

async function readEmailIndex(email: string): Promise<string[]> {
  const path = emailIndexPath(email);
  if (!path || detectIntakeBackend() !== "blob") return [];
  try {
    const { get } = await import("@vercel/blob");
    const file = await get(path, { access: "private", useCache: false });
    if (!file?.stream) return [];
    const text = await new Response(file.stream).text();
    return parseEmailIndexAtPath(text, path, email);
  } catch {
    return [];
  }
}

async function writeEmailIndex(email: string, ids: string[]): Promise<void> {
  const path = emailIndexPath(email);
  if (!path || detectIntakeBackend() !== "blob") return;
  const { put, del } = await import("@vercel/blob");
  if (!ids.length) {
    await del(path);
    return;
  }
  const payload = toEmailIndexPayload(ids, email);
  if (!payload) return;
  await put(path, JSON.stringify(payload), intakeBlobPutOptions());
}

async function rememberIntakeEmail(email: string, id: string): Promise<void> {
  try {
    const current = await readEmailIndex(email);
    await writeEmailIndex(email, emailIndexAfterAdd(current, id));
  } catch {
    // Index writes must not fail the customer path.
  }
}

async function forgetIntakeEmail(email: string, id: string): Promise<void> {
  try {
    const current = await readEmailIndex(email);
    await writeEmailIndex(email, emailIndexAfterDelete(current, id));
  } catch {
    // Clearing the index must not fail the delete.
  }
}

async function readWorkIndex(): Promise<string[]> {
  const path = opsWorkPath();
  if (detectIntakeBackend() !== "blob") return [];
  try {
    const { get } = await import("@vercel/blob");
    const file = await get(path, { access: "private", useCache: false });
    if (!file?.stream) return [];
    const text = await new Response(file.stream).text();
    return parseWorkIndexAtPath(text, path);
  } catch {
    return [];
  }
}

async function writeWorkIndex(ids: string[]): Promise<void> {
  const path = opsWorkPath();
  if (detectIntakeBackend() !== "blob") return;
  const { put, del } = await import("@vercel/blob");
  if (!ids.length) {
    await del(path);
    return;
  }
  await put(path, JSON.stringify(toWorkIndexPayload(ids)), intakeBlobPutOptions());
}

async function rememberWork(record: IntakeRecord): Promise<void> {
  try {
    const current = await readWorkIndex();
    await writeWorkIndex(workIndexAfterSave(current, record, paymentConfigured()));
  } catch {
    // Work index writes must not fail the customer path.
  }
}

async function forgetWork(id: string): Promise<void> {
  try {
    const current = await readWorkIndex();
    await writeWorkIndex(workIndexAfterDelete(current, id));
  } catch {
    // Clearing the work index must not fail the delete.
  }
}

export async function deleteIntake(id: string): Promise<boolean> {
  const path = intakeBlobPath(id);
  if (!path || detectIntakeBackend() !== "blob") return false;
  const current = await getIntake(id);
  const { del } = await import("@vercel/blob");
  await del(path);
  if (current) await forgetIntakeEmail(current.email, id);
  await forgetWork(id);
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
