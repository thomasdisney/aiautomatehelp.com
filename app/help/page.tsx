import type { Metadata } from "next";
import { HELP_MD } from "@/lib/help-content";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Help",
  description: "Help for notjunk.si: pairing, troubleshooting, billing and cancelling.",
  alternates: {
    canonical: "/help",
    types: { "text/markdown": "/help.md" },
  },
};

const html = renderMarkdown(HELP_MD);

export default function HelpPage() {
  return (
    <article className="help-doc mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <p className="help-meta">
        Also available as plain Markdown: <a href="/help.md">Markdown version</a>
      </p>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
