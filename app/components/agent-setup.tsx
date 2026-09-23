"use client";

import { FormEvent, useRef, useState } from "react";

const AGENT_URL = "https://agent.aiautomatehelp.com";
const CODE_RE = /^[a-z0-9-]{4,64}$/;
const HINT_ID = "agent-code-hint";
const ERROR_ID = "agent-code-error";

export function AgentSetup() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function fail(message: string) {
    setError(message);
    setBusy(false);
    queueMicrotask(() => inputRef.current?.focus());
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const c = code.trim().toLowerCase();
    if (!CODE_RE.test(c)) {
      fail("Enter the code from your agent setup (letters, numbers, hyphens).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/agent-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        code?: string;
        href?: string;
      };
      if (!json.ok) {
        if (json.code === "not_found") {
          fail("That code is not active. Check the printout from setup and try again.");
          return;
        }
        fail("Enter the code from your agent setup (letters, numbers, hyphens).");
        return;
      }
      window.location.href = json.href ?? `${AGENT_URL}/${encodeURIComponent(c)}`;
    } catch {
      // If the check fails, still attempt connect rather than trapping the user.
      window.location.href = `${AGENT_URL}/${encodeURIComponent(c)}`;
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:flex-wrap"
      noValidate
    >
      <label htmlFor="agent-code" className="sr-only">
        Agent code
      </label>
      <input
        ref={inputRef}
        id="agent-code"
        name="agent-code"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setError("");
        }}
        placeholder="e.g. bright-oak…"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${HINT_ID} ${ERROR_ID}` : HINT_ID}
        className="min-h-11 flex-1 rounded-md border border-ink/20 bg-paper px-3 py-2.5 font-mono text-base text-ink placeholder:text-ink/40 focus:border-ink/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-5 py-2.5 text-base font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
      >
        {busy ? "Checking…" : "Connect"}
      </button>
      <p id={HINT_ID} className="w-full text-xs leading-relaxed text-ink/50">
        Format matches the setup printout: lowercase letters, numbers, hyphens (e.g.{" "}
        <span className="font-mono">bright-oak</span>). How to get your code: run setup on the
        spare computer — it prints the pairing code there.
      </p>
      {error ? (
        <p id={ERROR_ID} className="w-full text-sm text-red-700" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
