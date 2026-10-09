"use client";

import { FormEvent, useRef, useState } from "react";
import { AGENT_URL } from "@/lib/site-config";

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
      fail("That doesn’t look like a code. Use lowercase letters, numbers, and hyphens.");
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
          fail("We couldn’t find that code. Check what your computer printed and try again.");
          return;
        }
        fail("That doesn’t look like a code. Use lowercase letters, numbers, and hyphens.");
        return;
      }
      window.location.href = json.href ?? `${AGENT_URL}/${encodeURIComponent(c)}`;
    } catch {
      // If the check fails, still attempt connect rather than trapping the user.
      // Concatenation keeps the absolute URL visible to the navigation lint rule.
      window.location.href = AGENT_URL + "/" + encodeURIComponent(c);
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="code-form"
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
        placeholder="bright-oak"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${HINT_ID} ${ERROR_ID}` : HINT_ID}
        className="code-input"
      />
      <button
        type="submit"
        disabled={busy}
        className="btn"
      >
        {busy ? "Checking…" : "Connect"}
      </button>
      <p id={HINT_ID} className="code-hint">
        Your computer prints this code when setup finishes. It looks like{" "}
        <span className="code">bright-oak</span>.
      </p>
      {error ? (
        <p id={ERROR_ID} className="code-error" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
