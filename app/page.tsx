import type { Metadata } from "next";
import { AgentSetup } from "@/app/components/agent-setup";

export const metadata: Metadata = {
  title: { absolute: "Junk Drawer Agents: put a spare computer to work" },
  description:
    "Junk Drawer Agents turns a spare computer into a coding agent you run from your phone. You approve every change.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-pretty text-4xl leading-[1.1] text-ink sm:text-5xl">
          Put a spare computer to work.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/70 text-pretty">
          Junk Drawer Agents turns an old laptop into a coding agent you run from
          your phone. It works through your list, opens pull requests, and waits
          for your OK.
        </p>

        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-ink/10 bg-white p-6 text-left sm:p-8">
          <h2 className="font-serif text-2xl text-ink text-pretty">Connect your agent</h2>
          <p className="mt-1 text-sm text-ink/60">
            Type the code your computer showed at the end of setup.
          </p>
          <AgentSetup />
          <p className="mt-5 text-xs leading-relaxed text-ink/50">
            First time? You&apos;ll pick a password after you connect.
          </p>
        </div>
      </div>
    </div>
  );
}
