import type { Metadata } from "next";
import { AgentSetup } from "@/app/components/agent-setup";

export const metadata: Metadata = {
  title: "AI agent in your pocket",
  description:
    "Turn a spare computer into a headless AI coding agent and drive it from your iPhone. Run one command, type the code, and you're connected.",
};

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/50">
          opencode-companion
        </p>
        <h1 className="font-serif mt-4 text-4xl leading-[1.1] text-ink sm:text-5xl">
          Your AI agent, in your pocket.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
          Dedicate a spare computer to an AI coding agent and drive it from your
          iPhone. It runs headless — works a task queue, opens pull requests,
          and keeps you posted in real time.
        </p>

        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-ink/10 bg-white p-6 text-left sm:p-8">
          <h2 className="font-serif text-2xl text-ink">Connect your agent</h2>
          <p className="mt-1 text-sm text-ink/60">
            Type the code from your agent&apos;s setup.
          </p>
          <AgentSetup />
          <p className="mt-5 text-xs text-ink/50">
            No account. The code is your agent&apos;s pairing secret; you set a
            password on first connect.
          </p>
        </div>

        <p className="mt-8 text-sm text-ink/60">
          <a
            href="https://github.com/thomasdisney/opencode-companion"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-ink underline underline-offset-4 hover:text-ink/70"
          >
            GitHub — setup &amp; source
          </a>
        </p>
      </div>
    </main>
  );
}
