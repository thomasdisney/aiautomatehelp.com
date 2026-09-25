export const FIELD_LIMITS = {
  name: 80,
  email: 120,
  company: 120,
  message: 4000,
  trigger: 800,
  tools: 800,
  outcome: 800,
  quoteText: 500,
  customerReply: 2000,
  updateText: 2000,
  operatorNote: 2000,
  doneWhen: 500,
} as const;

export const THREAD_ROLES = ["customer", "operator"] as const;
export type ThreadRole = (typeof THREAD_ROLES)[number];
export const THREAD_MAX_ENTRIES = 20;

export type ThreadEntry = {
  role: ThreadRole;
  text: string;
  at: string;
};

export const INTAKE_STATUSES = [
  "received",
  "quoted",
  "declined",
  "accepted",
  "withdrawn",
  "paid",
  "delivered",
] as const;
export type IntakeStatus = (typeof INTAKE_STATUSES)[number];

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type IntakeFields = {
  name: string;
  email: string;
  company: string;
  message: string;
};

export type IntakeParse =
  | { ok: true; dropped: true }
  | { ok: true; dropped: false; data: IntakeFields }
  | { ok: false; error: "invalid" | "required" | "email" };

export function sanitizeText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").trim().slice(0, max);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= FIELD_LIMITS.email;
}

export const MIN_DELIVERY_DAYS = 1;
export const MAX_DELIVERY_DAYS = 90;
const DUE_AT_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDueAt(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  const match = DUE_AT_RE.exec(raw);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 2020 || year > 2100) return null;
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return raw;
}

export function utcDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function addUtcDays(ymd: string, days: number): string | null {
  const parsed = parseDueAt(ymd);
  if (!parsed || !Number.isInteger(days)) return null;
  const [year, month, day] = parsed.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return parseDueAt(utc.toISOString().slice(0, 10));
}

export function dueAtInRange(dueAt: string, now: Date = new Date()): boolean {
  const parsed = parseDueAt(dueAt);
  if (!parsed) return false;
  const today = utcDateString(now);
  const min = addUtcDays(today, MIN_DELIVERY_DAYS);
  const max = addUtcDays(today, MAX_DELIVERY_DAYS);
  if (!min || !max) return false;
  return parsed >= min && parsed <= max;
}

const INTAKE_AT_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.\d{3}Z$/;

export function parseIntakeAt(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw || raw.length > 40) return null;
  if (!INTAKE_AT_RE.test(raw)) return null;
  const utc = Date.parse(raw);
  if (!Number.isFinite(utc)) return null;
  if (new Date(utc).toISOString() !== raw) return null;
  return raw;
}

export function blobIntakeReceivedAtHasDisallowedValue(receivedAt: unknown): boolean {
  if (receivedAt === undefined) return false;
  return parseIntakeAt(receivedAt) === null;
}

export function blobIntakeQuotedAtHasDisallowedValue(quotedAt: unknown): boolean {
  if (quotedAt === undefined || quotedAt === "") return false;
  return parseIntakeAt(quotedAt) === null;
}

export function blobIntakeCustomerReplyAtHasDisallowedValue(customerReplyAt: unknown): boolean {
  if (customerReplyAt === undefined || customerReplyAt === "") return false;
  return parseIntakeAt(customerReplyAt) === null;
}

export function blobIntakeUpdateAtHasDisallowedValue(updateAt: unknown): boolean {
  if (updateAt === undefined || updateAt === "") return false;
  return parseIntakeAt(updateAt) === null;
}

export function blobIntakePaidAtHasDisallowedValue(paidAt: unknown): boolean {
  if (paidAt === undefined || paidAt === "") return false;
  return parseIntakeAt(paidAt) === null;
}

export function blobIntakeAcceptedAtHasDisallowedValue(acceptedAt: unknown): boolean {
  if (acceptedAt === undefined || acceptedAt === "") return false;
  return parseIntakeAt(acceptedAt) === null;
}

export function blobIntakeConfirmedAtHasDisallowedValue(confirmedAt: unknown): boolean {
  if (confirmedAt === undefined || confirmedAt === "") return false;
  return parseIntakeAt(confirmedAt) === null;
}

export function blobIntakeDeliveredAtHasDisallowedValue(deliveredAt: unknown): boolean {
  if (deliveredAt === undefined || deliveredAt === "") return false;
  return parseIntakeAt(deliveredAt) === null;
}

export function blobIntakeWithdrawnAtHasDisallowedValue(withdrawnAt: unknown): boolean {
  if (withdrawnAt === undefined || withdrawnAt === "") return false;
  return parseIntakeAt(withdrawnAt) === null;
}

export function blobIntakeDeclinedAtHasDisallowedValue(declinedAt: unknown): boolean {
  if (declinedAt === undefined || declinedAt === "") return false;
  return parseIntakeAt(declinedAt) === null;
}

export function blobIntakeNotedAtHasDisallowedValue(notedAt: unknown): boolean {
  if (notedAt === undefined || notedAt === "") return false;
  return parseIntakeAt(notedAt) === null;
}

export function blobIntakeDueAtHasDisallowedValue(dueAt: unknown): boolean {
  if (dueAt === undefined || dueAt === "") return false;
  return parseDueAt(dueAt) === null;
}

