import { intakeBlobPath } from "./intake.ts";

export const BRIEF_RECEIPT_KEY = "aah.briefReceipts:v1";
export const BRIEF_RECEIPT_MAX = 8;
export const BRIEF_RECEIPT_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export type BriefReceipt = {
  id: string;
  at: string;
};

export type BriefReceiptStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

function parseAt(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const at = value.trim().slice(0, 40);
  const ms = Date.parse(at);
  if (!Number.isFinite(ms)) return null;
  return at;
}

function parseReceiptId(value: unknown): string | null {
  const id = typeof value === "string" ? value.trim().toLowerCase() : "";
  return intakeBlobPath(id) ? id : null;
}

function isFresh(at: string, nowMs: number): boolean {
  const atMs = Date.parse(at);
  if (!Number.isFinite(atMs)) return false;
  return nowMs - atMs <= BRIEF_RECEIPT_MAX_AGE_MS;
}

function toReceipt(value: unknown, nowMs: number): BriefReceipt | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = parseReceiptId(row.id);
  const at = parseAt(row.at);
  if (!id || !at || !isFresh(at, nowMs)) return null;
  return { id, at };
}

export function briefReceiptFromPublicPayload(
  value: unknown,
  nowMs: number = Date.now(),
): BriefReceipt | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return toReceipt({ id: row.id, at: row.receivedAt }, Number.isFinite(nowMs) ? nowMs : Date.now());
}

export function toPublicIntakeCreate(
  value: unknown,
  nowMs: number = Date.now(),
): { ok: true; id: string; receivedAt: string } | null {
  const receipt = briefReceiptFromPublicPayload(value, nowMs);
  if (!receipt) return null;
  return { ok: true, id: receipt.id, receivedAt: receipt.at };
}

export function briefReceiptDisplay(
  value: unknown,
  nowMs: number = Date.now(),
): { id: string; receivedAt: string } | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const receipt = toReceipt({ id: row.id, at: row.at }, Number.isFinite(nowMs) ? nowMs : Date.now());
  if (!receipt) return null;
  return { id: receipt.id, receivedAt: receipt.at };
}

export function parseBriefReceipts(raw: string, nowMs: number = Date.now()): BriefReceipt[] {
  const now = Number.isFinite(nowMs) ? nowMs : Date.now();
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const receipts: BriefReceipt[] = [];
  for (const item of value) {
    const receipt = toReceipt(item, now);
    if (!receipt || seen.has(receipt.id)) continue;
    seen.add(receipt.id);
    receipts.push(receipt);
    if (receipts.length >= BRIEF_RECEIPT_MAX) break;
  }
  return receipts;
}

export function briefReceiptsJson(list: BriefReceipt[]): string {
  return JSON.stringify(parseBriefReceipts(JSON.stringify(list)));
}

export function briefReceiptsAfterAdd(
  list: BriefReceipt[],
  id: string,
  at: string,
  nowMs: number = Date.now(),
): BriefReceipt[] {
  const receipt = toReceipt({ id, at }, Number.isFinite(nowMs) ? nowMs : Date.now());
  const current = parseBriefReceipts(JSON.stringify(list), nowMs);
  if (!receipt) return current;
  const existing = current.find((item) => item.id === receipt.id);
  const kept = existing ?? receipt;
  return parseBriefReceipts(
    JSON.stringify([kept, ...current.filter((item) => item.id !== kept.id)]),
    nowMs,
  );
}

export function briefReceiptsAfterRemove(list: BriefReceipt[], id: string): BriefReceipt[] {
  const drop = parseReceiptId(id);
  const current = parseBriefReceipts(JSON.stringify(list));
  if (!drop) return current;
  return current.filter((item) => item.id !== drop);
}

function readStore(store: BriefReceiptStore | null): string {
  if (!store) return "";
  try {
    const raw = store.getItem(BRIEF_RECEIPT_KEY);
    return typeof raw === "string" ? raw : "";
  } catch {
    return "";
  }
}

const EMPTY_RECEIPTS: BriefReceipt[] = [];
const receiptListeners = new Set<() => void>();
let receiptSnapshotJson = "";
let receiptSnapshot: BriefReceipt[] = EMPTY_RECEIPTS;

function emitReceipts(): void {
  for (const listener of receiptListeners) listener();
}

function writeStore(store: BriefReceiptStore | null, list: BriefReceipt[]): void {
  if (!store) return;
  try {
    if (!list.length) {
      if (typeof store.removeItem === "function") {
        store.removeItem(BRIEF_RECEIPT_KEY);
      } else {
        store.setItem(BRIEF_RECEIPT_KEY, "[]");
      }
    } else {
      store.setItem(BRIEF_RECEIPT_KEY, briefReceiptsJson(list));
    }
  } catch {
    // Browser storage is optional. Never throw toward the customer path.
  }
  emitReceipts();
}

export function loadBriefReceipts(
  store: BriefReceiptStore | null,
  nowMs: number = Date.now(),
): BriefReceipt[] {
  return parseBriefReceipts(readStore(store), nowMs);
}

export function persistBriefReceipt(
  store: BriefReceiptStore | null,
  id: string,
  at: string,
  nowMs: number = Date.now(),
): BriefReceipt[] {
  const next = briefReceiptsAfterAdd(loadBriefReceipts(store, nowMs), id, at, nowMs);
  writeStore(store, next);
  return next;
}

export function persistBriefReceiptFromPublicPayload(
  store: BriefReceiptStore | null,
  value: unknown,
  nowMs: number = Date.now(),
): BriefReceipt[] {
  const now = Number.isFinite(nowMs) ? nowMs : Date.now();
  const current = loadBriefReceipts(store, now);
  const receipt = briefReceiptFromPublicPayload(value, now);
  if (!receipt) return current;
  return persistBriefReceipt(store, receipt.id, receipt.at, now);
}

export function dropBriefReceipt(
  store: BriefReceiptStore | null,
  id: string,
  nowMs: number = Date.now(),
): BriefReceipt[] {
  const next = briefReceiptsAfterRemove(loadBriefReceipts(store, nowMs), id);
  writeStore(store, next);
  return next;
}

export function clearBriefReceipts(store: BriefReceiptStore | null): BriefReceipt[] {
  writeStore(store, []);
  return [];
}

export function browserReceiptStore(): BriefReceiptStore | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function subscribeBriefReceipts(onStoreChange: () => void): () => void {
  receiptListeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    receiptListeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

export function getBriefReceiptSnapshot(nowMs: number = Date.now()): BriefReceipt[] {
  const next = loadBriefReceipts(browserReceiptStore(), nowMs);
  const json = briefReceiptsJson(next);
  if (json === receiptSnapshotJson) return receiptSnapshot;
  receiptSnapshotJson = json;
  receiptSnapshot = next.length ? next : EMPTY_RECEIPTS;
  return receiptSnapshot;
}

export function getBriefReceiptServerSnapshot(): BriefReceipt[] {
  return EMPTY_RECEIPTS;
}
