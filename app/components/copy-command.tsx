"use client";

import { useState } from "react";

// A shell command with a Copy button. The command stays selectable text, so it
// still works if the clipboard is blocked.
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="cmd">
      <code className="cmd-text">{command}</code>
      <button type="button" className="cmd-btn" onClick={() => void copy()}>
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Command copied" : ""}
      </span>
    </div>
  );
}
