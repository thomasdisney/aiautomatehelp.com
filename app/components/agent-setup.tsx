"use client";

import { FormEvent, useState } from "react";

const AGENT_URL = "https://agent.aiautomatehelp.com";

export function AgentSetup() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const c = code.trim().toLowerCase();
    if (!/^[a-z0-9-]{4,64}$/.test(c)) {
      setError("Enter the code from your agent setup (letters, numbers, hyphens).");
      return;
    }
    window.location.href = `${AGENT_URL}/${encodeURIComponent(c)}`;
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:flex-wrap"
      noValidate
    >
      <label htmlFor="agent-code" className="sr-only">
        Agent code
      </label>
      <input
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
        aria-describedby={error ? "agent-code-error" : undefined}
        className="min-h-11 flex-1 rounded-md border border-ink/20 bg-paper px-3 py-2.5 font-mono text-base text-ink placeholder:text-ink/40 focus:border-ink/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-5 py-2.5 text-base font-medium text-paper hover:bg-ink/90"
      >
        Connect
      </button>
      {error ? (
        <p id="agent-code-error" className="w-full text-sm text-red-700" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
