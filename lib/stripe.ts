import Stripe from "stripe";
import { checkoutSessionParams, paymentConfigured, publicSiteUrl } from "./payment.ts";
import type { IntakeRecord } from "./intake.ts";

function stripeSecret(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? "";
}

function webhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
}

function stripeClient(): Stripe {
  return new Stripe(stripeSecret(), {
    apiVersion: "2026-07-29.dahlia",
    typescript: true,
  });
}

function randomLetters(n: number): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz";
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function checkoutAllowed(record: IntakeRecord): boolean {
  return record.status === "accepted" && record.amountCents >= 50;
}

export async function createCheckoutUrl(record: IntakeRecord): Promise<string | null> {
  if (!paymentConfigured() || !checkoutAllowed(record)) return null;
  const session = await stripeClient().checkout.sessions.create(
    checkoutSessionParams(record, {
      origin: publicSiteUrl(),
      integrationSuffix: randomLetters(8),
    }),
  );
  const url = typeof session.url === "string" ? session.url : "";
  if (!url.startsWith("https://checkout.stripe.com/")) return null;
  return url;
}

export function verifyStripeWebhook(raw: string, signature: string | null): Stripe.Event | null {
  if (!paymentConfigured() || !signature) return null;
  try {
    return stripeClient().webhooks.constructEvent(raw, signature, webhookSecret());
  } catch {
    return null;
  }
}
