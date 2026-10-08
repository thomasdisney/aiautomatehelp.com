import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur safe-pad-top">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center safe-pad-x sm:h-16">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center text-base font-semibold tracking-tight text-ink"
        >
          Junk Drawer Agents
        </Link>
      </div>
    </header>
  );
}
