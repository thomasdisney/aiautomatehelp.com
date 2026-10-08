import { AGENT_URL, SITE_HOST } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 py-10 safe-pad-x sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <p className="text-lg font-semibold">Junk Drawer Agents</p>
          <p className="mt-1 text-sm text-paper/70">
            A coding agent on a computer you own. You approve every change.
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-paper/70"
          aria-label="Site"
        >
          <a
            href={`${AGENT_URL}/`}
            className="inline-flex min-h-11 min-w-11 items-center px-2 hover:text-paper"
          >
            Open the app
          </a>
          <a
            href={`${AGENT_URL}/legal`}
            className="inline-flex min-h-11 min-w-11 items-center px-2 hover:text-paper"
          >
            Legal
          </a>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-paper/50 safe-pad-x safe-pad-bottom">
        © {new Date().getFullYear()} Junk Drawer Agents, {SITE_HOST}
      </div>
    </footer>
  );
}
