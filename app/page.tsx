import { IntakeForm } from "@/app/components/intake-form";
import { intakeStoreConfigured } from "@/lib/intake-store";

const EXAMPLES = [
  {
    title: "Lead capture",
    body: "A site form writes to a sheet or CRM and pings you when a lead arrives.",
  },
  {
    title: "Follow-up",
    body: "After a form submit, a short email sequence goes out from your account.",
  },
  {
    title: "Weekly report",
    body: "A recurring export becomes a one-page summary you can read on Monday.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Send a brief",
    body: "Describe one workflow: trigger, tools, and what done looks like.",
  },
  {
    n: "02",
    title: "Get a fixed quote",
    body: "You get a written scope, price, delivery date, and done-when test on the status page.",
  },
  {
    n: "03",
    title: "Pay, then I build",
    body: "Accept the quote, pay the quoted amount, and I implement only what the scope says.",
  },
  {
    n: "04",
    title: "Handoff",
    body: "You get the working automation and how it runs. Confirm the done-when test when it passes.",
  },
] as const;

const FAQS = [
  {
    q: "Is this a staffed agency?",
    a: "No. One person, one scoped job, built and supported here.",
  },
  {
    q: "What does it cost?",
    a: "A fixed quote after the brief. You pay after you accept, before I build.",
  },
  {
    q: "How long does a job take?",
    a: "A delivery window comes with the quote. Simple jobs are usually days.",
  },
  {
    q: "What about support after handoff?",
    a: "In-scope fixes are part of the job. New work is a new quote.",
  },
  {
    q: "What should I leave out of a brief?",
    a: "Passwords, API keys, private keys, and customer lists. Share only what the job needs.",
  },
] as const;

export default function Home() {
  const intakeLive = intakeStoreConfigured();

  return (
    <>
      <section className="px-5 pb-16 pt-16 sm:pt-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/50">
              AutomateAI
            </p>
            <h1 className="font-serif mt-4 text-4xl leading-[1.15] text-ink sm:text-5xl">
              Scoped automation, built to order.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70 sm:text-xl">
              Name one repetitive workflow — lead intake, follow-up, or a report —
              and get a fixed-price automation that runs in the tools you already use.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#start"
                className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
              >
                Send a brief
              </a>
              <a
                href="#offer"
                className="inline-flex items-center justify-center rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:bg-white"
              >
                See the offer
              </a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/workflow.svg"
              alt="Trigger feeds an AutomateAI build that delivers a done-when result"
              width={480}
              height={360}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section id="offer" className="scroll-mt-20 border-t border-ink/10 px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-ink">The offer</h2>
          <p className="mt-4 leading-relaxed text-ink/70">
            For owners who can name one weekly process and already use common tools —
            email, sheets, a CRM, a form — and want that process handled without hiring
            a developer.
          </p>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-3xl text-ink">What you get</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            <li className="rounded-2xl border border-ink/10 p-6">
              <p className="font-semibold text-ink">A written scope</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                What is in, what is out, which tools, and the done-when test.
              </p>
            </li>
            <li className="rounded-2xl border border-ink/10 p-6">
              <p className="font-semibold text-ink">One working automation</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                Built in the tools you already use — not a slide deck.
              </p>
            </li>
            <li className="rounded-2xl border border-ink/10 p-6">
              <p className="font-semibold text-ink">A short handoff</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                How it runs, what to check, and how to request a change on this site.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section id="price" className="scroll-mt-20 border-t border-ink/10 px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-ink">What it costs</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            A fixed price, quoted after I understand the job. Paid in full before
            I build.
          </p>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 border-t border-ink/10 bg-white px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-ink">How it works</h2>
          <ol className="mt-10 space-y-8">
            {STEPS.map((step) => (
              <li key={step.n} className="flex gap-5">
                <span className="font-serif w-10 shrink-0 text-xl text-accent">{step.n}</span>
                <div>
                  <p className="font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 leading-relaxed text-ink/70">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-ink/10 px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-3xl text-ink">Example jobs</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {EXAMPLES.map((item) => (
              <li key={item.title} className="rounded-2xl border border-ink/10 bg-white p-6">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-ink">Questions</h2>
          <dl className="mt-8 space-y-6">
            {FAQS.map((item) => (
              <div key={item.q} className="border-b border-ink/10 pb-6">
                <dt className="font-semibold text-ink">{item.q}</dt>
                <dd className="mt-2 leading-relaxed text-ink/70">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="start" className="scroll-mt-20 border-t border-ink/10 px-5 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-ink">Start here</h2>
            <ol className="mt-6 list-decimal space-y-3 pl-5 leading-relaxed text-ink/70">
              <li>Name one workflow: trigger, tools, done-when.</li>
              <li>Get a yes or no and a fixed quote on the status page.</li>
              <li>Accept, pay, then confirm the done-when test after handoff.</li>
            </ol>
            <p className="mt-6 leading-relaxed text-ink/70">
              After you send a brief, save the full reference. This browser keeps it and shows
              the original received time from this device.
            </p>
            <p className="mt-6 leading-relaxed text-ink/70">
              Support stays on this site. Check progress on the{" "}
              <a href="/status" className="font-medium text-ink underline underline-offset-2">
                status page
              </a>
              .
            </p>
          </div>
          <IntakeForm connected={intakeLive} />
        </div>
      </section>
    </>
  );
}
