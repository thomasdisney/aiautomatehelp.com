import Link from "next/link";
import { MobileNav } from "@/app/components/mobile-nav";

const LINKS = [
  { href: "/", label: "Agent" },
  { href: "/automation", label: "Automation" },
  { href: "/status", label: "Status" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur safe-pad-top">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between safe-pad-x sm:h-16">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center text-base font-semibold tracking-tight text-ink"
        >
          AutomateAI
        </Link>
        <nav
          className="hidden items-center gap-1 text-sm text-ink/70 md:flex"
          aria-label="Primary"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-md px-3 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
