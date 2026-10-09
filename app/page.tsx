import type { Metadata } from "next";
import { AgentSetup } from "@/app/components/agent-setup";
import { JunkDrawer } from "@/app/components/junk-drawer";
import { AGENT_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Junk Drawer Agents: put a spare computer to work" },
  description:
    "Junk Drawer Agents turns a spare computer into a coding agent you run from your phone. You approve every change.",
  alternates: { canonical: "/" },
};

const MACHINES = [
  {
    name: "Old laptop",
    text: "The one with the tired battery and the missing key. Plug it in and let it run.",
  },
  {
    name: "Windows 10 PC",
    text: "Microsoft ended support for Windows 10. The computer itself still works fine.",
  },
  {
    name: "Chromebook",
    text: "Google stopped sending it updates. It still has years of work left in it.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title" className="display">
            Put a spare computer to work.
          </h1>
          <p className="lede">
            Junk Drawer Agents turns an old laptop into a coding agent you run from your phone. It works
            through your list, opens pull requests, and waits for your OK.
          </p>

          <div className="connect" id="connect">
            <h2 className="connect-title">Connect your agent</h2>
            <p className="connect-sub">Type the code your computer showed at the end of setup.</p>
            <AgentSetup />
            <p className="connect-note">First time? You&apos;ll pick a password after you connect.</p>
          </div>
        </div>
        <div className="hero-art">
          <JunkDrawer />
        </div>
      </section>

      <section className="machines" aria-labelledby="machines-title">
        <div className="wrap">
          <h2 id="machines-title" className="section-title">
            The computer in your drawer will do.
          </h2>
          <p className="section-lede">
            It runs on lightweight Linux, with no screen or keyboard needed. Once it&apos;s set up, it stays
            on in a corner and you use it from your phone.
          </p>
          <ul className="machine-list">
            {MACHINES.map((m) => (
              <li key={m.name}>
                <span className="tape">{m.name}</span>
                <p>{m.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="steps wrap" aria-labelledby="steps-title">
        <h2 id="steps-title" className="section-title">
          Setting one up
        </h2>
        <ol className="step-list">
          <li>
            <h3>On your phone</h3>
            <p>
              Open <a href={`${AGENT_URL}/`}>the app</a>, choose <strong>Set up</strong> and pick a password. Then tap{" "}
              <strong>Pair a device</strong> to get a one-time setup code.
            </p>
          </li>
          <li>
            <h3>On the old computer</h3>
            <p>
              Run the Junk Drawer Agents installer and paste the setup code. When it finishes, it prints a
              pairing code like <span className="code">bright-oak</span>.
            </p>
          </li>
          <li>
            <h3>Back on your phone</h3>
            <p>
              The app moves on by itself when the computer comes online. On iPhone, tap{" "}
              <strong>Share</strong>, then <strong>Add to Home Screen</strong> to keep it handy.
            </p>
          </li>
        </ol>
        <p className="steps-more">
          Stuck somewhere? <a href="/help#set-up-and-pair-a-computer">Read the setup help</a>.
        </p>
      </section>
    </>
  );
}
