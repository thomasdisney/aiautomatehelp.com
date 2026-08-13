"use client";

import { FormEvent, useState } from "react";
import { FIELD_LIMITS, parseThread, type ThreadEntry } from "@/lib/intake";

type Found = {
  kind: "found";
  id: string;
  email: string;
  status: string;
  receivedAt: string;
  quoteText?: string;
  customerReply?: string;
  updateText?: string;
  amountCents?: number;
  thread: ThreadEntry[];
};

type Result =
  | { kind: "idle" }
  | { kind: "sending" }
  | Found
  | { kind: "missing" }
  | { kind: "error"; message: string };

const ERRORS: Record<string, string> = {
  rate_limited: "Too many tries from this network. Wait and try once more later.",
  invalid: "Use the full reference and the same email you sent with the brief.",
  not_allowed: "That action is not available on this brief right now.",
  not_found: "No matching brief.",
  payment_not_connected: "Checkout is not connected yet. I will not take money until it is.",
  already_paid: "This quote is already marked paid.",
};

const STATUS_COPY: Record<string, string> = {
  received: "I have the brief. A yes or no and, if yes, a fixed quote will show here.",
  quoted: "This is a fixed quote for the scope I understood. After you accept, you pay that amount here before I start.",
  declined: "I am not taking this job.",
  accepted: "You accepted this quote. I will not start until it is paid.",
  withdrawn: "You turned down this quote. Send a new brief if you want a different job.",
  paid: "Paid. I will start the written scope. Check here for the handoff.",
  delivered: "Handed off. The note below is how it runs. Ask here if something in that scope is broken.",
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

export function StatusForm({
  initialId = "",
  paymentConnected = false,
}: {
  initialId?: string;
  paymentConnected?: boolean;
}) {
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    setReplyError("");
    setResult({ kind: "sending" });
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: data.get("id"),
          email,
          website: data.get("website"),
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        code?: string;
        id?: string;
        status?: string;
        receivedAt?: string;
        quoteText?: string;
        customerReply?: string;
        updateText?: string;
        amountCents?: number;
        thread?: unknown;
      };
      if (json.code === "not_found" || res.status === 404) {
        setResult({ kind: "missing" });
        return;
      }
      if (!res.ok || !json.ok || !json.id || !json.status || !json.receivedAt) {
        setResult({
          kind: "error",
          message: ERRORS[json.code ?? ""] ?? "Status could not be loaded. Try again later.",
        });
        return;
      }
      setResult({
        kind: "found",
        id: json.id,
        email,
        status: json.status,
        receivedAt: json.receivedAt,
        quoteText: typeof json.quoteText === "string" ? json.quoteText : undefined,
        customerReply: typeof json.customerReply === "string" ? json.customerReply : undefined,
        updateText: typeof json.updateText === "string" ? json.updateText : undefined,
        amountCents: typeof json.amountCents === "number" ? json.amountCents : undefined,
        thread: parseThread(json.thread),
      });
    } catch {
      setResult({
        kind: "error",
        message: "Status could not be loaded. The network request failed.",
      });
    }
  }

  async function sendDecision(
    decision: "accept" | "decline" | "question",
    note: string,
  ): Promise<boolean> {
    if (result.kind !== "found") return false;
    setReplyBusy(true);
    setReplyError("");
    try {
      const res = await fetch("/api/status/reply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: result.id,
          email: result.email,
          decision,
          note,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        code?: string;
        id?: string;
        status?: string;
        receivedAt?: string;
        quoteText?: string;
        customerReply?: string;
        updateText?: string;
        amountCents?: number;
        thread?: unknown;
      };
      if (!res.ok || !json.ok || !json.id || !json.status || !json.receivedAt) {
        setReplyError(
          ERRORS[json.code ?? ""] ?? "That reply was not stored. Try again later.",
        );
        return false;
      }
      setResult({
        kind: "found",
        id: json.id,
        email: result.email,
        status: json.status,
        receivedAt: json.receivedAt,
        quoteText: typeof json.quoteText === "string" ? json.quoteText : undefined,
        customerReply: typeof json.customerReply === "string" ? json.customerReply : undefined,
        updateText: typeof json.updateText === "string" ? json.updateText : undefined,
        amountCents: typeof json.amountCents === "number" ? json.amountCents : result.amountCents,
        thread: parseThread(json.thread),
      });
      return true;
    } catch {
      setReplyError("That reply was not stored. The network request failed.");
      return false;
    } finally {
      setReplyBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8"
      >
        <p className="text-sm text-ink/60">
          Use the full reference from the confirmation and the email you submitted. I will not
          email a personal inbox.
        </p>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-ink">
            Reference
          </label>
          <input
            id="id"
            name="id"
            required
            defaultValue={initialId}
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 font-mono text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={120}
            autoComplete="email"
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        {result.kind === "error" ? (
          <p className="text-sm text-red-700" role="alert">
            {result.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={result.kind === "sending"}
          className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {result.kind === "sending" ? "Checking…" : "Check status"}
        </button>
      </form>

      {result.kind === "missing" ? (
        <div className="rounded-2xl border border-ink/10 bg-white p-6" role="status">
          <p className="font-semibold text-ink">No matching brief</p>
          <p className="mt-2 leading-relaxed text-ink/70">
            That reference and email do not match a stored brief. Check both and try once more.
          </p>
        </div>
      ) : null}

      {result.kind === "found" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-white p-6" role="status">
            <p className="text-sm font-medium uppercase tracking-wide text-ink/50">Status</p>
            <p className="mt-2 text-lg font-semibold text-ink">{result.status}</p>
            <p className="mt-3 leading-relaxed text-ink/70">
              {STATUS_COPY[result.status] ?? "This brief is on file. Check back here for updates."}
            </p>
            {result.amountCents ? (
              <p className="mt-4 text-lg font-semibold text-ink">{formatUsd(result.amountCents)}</p>
            ) : null}
            {result.quoteText ? (
              <p className="mt-4 leading-relaxed text-ink">{result.quoteText}</p>
            ) : null}
            {result.thread.length ? (
              <ol className="mt-4 space-y-3">
                {result.thread.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="rounded-xl bg-paper px-4 py-3">
                    <p className="text-sm font-medium text-ink/60">
                      {entry.role === "customer" ? "You" : "AutomateAI"}
                    </p>
                    <p className="mt-1 leading-relaxed text-ink">{entry.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <>
                {result.updateText ? (
                  <div className="mt-4 rounded-xl bg-paper px-4 py-3">
                    <p className="text-sm font-medium text-ink/60">Latest update</p>
                    <p className="mt-1 leading-relaxed text-ink">{result.updateText}</p>
                  </div>
                ) : null}
                {result.customerReply ? (
                  <div className="mt-4 rounded-xl bg-paper px-4 py-3">
                    <p className="text-sm font-medium text-ink/60">Your latest note</p>
                    <p className="mt-1 leading-relaxed text-ink">{result.customerReply}</p>
                  </div>
                ) : null}
              </>
            )}
            <p className="mt-4 text-sm text-ink/60">
              Received {result.receivedAt}. Reference {result.id}.
            </p>
          </div>
          <PayPanel
            accepted={result.status === "accepted"}
            amountCents={result.amountCents}
            paymentConnected={paymentConnected}
            id={result.id}
            email={result.email}
          />
          <ReplyPanel
            quoted={result.status === "quoted"}
            busy={replyBusy}
            error={replyError}
            onSend={sendDecision}
          />
        </div>
      ) : null}
    </div>
  );
}

function PayPanel({
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
          ERRORS[json.code ?? ""] ?? "Checkout is not connected yet. I will not take money until it is.",
        );
        return;
      }
      if (!json.url.startsWith("https://checkout.stripe.com/")) {
        setError("Checkout is not connected yet. I will not take money until it is.");
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
          Checkout is not connected yet. I will not take money and I will not start until it is.
          The quoted amount is {formatUsd(amountCents)}.
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

function ReplyPanel({
  quoted,
  busy,
  error,
  onSend,
}: {
  quoted: boolean;
  busy: boolean;
  error: string;
  onSend: (decision: "accept" | "decline" | "question", note: string) => Promise<boolean>;
}) {
  const [note, setNote] = useState("");

  async function submit(decision: "accept" | "decline" | "question") {
    const saved = await onSend(decision, note);
    if (saved) setNote("");
  }

  return (
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
      <p className="text-sm font-medium text-ink">Reply on this brief</p>
      <p className="text-sm leading-relaxed text-ink/60">
        {quoted
          ? "Accept, turn it down, or ask a question here. Notes stay on this page in order. After you accept, payment is the stored amount only."
          : "Ask a question about this brief here. Notes stay on this page in order. There is no personal inbox."}
      </p>
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-ink">
          Note {quoted ? <span className="font-normal text-ink/50">(optional to accept or decline)</span> : null}
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
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        {quoted ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit("accept")}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {busy ? "Saving…" : "Accept quote"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit("decline")}
              className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-paper disabled:opacity-60"
            >
              Decline
            </button>
          </>
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
