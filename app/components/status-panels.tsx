"use client";

import { useState } from "react";
import { FIELD_LIMITS } from "@/lib/intake";

const ERRORS: Record<string, string> = {
  rate_limited: "Too many tries from this network. Wait and try once more later.",
  invalid: "Use the full reference and the same email you sent with the brief.",
  not_allowed: "That action is not available on this brief right now.",
  not_found: "No matching brief.",
  payment_not_connected: "Payment is not available for this quote yet.",
  already_paid: "This quote is already marked paid.",
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

function formatDueAt(value: string): string {
  const dueAt = value;
  if (!dueAt) return "";
  const [year, month, day] = dueAt.split("-").map(Number);
  if (!year || !month || !day) return dueAt;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function PayPanel({
  accepted,
  amountCents,
  paymentConnected,
  id,
  email,
}: {
  accepted: boolean;
  amountCents?: number;
  paymentConnected: boolean;
  id: string;
  email: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!accepted || !amountCents) return null;

  async function startPay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, email }),
      });
      const json = (await res.json()) as { ok?: boolean; code?: string; url?: string };
      if (!res.ok || !json.ok || !json.url) {
        setError(
          ERRORS[json.code ?? ""] ?? "Payment could not be started. Try again later.",
        );
        return;
      }
      if (!json.url.startsWith("https://checkout.stripe.com/")) {
        setError("Payment could not be started. Try again later.");
        return;
      }
      window.location.assign(json.url);
    } catch {
      setError("Checkout could not be started. The network request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
      <p className="text-sm font-medium text-ink">Pay this quote</p>
      {paymentConnected ? (
        <>
          <p className="text-sm leading-relaxed text-ink/60">
            This charges the stored amount ({formatUsd(amountCents)}) only. I do not start until
            payment clears.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void startPay()}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? "Opening checkout…" : `Pay ${formatUsd(amountCents)}`}
          </button>
        </>
      ) : (
        <p className="text-sm leading-relaxed text-ink/60">
          Payment is not open on this quote yet. The quoted amount is {formatUsd(amountCents)}.
          After handoff, confirm the done-when test on this page.
        </p>
      )}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ReplyPanel({
  quoted,
  accepted,
  delivered,
  confirmed,
  amountCents,
  dueAt,
  doneWhen,
  quoteText,
  busy,
  error,
  onSend,
}: {
  quoted: boolean;
  accepted: boolean;
  delivered: boolean;
  confirmed: boolean;
  amountCents?: number;
  dueAt?: string;
  doneWhen?: string;
  quoteText?: string;
  busy: boolean;
  error: string;
  onSend: (
    decision: "accept" | "decline" | "question" | "confirm",
    note: string,
  ) => Promise<boolean>;
}) {
  const [note, setNote] = useState("");
  const [ackTerms, setAckTerms] = useState(false);
  const [ackDone, setAckDone] = useState(false);
  const canDecline = quoted || accepted;
  const canAccept =
    quoted &&
    Boolean(doneWhen) &&
    Boolean(amountCents) &&
    Boolean(dueAt) &&
    Boolean(quoteText) &&
    ackTerms;
  const canConfirm = delivered && !confirmed && Boolean(doneWhen) && ackDone;

  async function submit(decision: "accept" | "decline" | "question" | "confirm") {
    const saved = await onSend(decision, note);
    if (saved) {
      setNote("");
      setAckTerms(false);
      setAckDone(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
      <p className="text-sm font-medium text-ink">Reply on this brief</p>
      <p className="text-sm leading-relaxed text-ink/60">
        {quoted
          ? "Accept, turn it down, or ask a question here. Accepting agrees to the stored written scope, price, date, and done-when test together. Notes stay on this page in order. After you accept, payment is the stored amount only. You can still turn it down until it is paid."
          : accepted
            ? "You can still turn this quote down until it is paid. Ask a question here. Notes stay on this page in order."
            : delivered && !confirmed
              ? "The handoff is posted. Confirm the stored done-when test here when it passes, or ask a question. Notes stay on this page in order."
              : "Ask a question about this brief here. Notes stay on this page in order."}
      </p>
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-ink">
          Note{" "}
          {canDecline || canConfirm ? (
            <span className="font-normal text-ink/50">(optional to accept, decline, or confirm)</span>
          ) : null}
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          maxLength={FIELD_LIMITS.customerReply}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="A question or a short note. Do not send secrets."
          className="mt-1.5 w-full resize-y rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>
      {quoted && doneWhen && amountCents && dueAt && quoteText ? (
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink">
          <input
            type="checkbox"
            className="mt-1"
            checked={ackTerms}
            onChange={(event) => setAckTerms(event.target.checked)}
          />
          <span>
            I accept {formatUsd(amountCents)}, delivery by {formatDueAt(dueAt) || dueAt},
            the written scope above, and that this job is done when {doneWhen}
          </span>
        </label>
      ) : null}
      {delivered && !confirmed && doneWhen ? (
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink">
          <input
            type="checkbox"
            className="mt-1"
            checked={ackDone}
            onChange={(event) => setAckDone(event.target.checked)}
          />
          <span>This job is done. The stored test passed: {doneWhen}</span>
        </label>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        {quoted ? (
          <button
            type="button"
            disabled={busy || !canAccept}
            onClick={() => void submit("accept")}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? "Saving…" : "Accept quote"}
          </button>
        ) : null}
        {delivered && !confirmed ? (
          <button
            type="button"
            disabled={busy || !canConfirm}
            onClick={() => void submit("confirm")}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? "Saving…" : "Confirm done"}
          </button>
        ) : null}
        {canDecline ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit("decline")}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-paper disabled:opacity-60"
          >
            Decline
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => void submit("question")}
          className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-paper disabled:opacity-60"
        >
          Send note
        </button>
      </div>
    </div>
  );
}