export function blobThreadEntryAtHasDisallowedValue(at: unknown): boolean {
  if (at === undefined || at === "") return false;
  return parseIntakeAt(at) === null;
}

const INTAKE_PAYMENT_REF_RE = /^cs_[A-Za-z0-9_]+$/;

export function parseIntakePaymentRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw || raw.length < 8 || raw.length > 200) return null;
  if (!INTAKE_PAYMENT_REF_RE.test(raw)) return null;
  return raw;
}

export function blobIntakePaymentRefHasDisallowedValue(paymentRef: unknown): boolean {
  if (paymentRef === undefined || paymentRef === "") return false;
  return parseIntakePaymentRef(paymentRef) === null;
}

const INTAKE_QUOTE_TEXT_URL_RE = /^https?:\/\//i;

export function parseIntakeQuoteText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.quoteText);
  if (!raw || INTAKE_QUOTE_TEXT_URL_RE.test(raw)) return null;
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u2029/g, "\n")
    .replace(/\u0085/g, "\n");
  if (normalized.split("\n").some((line) => line.replace(/[\p{Cf}\p{M}\uFFFC]/gu, "").trim() === "")) {
    return null;
  }
  return raw;
}

export function blobIntakeQuoteTextHasDisallowedValue(quoteText: unknown): boolean {
  if (typeof quoteText !== "string") return false;
  const raw = sanitizeText(quoteText, FIELD_LIMITS.quoteText);
  if (!raw) return false;
  return parseIntakeQuoteText(quoteText) === null;
}

const INTAKE_CUSTOMER_REPLY_URL_RE = /^https?:\/\//i;

export function parseIntakeCustomerReply(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.customerReply);
  if (!raw || INTAKE_CUSTOMER_REPLY_URL_RE.test(raw)) return null;
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u0085/g, "\n");
  if (normalized.split("\n").some((line) => line.replace(/[\p{Cf}\p{M}\uFFFC]/gu, "").trim() === "")) {
    return null;
  }
  return raw;
}

export function blobIntakeCustomerReplyHasDisallowedValue(customerReply: unknown): boolean {
  if (typeof customerReply !== "string") return false;
  const raw = sanitizeText(customerReply, FIELD_LIMITS.customerReply);
  if (!raw) return false;
  return parseIntakeCustomerReply(customerReply) === null;
}

const INTAKE_UPDATE_TEXT_URL_RE = /^https?:\/\//i;

export function parseIntakeUpdateText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.updateText);
  if (!raw || INTAKE_UPDATE_TEXT_URL_RE.test(raw)) return null;
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u0085/g, "\n");
  if (normalized.split("\n").some((line) => line.replace(/[\p{Cf}\p{M}\uFFFC]/gu, "").trim() === "")) {
    return null;
  }
  return raw;
}

export function blobIntakeUpdateTextHasDisallowedValue(updateText: unknown): boolean {
  if (typeof updateText !== "string") return false;
  const raw = sanitizeText(updateText, FIELD_LIMITS.updateText);
  if (!raw) return false;
  return parseIntakeUpdateText(updateText) === null;
}

const INTAKE_OPERATOR_NOTE_URL_RE = /^https?:\/\//i;

export function parseIntakeOperatorNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.operatorNote);
  if (!raw || INTAKE_OPERATOR_NOTE_URL_RE.test(raw)) return null;
  return raw;
}

export function blobIntakeOperatorNoteHasDisallowedValue(operatorNote: unknown): boolean {
  if (typeof operatorNote !== "string") return false;
  const raw = sanitizeText(operatorNote, FIELD_LIMITS.operatorNote);
  if (!raw) return false;
  return parseIntakeOperatorNote(operatorNote) === null;
}

const INTAKE_DONE_WHEN_URL_RE = /^https?:\/\//i;

export function parseIntakeDoneWhen(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.doneWhen);
  if (!raw || INTAKE_DONE_WHEN_URL_RE.test(raw)) return null;
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u2029/g, "\n")
    .replace(/\u0085/g, "\n");
  if (normalized.split("\n").some((line) => line.replace(/[\p{Cf}\p{M}\uFFFC]/gu, "").trim() === "")) {
    return null;
  }
  return raw;
}

export function blobIntakeDoneWhenHasDisallowedValue(doneWhen: unknown): boolean {
  if (typeof doneWhen !== "string") return false;
  const raw = sanitizeText(doneWhen, FIELD_LIMITS.doneWhen);
  if (!raw) return false;
  return parseIntakeDoneWhen(doneWhen) === null;
}

const INTAKE_THREAD_TEXT_URL_RE = /^https?:\/\//i;

export function parseIntakeThreadText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.customerReply);
  if (!raw || INTAKE_THREAD_TEXT_URL_RE.test(raw)) return null;
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u0085/g, "\n");
  if (normalized.split("\n").some((line) => line.replace(/[\p{Cf}\p{M}\uFFFC]/gu, "").trim() === "")) {
    return null;
  }
  return raw;
}

