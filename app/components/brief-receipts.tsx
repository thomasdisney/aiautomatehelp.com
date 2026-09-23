"use client";

import { useState } from "react";
import Link from "next/link";
import { briefReceiptDisplay, type BriefReceipt } from "@/lib/brief-receipt";
import { briefReceiptsOmitCopy } from "@/lib/site-copy";

export function BriefReceiptList({
  receipts,
  mode,
  onUse,
  onRemove,
  onClear,
}: {
  receipts: BriefReceipt[];
  mode: "links" | "fill";
  onUse?: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  if (!receipts.length) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-ink/50">
          Saved on this browser
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          After you send a brief, the reference appears here on this device.
        </p>
        <Link
          href="/automation#start"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-2"
        >
          Send a brief
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-ink/50">
        Saved on this browser
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">
        These are references and original received times only. A matching check or reply
        still shows that stored time from this device. {briefReceiptsOmitCopy()} I will
        not email them.
      </p>
      <ul className="mt-4 space-y-4">
        {receipts.map((receipt) => {
          const view = briefReceiptDisplay(receipt);
          if (!view) return null;
          return (
            <li
              key={view.id}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="break-all font-mono text-sm text-ink">{view.id}</p>
                <p className="mt-1 text-sm text-ink/60">Received {view.receivedAt}.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {mode === "links" ? (
                  <Link
                    href={`/status?ref=${encodeURIComponent(view.id)}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover"
                  >
                    Check status
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUse?.(view.id)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover"
                  >
                    Use this reference
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(view.id)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink hover:bg-paper"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 inline-flex min-h-11 items-center text-sm text-ink/60 underline underline-offset-2 hover:text-ink"
      >
        Clear saved on this browser
      </button>
    </div>
  );
}

export function CopyReference({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const clipboard = navigator.clipboard;
    if (!clipboard?.writeText) return;
    try {
      await clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-live="polite"
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink hover:bg-paper"
    >
      {copied ? "Copied" : "Copy reference"}
    </button>
  );
}
