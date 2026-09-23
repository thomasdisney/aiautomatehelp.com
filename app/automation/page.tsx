import type { Metadata } from "next";
import { IntakeForm } from "@/app/components/intake-form";
import { intakeStoreConfigured } from "@/lib/intake-store";
import { paymentConfigured } from "@/lib/payment";
import {
  acceptBuildStepCopy,
  automationHeroCopy,
  briefSecretsFaqCopy,
  costsCopy,
  durationFaqCopy,
  exampleWorkflowsHeadingCopy,
  handoffStepCopy,
  jsonLdDescription,
  noOutboundEmailCopy,
  offerCopy,
  priceFaqCopy,
  quoteStepCopy,
  sendBriefStepCopy,
  shortHandoffCopy,
  startHereAcceptCopy,
  startHereNameCopy,
  staffedAgencyFaqCopy,
  supportAfterHandoffFaqCopy,
  workingAutomationCopy,
  writtenScopeCopy,
} from "@/lib/site-copy";

export const metadata: Metadata = {
  alternates: { canonical: "/automation" },
};

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

export default function AutomationPage() {
  const intakeLive = intakeStoreConfigured();
  const paymentLive = paymentConfigured();

  const steps = [
    { n: "01", title: "Send a brief", body: sendBriefStepCopy() },
    { n: "02", title: "Get a fixed quote", body: quoteStepCopy() },
    {
      n: "03",
      title: paymentLive ? "Pay, then I build" : "Accept, then I build",
      body: acceptBuildStepCopy(paymentLive),
    },
    { n: "04", title: "Handoff", body: handoffStepCopy() },
  ];

  const faqs = [
    { q: "Is this a staffed agency?", a: staffedAgencyFaqCopy() },
    { q: "What does it cost?", a: priceFaqCopy(paymentLive) },
    { q: "How long does a named workflow take?", a: durationFaqCopy() },
    { q: "What about support after handoff?", a: supportAfterHandoffFaqCopy() },
    { q: "What should I leave out of a brief?", a: briefSecretsFaqCopy() },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "AutomateAI",
    url: "https://www.aiautomatehelp.com/automation",
    description: jsonLdDescription(paymentLive),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="px-5 pb-16 pt-16 sm:pt-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/50">
              AutomateAI
            </p>
            <h1 className="font-serif mt-4 text-pretty text-4xl leading-[1.15] text-ink sm:text-5xl">
              Scoped automation, built to order.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70 sm:text-xl">
              {automationHeroCopy()}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#start"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
              >
                Send a brief
              </a>
              <a
                href="#offer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:bg-white"
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
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section id="offer" className="scroll-mt-20 border-t border-ink/10 px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-ink">The offer</h2>
          <p className="mt-4 leading-relaxed text-ink/70">{offerCopy()}</p>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-3xl text-ink">What you get</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            <li className="rounded-2xl border border-ink/10 p-6">
              <p className="font-semibold text-ink">A written scope</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{writtenScopeCopy()}</p>
            </li>
            <li className="rounded-2xl border border-ink/10 p-6">
              <p className="font-semibold text-ink">One working automation</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{workingAutomationCopy()}</p>
            </li>
            <li className="rounded-2xl border border-ink/10 p-6">
              <p className="font-semibold text-ink">A short handoff</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{shortHandoffCopy()}</p>
            </li>
          </ul>
        </div>
      </section>

      <section id="price" className="scroll-mt-20 border-t border-ink/10 px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-ink">What it costs</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">{costsCopy(paymentLive)}</p>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 border-t border-ink/10 bg-white px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-ink">How it works</h2>
          <ol className="mt-10 space-y-8">
            {steps.map((step) => (
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
          <h2 className="font-serif text-3xl text-ink">{exampleWorkflowsHeadingCopy()}</h2>
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
          <div className="mt-8 space-y-3">
            {faqs.map((item, index) => (
              <details
                key={item.q}
                className="group border-b border-ink/10 pb-3"
                open={index === 0 ? true : undefined}
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 font-semibold text-ink outline-none marker:content-none focus-visible:ring-2 focus-visible:ring-accent/40 [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-ink/40 transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-3 leading-relaxed text-ink/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="start" className="scroll-mt-20 border-t border-ink/10 px-5 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-ink">Start here</h2>
            <ol className="mt-6 list-decimal space-y-3 pl-5 leading-relaxed text-ink/70">
              <li>{startHereNameCopy()}</li>
              <li>Get a yes or no and a fixed quote on the status page.</li>
              <li>{startHereAcceptCopy(paymentLive)}</li>
            </ol>
            <p className="mt-6 leading-relaxed text-ink/70">
              After you send a brief, save the full reference. {noOutboundEmailCopy()} This
              browser keeps it and shows the original received time from this device.
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
