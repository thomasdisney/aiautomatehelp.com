export const FIELD_LIMITS = {
  name: 80,
  email: 120,
  company: 120,
  message: 4000,
} as const;

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