import type { Metadata } from "next";
import Link from "next/link";
import { AgentSetup } from "@/app/components/agent-setup";

export const metadata: Metadata = {
  title: "AI agent in your pocket",
  description:
    "Turn a spare computer into a headless AI coding agent and drive it from your iPhone. Run one command, type the code, and you're connected.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/50">
          Drive it from your phone
        </p>
        <h1 className="font-serif mt-4 text-pretty text-4xl leading-[1.1] text-ink sm:text-5xl">
          Your AI agent, in your pocket.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/70 text-pretty">
          Dedicate a spare computer to an AI coding agent and drive it from your
          iPhone. It runs headless — works a task queue, opens pull requests,
          and keeps you posted in real time.
        </p>

        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-ink/10 bg-white p-6 text-left sm:p-8">
          <h2 className="font-serif text-2xl text-ink text-pretty">Connect your agent</h2>
          <p className="mt-1 text-sm text-ink/60">
            Type the code printed by your agent's setup.
          </p>
          <AgentSetup />
          <p className="mt-5 text-xs leading-relaxed text-ink/50">
            No account. The code is the pairing secret; you set a password on
            first connect. Setup runs on the spare computer and prints that
            code. Support stays on this site.
          </p>
        </div>
        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-ink/60 text-pretty">
          Need a scoped automation instead?{" "}
          <Link
            href="/automation#start"
            className="font-medium text-ink underline underline-offset-2"
          >
            Send a brief
          </Link>{" "}
          with the trigger, tools, and done-when test. Checkout is not open yet;
          after you accept a quote, handoff may arrive before payment.
        </p>
      </div>
    </div>
  );
}