export function blobThreadEntryTextHasDisallowedValue(text: unknown): boolean {
  if (typeof text !== "string") return false;
  const raw = sanitizeText(text, FIELD_LIMITS.customerReply);
  if (!raw) return false;
  return parseIntakeThreadText(text) === null;
}

const INTAKE_NAME_URL_RE = /^https?:\/\//i;

export function parseIntakeName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.name);
  if (!raw || INTAKE_NAME_URL_RE.test(raw)) return null;
  return raw;
}

export function blobIntakeNameHasDisallowedValue(name: unknown): boolean {
  if (typeof name !== "string") return false;
  const raw = sanitizeText(name, FIELD_LIMITS.name);
  if (!raw) return false;
  return parseIntakeName(name) === null;
}

const INTAKE_COMPANY_URL_RE = /^https?:\/\//i;

export function parseIntakeCompany(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.company);
  if (!raw || INTAKE_COMPANY_URL_RE.test(raw)) return null;
  return raw;
}

export function blobIntakeCompanyHasDisallowedValue(company: unknown): boolean {
  if (typeof company !== "string") return false;
  const raw = sanitizeText(company, FIELD_LIMITS.company);
  if (!raw) return false;
  return parseIntakeCompany(company) === null;
}

const INTAKE_MESSAGE_URL_RE = /^https?:\/\//i;

export function parseIntakeMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.message);
  if (!raw || INTAKE_MESSAGE_URL_RE.test(raw)) return null;
  return raw;
}

export function blobIntakeMessageHasDisallowedValue(message: unknown): boolean {
  if (typeof message !== "string") return false;
  const raw = sanitizeText(message, FIELD_LIMITS.message);
  if (!raw) return false;
  return parseIntakeMessage(message) === null;
}

const INTAKE_TRIGGER_URL_RE = /^https?:\/\//i;

export function parseIntakeTrigger(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.trigger);
  if (!raw || INTAKE_TRIGGER_URL_RE.test(raw)) return null;
  if (raw.length > FIELD_LIMITS.quoteText) return null;
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u0085/g, "\n");
  if (normalized.split("\n").some((line) => line.replace(/[\p{Cf}\p{M}\u115F\u1160\u17B4\u17B5\u2800\u3164\uFFA0\uFFFC]/gu, "").trim() === "")) {
    return null;
  }
  return raw;
}

const INTAKE_TOOLS_URL_RE = /^https?:\/\//i;

export function parseIntakeTools(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.tools);
  if (!raw || INTAKE_TOOLS_URL_RE.test(raw)) return null;
  if (raw.length > FIELD_LIMITS.quoteText) return null;
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u0085/g, "\n");
  if (normalized.split("\n").some((line) => line.replace(/[\p{Cf}\p{M}\u115F\u1160\u17B4\u17B5\u2800\u3164\uFFA0\uFFFC]/gu, "").trim() === "")) {
    return null;
  }
  return raw;
}

const INTAKE_OUTCOME_URL_RE = /^https?:\/\//i;

export function parseIntakeOutcome(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.outcome);
  if (!raw || INTAKE_OUTCOME_URL_RE.test(raw)) return null;
  if (raw.length > FIELD_LIMITS.quoteText) return null;
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u2029/g, "\n")
    .replace(/\u0085/g, "\n");
  if (
    normalized.split("\n").some(
      (line) =>
        line.replace(/[\p{C}\p{Z}\p{M}\u2800\u115F\u1160\u3164\uFFA0\uFFFC]/gu, "").trim() ===
        "",
    )
  ) {
    return null;
  }
  return raw;
}

const INTAKE_EMAIL_URL_RE = /[:\/\\%\uFF1A\uFE55\uFE13\uA789\u02F8\u02D0\u02D1\u2236\u2237\u2982\u0589\uFF0F\uFF3C\uFE68\u2044]|%3[Aa]|%2[Ff]|%5[Cc]|%253[Aa]|%252[Ff]|%255[Cc]/;
const INTAKE_EMAIL_NON_ASCII_RE = /[^\u0000-\u007F]/;

export function parseIntakeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = sanitizeText(value, FIELD_LIMITS.email);
  if (!raw || INTAKE_EMAIL_URL_RE.test(raw) || INTAKE_EMAIL_NON_ASCII_RE.test(raw)) {
    return null;
  }
  return raw;
}

export function blobIntakeEmailHasDisallowedValue(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const raw = sanitizeText(email, FIELD_LIMITS.email);
  if (!raw) return false;
  return parseIntakeEmail(email) === null;
}

export function composeIntakeMessage(input: {
  trigger: string;
  tools: string;
  outcome: string;
}): string {
  return `Trigger: ${input.trigger}\n\nTools: ${input.tools}\n\nDone when: ${input.outcome}`.slice(
    0,
    FIELD_LIMITS.message,
  );
}

export type NamedWorkflow = {
  trigger: string;
  tools: string;
  outcome: string;
};

const NAMED_WORKFLOW_TRIGGER_PREFIX = "Trigger: ";
const NAMED_WORKFLOW_TOOLS_MARK = "\n\nTools: ";
const NAMED_WORKFLOW_OUTCOME_MARK = "\n\nDone when: ";

