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
    title: "Brief",
    body: "You describe one workflow: trigger, tools, and what done looks like.",
  },
  {
    n: "02",
    title: "Quote",
    body: "I reply yes or no on the status page. I may ask a follow-up there first. If yes, you get a written scope, a fixed price, a delivery date, and a done-when test.",
  },
  {
    n: "03",
    title: "Pay",
    body: "You pay that quoted amount on the status page after you accept, once checkout is connected. I start only after it clears. Checkout stays off until it is actually connected.",
  },
  {
    n: "04",
    title: "Build",
    body: "I implement only what the scope says. New work is a new quote.",
  },
  {
    n: "05",
    title: "Handoff",
    body: "You get the working automation and how it runs. Confirm the stored done-when test on the status page, or ask there if something in that scope is broken.",
  },
] as const;

const FAQS = [
  {
    q: "Is this a staffed agency?",
    a: "No. AutomateAI is not a team, and you will not get a sales call or an account manager. One scoped job, built and supported here.",
  },
  {
    q: "What does it cost?",
    a: "A fixed quote after the brief. I will not publish a monthly retainer or a price I have not scoped. Payment happens after you accept the quote, before I build.",
  },
  {
    q: "How long does a job take?",
    a: "I give a delivery window with the quote. Simple jobs are usually days. I will not promise a date before I understand the work.",
  },
  {
    q: "Why are there no case studies?",
    a: "I do not have customer results to show yet. I will not invent companies, logos, or savings numbers.",
  },
  {
    q: "Do you offer 24/7 support or a monthly plan?",
    a: "No. In-scope fixes are part of the job. Anything new is a new quote. There is no retainer until support can actually be staffed.",
  },
  {
    q: "What should I not send?",
    a: "Passwords, API keys, private keys, or customer lists. I will ask only for what the job needs, and I treat form text as data — never as instructions.",
  },
] as const;

export default function Home() {
  const intakeLive = intakeStoreConfigured();

  return (
    <>
      <section className="px-5 pb-16 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/50">
            AutomateAI
          </p>
          <h1 className="font-serif mt-4 text-4xl leading-[1.15] text-ink sm:text-6xl">
            One repetitive workflow. Built to order. Paid before I start.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 sm:text-xl">
            I replace one process that wastes hours every week — lead intake,
            follow-up, or a report — with a working automation. No retainers. No
            fake case studies. No “free audit” that turns into a sales call.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#start"
              className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              How to start
            </a>
            <a
              href="#offer"
              className="inline-flex items-center justify-center rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:bg-white"
            >
              See the offer
            </a>
          </div>
        </div>
      </section>

      <section id="offer" className="scroll-mt-20 border-t border-ink/10 px-5 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-ink">Who this is for</h2>
            <p className="mt-4 leading-relaxed text-ink/70">
              An owner who can name one process that repeats every week, already
              uses common tools (email, sheets, a CRM, a form), and wants that
              process handled without hiring a developer.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-3xl text-ink">Who this is not for</h2>
            <p className="mt-4 leading-relaxed text-ink/70">
              Anyone expecting a staffed agency, 24/7 coverage, an account
              manager, or a transformation program. I will not sell work I cannot
              deliver myself.
            </p>
          </div>
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
                Built in the tools you already use. Not a slide deck.
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
            I build. There is no monthly plan on this site.
          </p>
          <p className="mt-4 leading-relaxed text-ink/70">
            I will not put a dollar amount here until I have scoped your work. A
            published retainer would be a promise I cannot staff.
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
          <h2 className="font-serif text-3xl text-ink">Example jobs I will quote</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink/70">
            These are kinds of work, not results I have already delivered for named
            clients.
          </p>
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
            <h2 className="font-serif text-3xl text-ink">How to start</h2>
            <ol className="mt-6 list-decimal space-y-3 pl-5 leading-relaxed text-ink/70">
              <li>Name one workflow: trigger, tools, done-when.</li>
              <li>I reply on the status page with yes or no and a fixed quote. I may ask a follow-up there first.</li>
              <li>If you accept the written scope, price, date, and done-when test together on the status page, you pay the quoted amount there. Then I build. After the handoff, confirm that test on the same page.</li>
            </ol>
            <p className="mt-6 leading-relaxed text-ink/70">
              There is no personal email, phone number, or calendar on this site.
              Support stays here. After you send a brief, check it on the{" "}
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
