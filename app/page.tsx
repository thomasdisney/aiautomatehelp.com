import type { Metadata } from "next";
import { BackAtWork } from "@/app/components/back-at-work";
import { MACHINES } from "@/lib/machines";
import { AGENT_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "notjunk.si: put a spare computer to work" },
  description:
    "notjunk.si turns a spare computer into a coding agent you run from your phone. You approve every change.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title" className="display">
            Put a spare computer to work.
          </h1>
          <p className="lede">
            Turn an old laptop into a coding agent you run from your phone. It works through your list,
            opens pull requests, and waits for your OK.
          </p>

          <div className="connect" id="connect">
            <h2 className="connect-title">Already set up?</h2>
            <p className="connect-sub">Enter your code in the app to unlock your account.</p>
            <p className="connect-actions">
              <a className="btn" href={`${AGENT_URL}/#connect-agent`}>
                Enter your code
              </a>
            </p>
          </div>
        </div>
        <div className="hero-art">
          <BackAtWork />
        </div>
      </section>

      <section className="machines" aria-labelledby="machines-title">
        <div className="wrap">
          <h2 id="machines-title" className="section-title">
            The computer you stopped using will do.
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
              Open <a href={`${AGENT_URL}/`}>the app</a>, choose <strong>Set up</strong> and write
              down the 3-word code it shows.
            </p>
          </li>
          <li>
            <h3>On the old computer</h3>
            <p>
              Run the install command the app shows. Check that the 6-digit number on the
              computer matches your phone, then tap <strong>Confirm</strong>.
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