export function parseNamedWorkflow(value: unknown): NamedWorkflow | null {
  const raw = parseIntakeMessage(value);
  if (!raw) return null;
  if (!raw.startsWith(NAMED_WORKFLOW_TRIGGER_PREFIX)) return null;
  const toolsAt = raw.indexOf(NAMED_WORKFLOW_TOOLS_MARK);
  if (toolsAt < NAMED_WORKFLOW_TRIGGER_PREFIX.length) return null;
  const outcomeAt = raw.indexOf(
    NAMED_WORKFLOW_OUTCOME_MARK,
    toolsAt + NAMED_WORKFLOW_TOOLS_MARK.length,
  );
  if (outcomeAt < 0) return null;
  const trigger = raw.slice(NAMED_WORKFLOW_TRIGGER_PREFIX.length, toolsAt);
  const tools = raw.slice(toolsAt + NAMED_WORKFLOW_TOOLS_MARK.length, outcomeAt);
  const outcome = raw.slice(outcomeAt + NAMED_WORKFLOW_OUTCOME_MARK.length);
  if (!trigger || !tools || !outcome) return null;
  if (outcome.includes("\n\n")) return null;
  if (parseIntakeTrigger(trigger) !== trigger) return null;
  if (parseIntakeTools(tools) !== tools) return null;
  if (parseIntakeOutcome(outcome) !== outcome) return null;
  if (parseIntakeDoneWhen(outcome) !== outcome) return null;
  if (composeIntakeMessage({ trigger, tools, outcome }) !== raw) return null;
  return { trigger, tools, outcome };
}

export function parseIntake(body: unknown): IntakeParse {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid" };
  const raw = body as Record<string, unknown>;
  const honeypot = typeof raw.website === "string" ? raw.website.trim() : "";
  if (honeypot) return { ok: true, dropped: true };

  const name = sanitizeText(raw.name, FIELD_LIMITS.name);
  const email = sanitizeText(raw.email, FIELD_LIMITS.email);
  const company = sanitizeText(raw.company, FIELD_LIMITS.company);
  const trigger = sanitizeText(raw.trigger, FIELD_LIMITS.trigger);
  const tools = sanitizeText(raw.tools, FIELD_LIMITS.tools);
  const outcome = sanitizeText(raw.outcome, FIELD_LIMITS.outcome);

  if (!name || !email || !trigger || !tools || !outcome) {
    return { ok: false, error: "required" };
  }
  if (parseIntakeName(name) === null) {
    return { ok: false, error: "invalid" };
  }
  if (company && parseIntakeCompany(company) === null) {
    return { ok: false, error: "invalid" };
  }
  if (parseIntakeTrigger(trigger) === null) {
    return { ok: false, error: "invalid" };
  }
  if (parseIntakeTools(tools) === null) {
    return { ok: false, error: "invalid" };
  }
  if (parseIntakeOutcome(outcome) === null) {
    return { ok: false, error: "invalid" };
  }
  if (parseIntakeDoneWhen(outcome) !== outcome) {
    return { ok: false, error: "invalid" };
  }
  if (!isValidEmail(email) || parseIntakeEmail(email) === null) {
    return { ok: false, error: "email" };
  }
  const message = composeIntakeMessage({ trigger, tools, outcome });
  if (!message) return { ok: false, error: "required" };
  if (!parseNamedWorkflow(message)) {
    return { ok: false, error: "invalid" };
  }
  return { ok: true, dropped: false, data: { name, email, company, message } };
}

export type IntakeBackend = "blob" | "webhook" | "dir" | "none";

export type IntakeRecord = IntakeFields & {
  id: string;
  receivedAt: string;
  status: IntakeStatus;
  quoteText: string;
  customerReply: string;
  customerReplyAt: string;
  updateText: string;
  updateAt: string;
  amountCents: number;
  paidAt: string;
  paymentRef: string;
  dueAt: string;
  thread: ThreadEntry[];
  operatorNote: string;
  doneWhen: string;
  confirmedAt: string;
  acceptedAt: string;
  deliveredAt: string;
  withdrawnAt: string;
  declinedAt: string;
  quotedAt: string;
  notedAt: string;
};

export function parseThreadRole(value: unknown): ThreadRole | null {
  return THREAD_ROLES.includes(value as ThreadRole) ? (value as ThreadRole) : null;
}

export function parseThreadEntry(value: unknown): ThreadEntry | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const role = parseThreadRole(row.role);
  const text = sanitizeText(row.text, FIELD_LIMITS.customerReply);
  const at = typeof row.at === "string" ? row.at.trim().slice(0, 40) : "";
  if (!role || !text || !at) return null;
  return { role, text, at };
}

export function parseThread(value: unknown): ThreadEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: ThreadEntry[] = [];
  for (const item of value) {
    const parsed = parseThreadEntry(item);
    if (parsed) entries.push(parsed);
  }
  return entries.slice(-THREAD_MAX_ENTRIES);
}

export function appendThread(thread: ThreadEntry[], entry: ThreadEntry): ThreadEntry[] {
  if (!entry.text) return thread;
  return parseThread([...thread, entry]);
}

