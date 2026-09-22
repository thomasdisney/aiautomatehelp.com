import type { Metadata } from "next";
import { AgentSetup } from "@/app/components/agent-setup";

export const metadata: Metadata = {
  title: "Agent setup",
  description:
    "Turn a spare computer into a headless AI agent you drive from your phone.",
};

export default function AgentPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wider text-ink/50">
          opencode-companion
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Your AI agent, in your pocket.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink/70">
          Dedicate a spare computer to an AI coding agent and drive it from your
          iPhone. The agent runs headless — it works from a task queue, opens
          pull requests, and pushes updates straight to your phone. This page is
          the front door: your home device prints a short code, you type it here,
          and you land in your private command channel.
        </p>

        <div className="mt-10 rounded-xl border border-ink/10 bg-paper p-6">
          <h2 className="text-lg font-medium text-ink">Connect your agent</h2>
          <p className="mt-1 text-sm text-ink/60">
            Type the brief code generated during setup.
          </p>
          <AgentSetup />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <a
            href="https://github.com/thomasdisney/opencode-companion"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-ink underline underline-offset-4 hover:text-ink/70"
          >
            GitHub — setup &amp; source
          </a>
          <a
            href="https://github.com/thomasdisney/opencode-companion#readme"
            target="_blank"
            rel="noreferrer"
            className="text-ink/70 hover:text-ink"
          >
            Documentation
          </a>
        </div>
      </div>
    </main>
  );
}
