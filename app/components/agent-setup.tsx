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
      setError("Enter the brief code from your agent setup (letters and numbers).");
      return;
    }
    window.location.href = `${AGENT_URL}/${encodeURIComponent(c)}`;
  }

  return (
    <form onSubmit={submit} className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="agent-code" className="sr-only">
        Agent code
      </label>
      <input
        id="agent-code"
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setError("");
        }}
        placeholder="enter your agent code"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="flex-1 rounded-md border border-ink/20 bg-paper px-3 py-2.5 font-mono text-base text-ink placeholder:text-ink/40 focus:border-ink/50 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-ink px-5 py-2.5 text-base font-medium text-paper hover:bg-ink/90"
      >
        Connect
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