export function hydrateThread(record: {
  thread?: ThreadEntry[];
  customerReply: string;
  customerReplyAt: string;
  updateText: string;
  updateAt: string;
}): ThreadEntry[] {
  if (record.thread && record.thread.length) return parseThread(record.thread);
  const entries: ThreadEntry[] = [];
  if (record.updateText && record.updateAt) {
    entries.push({ role: "operator", text: record.updateText, at: record.updateAt });
  }
  if (record.customerReply && record.customerReplyAt) {
    entries.push({ role: "customer", text: record.customerReply, at: record.customerReplyAt });
  }
  entries.sort((a, b) => a.at.localeCompare(b.at));
  return entries;
}

export function parseIntakeStatus(value: unknown): IntakeStatus | null {
  return INTAKE_STATUSES.includes(value as IntakeStatus) ? (value as IntakeStatus) : null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function detectIntakeBackend(
  env: Record<string, string | undefined> = process.env,
): IntakeBackend {
  if (env.BLOB_READ_WRITE_TOKEN || (env.BLOB_STORE_ID && env.VERCEL_OIDC_TOKEN)) {
    return "blob";
  }
  if (env.INTAKE_WEBHOOK_URL) return "webhook";
  if (env.INTAKE_DIR) return "dir";
  return "none";
}

export function intakeBlobPath(id: string): string | null {
  if (!UUID_RE.test(id)) return null;
  return `intake/${id}.json`;
}

export function intakeIdFromBlobPath(pathname: unknown): string | null {
  if (typeof pathname !== "string") return null;
  const raw = pathname.trim().toLowerCase();
  if (!raw.startsWith("intake/") || !raw.endsWith(".json")) return null;
  if (raw.includes("\0") || raw.includes("\\") || raw.includes("..")) return null;
  const id = raw.slice("intake/".length, -".json".length).trim();
  if (!id || id.includes("/") || id.includes("\\") || id.includes("..")) return null;
  return intakeBlobPath(id) ? id : null;
}

export function intakePathFromPath(pathname: unknown): string | null {
  const id = intakeIdFromBlobPath(pathname);
  return id ? intakeBlobPath(id) : null;
}

export function pickAllowedBlobKeys(
  row: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    if (allowed.has(key)) out[key] = row[key];
  }
  return out;
}

export function toIntakePathPayload(
  record: IntakeRecord,
): (IntakeRecord & { path: string }) | null {
  const id = typeof record.id === "string" ? record.id.trim().toLowerCase() : "";
  const path = intakeBlobPath(id);
  if (!path) return null;
  const payload = pickAllowedBlobKeys({ ...record, id, path }, INTAKE_PATH_KEYS);
  payload.thread = parseThread(payload.thread);
  const parsed = parseIntakeRecord(JSON.stringify(payload));
  if (!parsed) return null;
  const receivedAt = parseIntakeAt(parsed.receivedAt);
  if (!receivedAt) return null;
  if (blobIntakeQuotedAtHasDisallowedValue(parsed.quotedAt)) return null;
  if (blobIntakeCustomerReplyAtHasDisallowedValue(parsed.customerReplyAt)) return null;
  if (blobIntakeUpdateAtHasDisallowedValue(parsed.updateAt)) return null;
  if (blobIntakePaidAtHasDisallowedValue(parsed.paidAt)) return null;
  if (blobIntakeDueAtHasDisallowedValue(payload.dueAt)) return null;
  if (blobIntakePaymentRefHasDisallowedValue(payload.paymentRef)) return null;
  if (blobIntakeQuoteTextHasDisallowedValue(payload.quoteText)) return null;
  if (blobIntakeCustomerReplyHasDisallowedValue(payload.customerReply)) return null;
  if (blobIntakeUpdateTextHasDisallowedValue(payload.updateText)) return null;
  if (blobIntakeOperatorNoteHasDisallowedValue(payload.operatorNote)) return null;
  if (blobIntakeDoneWhenHasDisallowedValue(payload.doneWhen)) return null;
  if (blobIntakeNameHasDisallowedValue(payload.name)) return null;
  if (blobIntakeCompanyHasDisallowedValue(payload.company)) return null;
  if (blobIntakeMessageHasDisallowedValue(payload.message)) return null;
  if (blobIntakeEmailHasDisallowedValue(payload.email)) return null;
  if (blobIntakeAcceptedAtHasDisallowedValue(parsed.acceptedAt)) return null;
  if (blobIntakeConfirmedAtHasDisallowedValue(parsed.confirmedAt)) return null;
  if (blobIntakeDeliveredAtHasDisallowedValue(parsed.deliveredAt)) return null;
  if (blobIntakeWithdrawnAtHasDisallowedValue(parsed.withdrawnAt)) return null;
  if (blobIntakeDeclinedAtHasDisallowedValue(parsed.declinedAt)) return null;
  if (blobIntakeNotedAtHasDisallowedValue(parsed.notedAt)) return null;
  if (blobThreadHasDisallowedKeys(parsed.thread)) return null;
  return { ...parsed, receivedAt, path };
}

export function blobRowHasSnakeCaseKey(row: Record<string, unknown>): boolean {
  return Object.keys(row).some((key) => key.includes("_"));
}

