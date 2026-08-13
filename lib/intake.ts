export const FIELD_LIMITS = {
  name: 80,
  email: 120,
  company: 120,
  message: 4000,
  quoteText: 500,
  customerReply: 2000,
  updateText: 2000,
} as const;

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

export function parseIntake(body: unknown): IntakeParse {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid" };
  const raw = body as Record<string, unknown>;
  const honeypot = typeof raw.website === "string" ? raw.website.trim() : "";
  if (honeypot) return { ok: true, dropped: true };

  const name = sanitizeText(raw.name, FIELD_LIMITS.name);
  const email = sanitizeText(raw.email, FIELD_LIMITS.email);
  const company = sanitizeText(raw.company, FIELD_LIMITS.company);
  const message = sanitizeText(raw.message, FIELD_LIMITS.message);

  if (!name || !email || !message) return { ok: false, error: "required" };
  if (!isValidEmail(email)) return { ok: false, error: "email" };
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
};

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
    },
  );
}