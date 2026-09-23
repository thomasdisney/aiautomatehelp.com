import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 py-10 safe-pad-x sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <p className="text-lg font-semibold">AutomateAI</p>
          <p className="mt-1 text-sm text-paper/70">
            Support stays on this site. Start a brief or check a reference here —
            no personal inbox.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/automation#start"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-paper px-5 text-sm font-semibold text-ink hover:bg-paper/90"
            >
              Start a brief
            </Link>
            <Link
              href="/status"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-paper/30 px-5 text-sm font-semibold text-paper hover:bg-white/10"
            >
              Check status
            </Link>
          </div>
        </div>
        <nav
          className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-paper/70"
          aria-label="Legal"
        >
          <Link
            href="/automation#start"
            className="inline-flex min-h-11 min-w-11 items-center px-2 hover:text-paper"
          >
            Start
          </Link>
          <Link
            href="/status"
            className="inline-flex min-h-11 min-w-11 items-center px-2 hover:text-paper"
          >
            Status
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 min-w-11 items-center px-2 hover:text-paper"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="inline-flex min-h-11 min-w-11 items-center px-2 hover:text-paper"
          >
            Terms
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-paper/50 safe-pad-x safe-pad-bottom">
        © {new Date().getFullYear()} AutomateAI · aiautomatehelp.com
      </div>
    </footer>
  );
}
