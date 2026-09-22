import type { Metadata } from "next";
import { AgentSetup } from "@/app/components/agent-setup";

export const metadata: Metadata = {
  title: "AI agent in your pocket",
  description:
    "Turn a spare computer into a headless AI coding agent and drive it from your iPhone. Open-code setup, GitHub storage, and a private phone channel.",
};

const STEPS = [
  {
    n: "01",
    title: "Run one command",
    body: "On any spare computer, run the one-line installer. It sets up the agent and prints a short code.",
  },
  {
    n: "02",
    title: "Type the code",
    body: "Enter that code here. It drops you into a private, password-locked channel to your agent.",
  },
  {
    n: "03",
    title: "Drive from your phone",
    body: "See the project, tasks, and every change. Request fixes and features — the agent opens the pull requests.",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/50">
            opencode-companion
          </p>
          <h1 className="font-serif mt-4 text-4xl leading-[1.1] text-ink sm:text-5xl">
            Your AI agent, in your pocket.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70 sm:text-xl">
            Dedicate a spare computer to an AI coding agent and drive it from
            your iPhone. The agent runs headless — it works a task queue, opens
            pull requests, and pushes updates straight to your phone.
          </p>
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

        <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-ink">Connect your agent</h2>
          <p className="mt-1 text-sm text-ink/60">
            Type the brief code generated during setup.
          </p>
          <AgentSetup />
          <p className="mt-6 text-xs text-ink/50">
            No account. The code is your agent&apos;s pairing secret; you set a
            password on first connect.
          </p>
        </div>
      </div>

      <section className="mt-20 border-t border-ink/10 pt-14">
        <h2 className="font-serif text-3xl text-ink">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="rounded-2xl border border-ink/10 p-6">
              <span className="font-serif text-xl text-accent">{step.n}</span>
              <p className="mt-2 font-semibold text-ink">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
