"use client";

import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BriefReceiptList, CopyReference } from "@/app/components/brief-receipts";
import {
  browserReceiptStore,
  clearBriefReceipts,
  dropBriefReceipt,
  getBriefReceiptServerSnapshot,
  getBriefReceiptSnapshot,
  persistBriefReceiptFromPublicPayload,
  subscribeBriefReceipts,
  receivedAtFromStoredReceipt,
  toPublicIntakeCreate,
} from "@/lib/brief-receipt";
import { FIELD_LIMITS } from "@/lib/intake";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; id: string; receivedAt?: string }
  | { kind: "error"; message: string };

const ERRORS: Record<string, string> = {
  rate_limited: "Too many tries from this network. Wait and try once more later.",
  required: "Name, email, and a short job description are required.",
  email: "That email does not look usable.",
  invalid: "The form could not be read. Try again.",
  intake_not_connected: "The inbox is not connected. This brief was not received.",
};

export function IntakeForm({ connected }: { connected: boolean }) {
  const [live, setLive] = useState<boolean | null>(connected ? true : null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const receipts = useSyncExternalStore(
    subscribeBriefReceipts,
    getBriefReceiptSnapshot,
    getBriefReceiptServerSnapshot,
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/intake", { cache: "no-store" })
      .then((res) => res.json() as Promise<{ connected?: boolean }>)
      .then((json) => {
        if (!cancelled) setLive(Boolean(json.connected));
      })
      .catch(() => {
        if (!cancelled) setLive(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saved = (
    <BriefReceiptList
      receipts={receipts}
      mode="links"
      onRemove={(id) => {
        dropBriefReceipt(browserReceiptStore(), id);
      }}
      onClear={() => {
        clearBriefReceipts(browserReceiptStore());
      }}
    />
  );

  if (live === null) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8" role="status">
          <p className="text-sm font-medium uppercase tracking-wide text-ink/50">Inbox status</p>
          <p className="mt-3 text-lg font-semibold text-ink">Checking the inbox…</p>
          <p className="mt-3 leading-relaxed text-ink/70">
            I will not show a send button until I know a brief can be stored here.
          </p>
        </div>
        {saved}
      </div>
    );
  }

  if (!live) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-ink/50">Inbox status</p>
          <p className="mt-3 text-lg font-semibold text-ink">Not connected yet</p>
          <p className="mt-3 leading-relaxed text-ink/70">
            I will not pretend this form sent a message. There is no public email and no
            calendar. When the inbox is live, this section will accept a brief and I will
            reply here — not through a personal inbox.
          </p>
          <p className="mt-4 text-sm text-ink/60">
            Do not send passwords, API keys, or customer lists in a brief.
          </p>
        </div>
        {saved}
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        id?: string;
        code?: string;
        receivedAt?: string;
      };
      if (!res.ok || !json.ok) {
        setStatus({
          kind: "error",
          message: ERRORS[json.code ?? ""] ?? "The brief was not received. Try again later.",
        });
        return;
      }
      form.reset();
      const receiptsAfter = persistBriefReceiptFromPublicPayload(browserReceiptStore(), json);
      const created = toPublicIntakeCreate(json);
      const receivedAt = created
        ? receivedAtFromStoredReceipt(receiptsAfter, created.id, created.receivedAt)
        : null;
      setStatus(
        created
          ? { kind: "sent", id: created.id, receivedAt: receivedAt ?? created.receivedAt }
          : { kind: "sent", id: "received" },
      );
    } catch {
      setStatus({
        kind: "error",
        message: "The brief was not received. The network request failed.",
      });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8" role="status">
          <p className="text-lg font-semibold text-ink">Brief received</p>
          <p className="mt-3 leading-relaxed text-ink/70">
            I have the job description. A yes or no and, if yes, a fixed quote will show on the
            status page. Save this full reference. This browser keeps the reference and shows
            the original received time from this device, not your email or the job text. I will
            not email it.
          </p>
          <p className="mt-4 break-all font-mono text-sm text-ink">{status.id}</p>
          {status.receivedAt ? (
            <p className="mt-2 text-sm text-ink/60">Received {status.receivedAt}.</p>
          ) : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/status?ref=${encodeURIComponent(status.id)}`}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Check status
            </Link>
            <CopyReference id={status.id} />
            <button
              type="button"
              onClick={() => setStatus({ kind: "idle" })}
              className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
            >
              Send another brief
            </button>
          </div>
        </div>
        {saved}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8"
      >
        <p className="text-sm text-ink/60">
          Describe one workflow. Do not send secrets. Text is treated as data, not as
          instructions.
        </p>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={FIELD_LIMITS.name}
            autoComplete="name"
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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
            maxLength={FIELD_LIMITS.email}
            autoComplete="email"
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-ink">
            Company <span className="font-normal text-ink/50">(optional)</span>
          </label>
          <input
            id="company"
            name="company"
            maxLength={FIELD_LIMITS.company}
            autoComplete="organization"
            className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-ink">
            The job
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            maxLength={FIELD_LIMITS.message}
            placeholder="What repeats, which tools you use, and what done looks like."
            className="mt-1.5 w-full resize-y rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        {status.kind === "error" ? (
          <p className="text-sm text-red-700" role="alert">
            {status.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {status.kind === "sending" ? "Sending…" : "Send the brief"}
        </button>
      </form>
      {saved}
    </div>
  );
}