export const INTAKE_PATH_CAMEL_KEYS: ReadonlySet<string> = new Set([
  "receivedAt",
  "quoteText",
  "customerReply",
  "customerReplyAt",
  "updateText",
  "updateAt",
  "amountCents",
  "paidAt",
  "paymentRef",
  "dueAt",
  "operatorNote",
  "doneWhen",
  "confirmedAt",
  "acceptedAt",
  "deliveredAt",
  "withdrawnAt",
  "declinedAt",
  "quotedAt",
  "notedAt",
]);

export function blobRowHasUnexpectedCamelKey(
  row: Record<string, unknown>,
  allowed: ReadonlySet<string> = new Set(),
): boolean {
  return Object.keys(row).some((key) => /[A-Z]/.test(key) && !allowed.has(key));
}

export function blobRowHasKebabCaseKey(row: Record<string, unknown>): boolean {
  return Object.keys(row).some((key) => key.includes("-"));
}

export function blobRowHasDottedKey(row: Record<string, unknown>): boolean {
  return Object.keys(row).some((key) => key.includes("."));
}

export const INTAKE_PATH_KEYS: ReadonlySet<string> = new Set([
  "id",
  "receivedAt",
  "status",
  "quoteText",
  "customerReply",
  "customerReplyAt",
  "updateText",
  "updateAt",
  "amountCents",
  "paidAt",
  "paymentRef",
  "dueAt",
  "thread",
  "operatorNote",
  "doneWhen",
  "confirmedAt",
  "acceptedAt",
  "deliveredAt",
  "withdrawnAt",
  "declinedAt",
  "quotedAt",
  "notedAt",
  "name",
  "email",
  "company",
  "message",
  "path",
]);

export function blobRowHasUnknownKey(
  row: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): boolean {
  return Object.keys(row).some((key) => !allowed.has(key));
}

export const THREAD_ENTRY_KEYS: ReadonlySet<string> = new Set(["role", "text", "at"]);
export const INTAKE_PATH_ARRAY_KEYS: ReadonlySet<string> = new Set(["thread"]);

export function blobRowHasDisallowedNestedValue(
  row: Record<string, unknown>,
  arrayKeys: ReadonlySet<string> = new Set(),
): boolean {
  for (const [key, value] of Object.entries(row)) {
    if (value === null || typeof value !== "object") continue;
    if (arrayKeys.has(key) && Array.isArray(value)) continue;
    return true;
  }
  return false;
}

export function blobThreadHasDisallowedKeys(thread: unknown): boolean {
  if (thread === undefined) return false;
  if (!Array.isArray(thread)) return true;
  for (const item of thread) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return true;
    const row = item as Record<string, unknown>;
    if (
      blobRowHasUnknownKey(row, THREAD_ENTRY_KEYS) ||
      blobRowHasSnakeCaseKey(row) ||
      blobRowHasUnexpectedCamelKey(row) ||
      blobRowHasKebabCaseKey(row) ||
      blobRowHasDottedKey(row) ||
      blobThreadEntryAtHasDisallowedValue(row.at) ||
      blobThreadEntryTextHasDisallowedValue(row.text) ||
      !parseThreadEntry(item)
    ) {
      return true;
    }
  }
  return false;
}

