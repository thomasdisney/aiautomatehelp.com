"use client";

import { FormEvent, useState } from "react";

type Result =
  | { kind: "idle" }
  | { kind: "sending" }
  | {
      kind: "found";
      id: string;
      status: string;
      receivedAt: string;
      quoteText?: string;
    }
  | { kind: "missing" }
  | { kind: "error"; message: string };

const ERRORS: Record<string, string> = {
  rate_limited: "Too many tries from this network. Wait and try once more later.",
  invalid: "Use the full reference and the same email you sent with the brief.",
};

const STATUS_COPY: Record<string, string> = {
  received: "I have the brief. A yes or no and, if yes, a fixed quote will show here.",
  quoted: "This is a fixed quote for the scope I understood. Payment is not on this page yet.",
  declined: "I am not taking this job.",
};

export function StatusForm({ initialId = "" }: { initialId?: string }) {
  const [result, setResult] = useState<Result>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setResult({ kind: "sending" });
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: data.get("id"),
          email: data.get("email"),
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
        status: json.status,
        receivedAt: json.receivedAt,
        quoteText: typeof json.quoteText === "string" ? json.quoteText : undefined,
      });
    } catch {
      setResult({
        kind: "error",
        message: "Status could not be loaded. The network request failed.",
      });
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
        <div className="rounded-2xl border border-ink/10 bg-white p-6" role="status">
          <p className="text-sm font-medium uppercase tracking-wide text-ink/50">Status</p>
          <p className="mt-2 text-lg font-semibold text-ink">{result.status}</p>
          <p className="mt-3 leading-relaxed text-ink/70">
            {STATUS_COPY[result.status] ?? "This brief is on file. Check back here for updates."}
          </p>
          {result.quoteText ? (
            <p className="mt-4 leading-relaxed text-ink">{result.quoteText}</p>
          ) : null}
          <p className="mt-4 text-sm text-ink/60">
            Received {result.receivedAt}. Reference {result.id}.
          </p>
        </div>
      ) : null}
    </div>
  );
}
