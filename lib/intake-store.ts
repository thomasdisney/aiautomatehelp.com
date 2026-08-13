import {
  detectIntakeBackend,
  intakeBlobPath,
  parseIntakeRecord,
  toIntakeRecord,
  type IntakeFields,
  type IntakeRecord,
} from "@/lib/intake";

export {
  detectIntakeBackend,
  intakeBlobPath,
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
    if (backend === "blob") return persistBlob(record);
    if (backend === "webhook") {
      return persistWebhook(record, process.env.INTAKE_WEBHOOK_URL ?? "");
    }
    if (backend === "dir") return persistDir(record, process.env.INTAKE_DIR ?? "");
  } catch {
    return false;
  }
  return false;
}

export async function updateIntake(
  id: string,
  patch: { status: IntakeRecord["status"]; quoteText: string },
): Promise<IntakeRecord | null> {
  const current = await getIntake(id);
  if (!current) return null;
  const next = { ...current, status: patch.status, quoteText: patch.quoteText };
  const stored = await saveIntake(next);
  return stored ? next : null;
}

async function persistBlob(record: IntakeRecord): Promise<boolean> {
  const path = intakeBlobPath(record.id);
  if (!path) return false;
  const { put } = await import("@vercel/blob");
  await put(path, JSON.stringify(record), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
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

export async function persistIntake(
  data: IntakeFields,
): Promise<{ stored: boolean; id: string }> {
  const id = crypto.randomUUID();
  const record = toIntakeRecord(id, data, new Date().toISOString());
  return { stored: await saveIntake(record), id };
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

export async function listIntake(limit = 20): Promise<IntakeRecord[]> {
  if (detectIntakeBackend() !== "blob") return [];
  const { list, get } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: "intake/", limit: Math.min(limit, 50) });
  const records: IntakeRecord[] = [];
  for (const blob of blobs) {
    const file = await get(blob.pathname, { access: "private", useCache: false });
    if (!file?.stream) continue;
    const text = await new Response(file.stream).text();
    const parsed = parseIntakeRecord(text);
    if (parsed) records.push(parsed);
  }
  records.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  return records;
}

export async function deleteIntake(id: string): Promise<boolean> {
  const path = intakeBlobPath(id);
  if (!path || detectIntakeBackend() !== "blob") return false;
  const { del } = await import("@vercel/blob");
  await del(path);
  return true;
}
