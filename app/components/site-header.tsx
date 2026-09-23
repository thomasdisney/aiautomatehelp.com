"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Agent" },
  { href: "/automation", label: "Automation" },
  { href: "/status", label: "Status" },
] as const;

function linkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur safe-pad-top">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between safe-pad-x sm:h-16">
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
          {LINKS.map((link) => {
            const active = linkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-md px-3 ${
                  active ? "font-medium text-ink" : "hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-ink/15 px-3 text-sm text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-ink/10 py-2 md:hidden safe-pad-x"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {LINKS.map((link) => {
              const active = linkActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center text-base ${
                      active ? "font-medium text-ink" : "text-ink"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
