"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/#offer", label: "Offer" },
  { href: "/#how", label: "How it works" },
  { href: "/#price", label: "Price" },
  { href: "/#start", label: "Start" },
  { href: "/status", label: "Status" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="text-base font-semibold tracking-tight text-ink">
          AutomateAI
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink/70 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="rounded-md border border-ink/15 px-3 py-1.5 text-sm text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-ink/10 px-5 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-3 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="block py-1 text-ink" onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
