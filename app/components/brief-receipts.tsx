"use client";

import Link from "next/link";
import { briefReceiptDisplay, type BriefReceipt } from "@/lib/brief-receipt";

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
  if (!receipts.length) return null;

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-ink/50">
        Saved on this browser
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">
        These are references and original received times only. They stay on this device so a
        refresh does not lose them. They are not your email or the job text. I will
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
              <div>
                <p className="break-all font-mono text-sm text-ink">{view.id}</p>
                <p className="mt-1 text-sm text-ink/60">Received {view.receivedAt}.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {mode === "links" ? (
                  <Link
                    href={`/status?ref=${encodeURIComponent(view.id)}`}
                    className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white hover:bg-accent-hover"
                  >
                    Check status
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUse?.(view.id)}
                    className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white hover:bg-accent-hover"
                  >
                    Use this reference
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(view.id)}
                  className="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-semibold text-ink hover:bg-paper"
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
        className="mt-4 text-sm text-ink/60 underline underline-offset-2 hover:text-ink"
      >
        Clear saved on this browser
      </button>
    </div>
  );
}

export function CopyReference({ id }: { id: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const clipboard = navigator.clipboard;
        if (!clipboard?.writeText) return;
        void clipboard.writeText(id).catch(() => undefined);
      }}
      className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink hover:bg-paper"
    >
      Copy reference
    </button>
  );
}