export function parseIntakeRecordAtPath(raw: string, pathname: unknown): IntakeRecord | null {
  const expectedPath = intakePathFromPath(pathname);
  if (!expectedPath) return null;
  const expectedId = intakeIdFromBlobPath(pathname);
  if (!expectedId) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    blobRowHasUnknownKey(row, INTAKE_PATH_KEYS) ||
    blobRowHasSnakeCaseKey(row) ||
    blobRowHasUnexpectedCamelKey(row, INTAKE_PATH_CAMEL_KEYS) ||
    blobRowHasKebabCaseKey(row) ||
    blobRowHasDottedKey(row) ||
    !("path" in row) ||
    "event" in row ||
    "digest" in row ||
    "ids" in row ||
    "at" in row ||
    "website" in row ||
    "questionAt" in row ||
    "replyAt" in row ||
    "text" in row ||
    "role" in row ||
    "ok" in row ||
    "error" in row ||
    "code" in row ||
    "item" in row ||
    "queue" in row ||
    "connected" in row ||
    "url" in row ||
    "last" in row ||
    "needs" in row ||
    "waiting" in row ||
    "attention" in row ||
    "questions" in row ||
    "received" in row ||
    "quoted" in row ||
    "accepted" in row ||
    "declined" in row ||
    "withdrawn" in row ||
    "paid" in row ||
    "delivered" in row ||
    "question" in row ||
    "update" in row ||
    "confirmed" in row ||
    "note" in row ||
    "decision" in row ||
    "mode" in row ||
    "customer_email" in row ||
    "client_reference_id" in row ||
    "success_url" in row ||
    "cancel_url" in row ||
    "metadata" in row ||
    "payment_intent_data" in row ||
    "line_items" in row ||
    "integration_identifier" in row ||
    "payment_status" in row ||
    "currency" in row ||
    "amount_total" in row ||
    "amount_subtotal" in row ||
    "object" in row ||
    "payment_intent" in row ||
    "customer" in row ||
    "customer_details" in row ||
    "discounts" in row ||
    "expires_at" in row ||
    "invoice" in row ||
    "invoice_creation" in row ||
    "livemode" in row ||
    "locale" in row ||
    "name_collection" in row ||
    "optional_items" in row ||
    "origin_context" in row ||
    "payment_link" in row ||
    "payment_method_collection" in row ||
    "payment_method_configuration_details" in row ||
    "payment_method_options" in row ||
    "payment_method_types" in row ||
    "permissions" in row ||
    "phone_number_collection" in row ||
    "presentment_details" in row ||
    "recovered_from" in row ||
    "redirect_on_completion" in row ||
    "return_url" in row ||
    "saved_payment_method_options" in row ||
    "setup_intent" in row ||
    "shipping_address_collection" in row ||
    "shipping_cost" in row ||
    "shipping_options" in row ||
    "submit_type" in row ||
    "subscription" in row ||
    "tax_id_collection" in row ||
    "total_details" in row ||
    "ui_mode" in row ||
    "wallet_options" in row ||
    "adaptive_pricing" in row ||
    "customer_creation" in row ||
    "after_expiration" in row ||
    "allow_promotion_codes" in row ||
    "automatic_tax" in row ||
    "billing_address_collection" in row ||
    "branding_settings" in row ||
    "client_secret" in row ||
    "collected_information" in row ||
    "consent" in row ||
    "consent_collection" in row ||
    "created" in row ||
    "currency_conversion" in row ||
    "custom_fields" in row ||
    "custom_text" in row ||
    "customer_account" in row ||
    "customer_update" in row ||
    "excluded_payment_method_types" in row ||
    "managed_payments" in row ||
    "payment_method_configuration" in row ||
    "payment_method_data" in row ||
    "setup_intent_data" in row ||
    "subscription_data" in row ||
    "receipt_email" in row ||
    "receipt_number" in row ||
    "receipt_url" in row
  ) {
    return null;
  }
  if (blobRowHasDisallowedNestedValue(row, INTAKE_PATH_ARRAY_KEYS)) return null;
  if (blobThreadHasDisallowedKeys(row.thread)) return null;
  if (blobIntakeReceivedAtHasDisallowedValue(row.receivedAt)) return null;
  if (blobIntakeQuotedAtHasDisallowedValue(row.quotedAt)) return null;
  if (blobIntakeCustomerReplyAtHasDisallowedValue(row.customerReplyAt)) return null;
  if (blobIntakeUpdateAtHasDisallowedValue(row.updateAt)) return null;
  if (blobIntakePaidAtHasDisallowedValue(row.paidAt)) return null;
  if (blobIntakeDueAtHasDisallowedValue(row.dueAt)) return null;
  if (blobIntakeAcceptedAtHasDisallowedValue(row.acceptedAt)) return null;
  if (blobIntakeConfirmedAtHasDisallowedValue(row.confirmedAt)) return null;
  if (blobIntakeDeliveredAtHasDisallowedValue(row.deliveredAt)) return null;
  if (blobIntakeWithdrawnAtHasDisallowedValue(row.withdrawnAt)) return null;
  if (blobIntakeDeclinedAtHasDisallowedValue(row.declinedAt)) return null;
  if (blobIntakeNotedAtHasDisallowedValue(row.notedAt)) return null;
  if (blobIntakePaymentRefHasDisallowedValue(row.paymentRef)) return null;
  if (blobIntakeQuoteTextHasDisallowedValue(row.quoteText)) return null;
  if (blobIntakeCustomerReplyHasDisallowedValue(row.customerReply)) return null;
  if (blobIntakeUpdateTextHasDisallowedValue(row.updateText)) return null;
  if (blobIntakeOperatorNoteHasDisallowedValue(row.operatorNote)) return null;
  if (blobIntakeDoneWhenHasDisallowedValue(row.doneWhen)) return null;
  if (blobIntakeNameHasDisallowedValue(row.name)) return null;
  if (blobIntakeCompanyHasDisallowedValue(row.company)) return null;
  if (blobIntakeMessageHasDisallowedValue(row.message)) return null;
  if (blobIntakeEmailHasDisallowedValue(row.email)) return null;
  const path = typeof row.path === "string" ? row.path.trim().toLowerCase() : "";
  if (path !== expectedPath) return null;
  const parsed = parseIntakeRecord(raw);
  if (!parsed || parsed.id.toLowerCase() !== expectedId) return null;
  if (parsed.id === expectedId) return parsed;
  return { ...parsed, id: expectedId };
}

export function intakeBlobPutOptions() {
  return {
    access: "private" as const,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  };
}

