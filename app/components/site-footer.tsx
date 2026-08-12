import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold">AutomateAI</p>
          <p className="mt-1 text-sm text-paper/70">
            Support is on this site. There is no personal inbox, phone, or booking link.
          </p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-paper/70" aria-label="Legal">
          <Link href="/#start" className="hover:text-paper">
            Start
          </Link>
          <Link href="/privacy" className="hover:text-paper">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-paper">
            Terms
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-paper/50">
        © {new Date().getFullYear()} AutomateAI · aiautomatehelp.com
      </div>
    </footer>
  );
}
