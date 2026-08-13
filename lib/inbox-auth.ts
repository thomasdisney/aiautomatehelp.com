import { timingSafeEqual } from "node:crypto";

export function timingSafeEqualString(left: string, right: string): boolean {
  if (!left || !right) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function bearerMatches(header: string | null, token: string): boolean {
  if (!header || !token) return false;
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  return timingSafeEqualString(header.slice(prefix.length), token);
}

export function inboxReadToken(): string {
  return process.env.INTAKE_READ_TOKEN?.trim() ?? "";
}