export function toIntakeRecord(
  id: string,
  data: IntakeFields,
  receivedAt: string,
  extras: {
    status?: IntakeStatus;
    quoteText?: string;
    customerReply?: string;
    customerReplyAt?: string;
    updateText?: string;
    updateAt?: string;
    amountCents?: number;
    paidAt?: string;
    paymentRef?: string;
    dueAt?: string;
    thread?: ThreadEntry[];
    operatorNote?: string;
    doneWhen?: string;
    confirmedAt?: string;
    acceptedAt?: string;
    deliveredAt?: string;
    withdrawnAt?: string;
    declinedAt?: string;
    quotedAt?: string;
    notedAt?: string;
  } = {},
): IntakeRecord {
  return {
    id,
    receivedAt,
    status: extras.status ?? "received",
    quoteText: extras.quoteText ?? "",
    customerReply: extras.customerReply ?? "",
    customerReplyAt: extras.customerReplyAt ?? "",
    updateText: extras.updateText ?? "",
    updateAt: extras.updateAt ?? "",
    amountCents: extras.amountCents ?? 0,
    paidAt: extras.paidAt ?? "",
    paymentRef: extras.paymentRef ?? "",
    dueAt: parseDueAt(extras.dueAt) ?? "",
    thread: parseThread(extras.thread),
    operatorNote: sanitizeText(extras.operatorNote, FIELD_LIMITS.operatorNote),
    doneWhen: sanitizeText(extras.doneWhen, FIELD_LIMITS.doneWhen),
    confirmedAt: typeof extras.confirmedAt === "string" ? extras.confirmedAt.slice(0, 40) : "",
    acceptedAt: typeof extras.acceptedAt === "string" ? extras.acceptedAt.slice(0, 40) : "",
    deliveredAt: typeof extras.deliveredAt === "string" ? extras.deliveredAt.slice(0, 40) : "",
    withdrawnAt: typeof extras.withdrawnAt === "string" ? extras.withdrawnAt.slice(0, 40) : "",
    declinedAt: typeof extras.declinedAt === "string" ? extras.declinedAt.slice(0, 40) : "",
    quotedAt: typeof extras.quotedAt === "string" ? extras.quotedAt.slice(0, 40) : "",
    notedAt: typeof extras.notedAt === "string" ? extras.notedAt.slice(0, 40) : "",
    name: data.name,
    email: data.email,
    company: data.company,
    message: data.message,
  };
}

export function parseIntakeRecord(raw: string): IntakeRecord | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id : "";
  if (!intakeBlobPath(id)) return null;
  const name = sanitizeText(row.name, FIELD_LIMITS.name);
  const email = sanitizeText(row.email, FIELD_LIMITS.email);
  const company = sanitizeText(row.company, FIELD_LIMITS.company);
  const message = sanitizeText(row.message, FIELD_LIMITS.message);
  const receivedAt = typeof row.receivedAt === "string" ? row.receivedAt : "";
  if (!name || !email || !message || !receivedAt || !isValidEmail(email)) {
    return null;
  }
  const status = parseIntakeStatus(row.status) ?? "received";
  const quoteText = sanitizeText(row.quoteText, FIELD_LIMITS.quoteText);
  const customerReply = sanitizeText(row.customerReply, FIELD_LIMITS.customerReply);
  const customerReplyAt =
    typeof row.customerReplyAt === "string" ? row.customerReplyAt.slice(0, 40) : "";
  const updateText = sanitizeText(row.updateText, FIELD_LIMITS.updateText);
  const updateAt = typeof row.updateAt === "string" ? row.updateAt.slice(0, 40) : "";
  const amountCents =
    typeof row.amountCents === "number" &&
    Number.isInteger(row.amountCents) &&
    row.amountCents >= 50 &&
    row.amountCents <= 50_000_000
      ? row.amountCents
      : 0;
  const paidAt = typeof row.paidAt === "string" ? row.paidAt.slice(0, 40) : "";
  const paymentRef =
    typeof row.paymentRef === "string" ? row.paymentRef.replace(/[^A-Za-z0-9_]/g, "").slice(0, 200) : "";
  const dueAt = parseDueAt(row.dueAt) ?? "";
  const thread = parseThread(row.thread);
  const operatorNote = sanitizeText(row.operatorNote, FIELD_LIMITS.operatorNote);
  const doneWhen = sanitizeText(row.doneWhen, FIELD_LIMITS.doneWhen);
  const confirmedAt = typeof row.confirmedAt === "string" ? row.confirmedAt.slice(0, 40) : "";
  const acceptedAt = typeof row.acceptedAt === "string" ? row.acceptedAt.slice(0, 40) : "";
  const deliveredAt = typeof row.deliveredAt === "string" ? row.deliveredAt.slice(0, 40) : "";
  const withdrawnAt = typeof row.withdrawnAt === "string" ? row.withdrawnAt.slice(0, 40) : "";
  const declinedAt = typeof row.declinedAt === "string" ? row.declinedAt.slice(0, 40) : "";
  const quotedAt = typeof row.quotedAt === "string" ? row.quotedAt.slice(0, 40) : "";
  const notedAt = typeof row.notedAt === "string" ? row.notedAt.slice(0, 40) : "";
  return toIntakeRecord(
    id,
    { name, email, company, message },
    receivedAt.slice(0, 40),
    {
      status,
      quoteText,
      customerReply,
      customerReplyAt,
      updateText,
      updateAt,
      amountCents,
      paidAt,
      paymentRef,
      dueAt,
      thread,
      operatorNote,
      doneWhen,
      confirmedAt,
      acceptedAt,
      deliveredAt,
      withdrawnAt,
      declinedAt,
      quotedAt,
      notedAt,
    },
  );
}
