import type { Metadata } from "next";
import { BackAtWork } from "@/app/components/back-at-work";
import { CopyCommand } from "@/app/components/copy-command";
import { AGENT_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "notjunk.si: put a spare computer to work" },
  description:
    "notjunk.si turns an old computer into an always-on agent that owns a job for you. You run it from your phone.",
  alternates: { canonical: "/" },
};

const INSTALL = `curl -fsSL ${AGENT_URL}/install | SETUP_CODE=your-code bash`;

const MACHINES = [
  {
    name: "Old laptop",
    text: "The one with the tired battery and the missing key. Plug it in and leave it on.",
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
            notjunk.si turns an old computer into an agent that stays on and owns a job for you, like
            running your movie server. It handles the whole thing and checks with you on your phone
            before anything big.
          </p>
          <div className="hero-actions">
            <a className="btn" href="#get-started">
              Get started
            </a>
            <a className="text-link" href={`${AGENT_URL}/`}>
              Open the app
            </a>
          </div>
        </div>
        <div className="hero-art">
          <BackAtWork />
        </div>
      </section>

      <section className="steps" id="get-started" aria-labelledby="steps-title">
        <div className="wrap">
          <h2 id="steps-title" className="section-title">
            Get started
          </h2>
          <p className="section-lede">About 15 minutes. You need an iPhone and the old computer, both online.</p>
          <ol className="step-list">
            <li>
              <h3>Put the app on your iPhone</h3>
              <p>
                Open <a href={`${AGENT_URL}/`}>app.notjunk.si</a> in Safari. Tap <strong>Share</strong>, then{" "}
                <strong>Add to Home Screen</strong>, and open it from there.
              </p>
            </li>
            <li>
              <h3>Choose your passphrase</h3>
              <p>
                In the app, choose <strong>Set up</strong> and pick a passphrase. Then tap{" "}
                <strong>Pair a device</strong> for a one-time setup code.
              </p>
              <p className="step-warn">
                One passphrase unlocks your account and encrypts everything.{" "}
                <strong>If you lose it, your data can&apos;t be recovered, not even by us.</strong>
              </p>
            </li>
            <li>
              <h3>Install on the old computer</h3>
              <p>Open a terminal on it and run this, with your setup code in place of your-code:</p>
              <CopyCommand command={INSTALL} />
              <p>
                When it finishes, your phone moves on by itself. The setup code works once and expires
                after 15 minutes.
              </p>
            </li>
          </ol>
          <p className="steps-more">
            Stuck somewhere? <a href="/help#set-up-and-pair-a-computer">Read the setup help</a>.
          </p>
        </div>
      </section>

      <section className="machines" aria-labelledby="machines-title">
        <div className="wrap">
          <h2 id="machines-title" className="section-title">
            The computer you stopped using will do.
          </h2>
          <p className="section-lede">
            It runs on lightweight Linux, with no screen or keyboard. Give it a job, like a movie server for
            your own films, and it looks after that job day and night.
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

      <section className="returning wrap" aria-labelledby="connect-title">
        <div className="connect" id="connect">
          <h2 id="connect-title" className="connect-title">
            Already set up?
          </h2>
          <p className="connect-sub">Enter your code in the app to unlock your account.</p>
          <p className="connect-actions">
            <a className="btn" href={`${AGENT_URL}/#connect-agent`}>
              Enter your code
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
