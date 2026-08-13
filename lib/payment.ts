import { intakeBlobPath, type IntakeRecord } from "./intake.ts";

export const MIN_AMOUNT_CENTS = 50;
export const MAX_AMOUNT_CENTS = 50_000_000;
const PAYMENT_REF_RE = /^cs_[A-Za-z0-9_]+$/;

export type PaidNotice = {
  briefId: string;
  amountTotal: number;
  paymentRef: string;
};

export type ApplyPaid =
  | { ok: true; record: IntakeRecord }
  | { ok: false; error: "not_allowed" };

export function parseAmountCents(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isInteger(value)) return null;
    if (value < MIN_AMOUNT_CENTS || value > MAX_AMOUNT_CENTS) return null;
    return value;
  }
  if (typeof value === "string" && /^[0-9]+$/.test(value)) {
    return parseAmountCents(Number(value));
  }
  return null;
}

export function parsePaymentRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const ref = value.trim();
  if (ref.length < 8 || ref.length > 200 || !PAYMENT_REF_RE.test(ref)) return null;
  return ref;
}

export function paymentConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const key = env.STRIPE_SECRET_KEY?.trim() ?? "";
  const webhook = env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (!webhook.startsWith("whsec_")) return false;
  return key.startsWith("sk_") || key.startsWith("rk_");
}

export function publicSiteUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const raw = env.SITE_URL?.trim() ?? "";
  if (!raw) return "https://www.aiautomatehelp.com";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "https://www.aiautomatehelp.com";
    if (url.hostname !== "aiautomatehelp.com" && url.hostname !== "www.aiautomatehelp.com") {
      return "https://www.aiautomatehelp.com";
    }
    return url.origin;
  } catch {
    return "https://www.aiautomatehelp.com";
  }
}

export function applyPaid(
  record: IntakeRecord,
  paid: { amountTotal: number; paymentRef: string; paidAt: string },
): ApplyPaid {
  const paymentRef = parsePaymentRef(paid.paymentRef);
  if (!paymentRef) return { ok: false, error: "not_allowed" };
  if (record.status === "paid") {
    return { ok: true, record };
  }
  if (record.status !== "accepted") return { ok: false, error: "not_allowed" };
  if (record.amountCents < MIN_AMOUNT_CENTS) return { ok: false, error: "not_allowed" };
  if (paid.amountTotal !== record.amountCents) return { ok: false, error: "not_allowed" };
  return {
    ok: true,
    record: {
      ...record,
      status: "paid",
      paymentRef,
      paidAt: paid.paidAt.slice(0, 40),
    },
  };
}

export function paidFromStripeSession(session: unknown): PaidNotice | null {
  if (!session || typeof session !== "object") return null;
  const row = session as Record<string, unknown>;
  const paymentRef = parsePaymentRef(row.id);
  if (!paymentRef) return null;
  if (row.payment_status !== "paid") return null;
  if (row.currency !== "usd") return null;
  const amountTotal = parseAmountCents(row.amount_total);
  if (amountTotal === null) return null;

  const meta =
    row.metadata && typeof row.metadata === "object"
      ? (row.metadata as Record<string, unknown>)
      : {};
  const fromMeta = typeof meta.brief_id === "string" ? meta.brief_id.trim().toLowerCase() : "";
  const fromClient =
    typeof row.client_reference_id === "string"
      ? row.client_reference_id.trim().toLowerCase()
      : "";
  const briefId = intakeBlobPath(fromMeta) ? fromMeta : fromClient;
  if (!intakeBlobPath(briefId)) return null;
  if (fromMeta && fromClient && fromMeta !== fromClient) return null;

  return { briefId, amountTotal, paymentRef };
}

export type CheckoutSessionParams = {
  mode: "payment";
  customer_email: string;
  client_reference_id: string;
  success_url: string;
  cancel_url: string;
  metadata: { brief_id: string };
  payment_intent_data: { metadata: { brief_id: string } };
  line_items: [
    {
      quantity: 1;
      price_data: {
        currency: "usd";
        unit_amount: number;
        product_data: { name: string; description: string };
      };
    },
  ];
  integration_identifier: string;
};

export function checkoutSessionParams(
  record: IntakeRecord,
  opts: { origin: string; integrationSuffix: string },
): CheckoutSessionParams {
  const origin = publicSiteUrl({ SITE_URL: opts.origin });
  const statusUrl = `${origin}/status?ref=${encodeURIComponent(record.id)}`;
  const suffix = /^[a-z]{8}$/.test(opts.integrationSuffix)
    ? opts.integrationSuffix
    : "xxxxxxxx";
  return {
    mode: "payment",
    customer_email: record.email,
    client_reference_id: record.id,
    success_url: statusUrl,
    cancel_url: statusUrl,
    metadata: { brief_id: record.id },
    payment_intent_data: { metadata: { brief_id: record.id } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: record.amountCents,
          product_data: {
            name: "Scoped automation",
            description: `Reference ${record.id}`,
          },
        },
      },
    ],
    integration_identifier: `aahpay_${suffix}`,
  };
}
