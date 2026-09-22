import type { Metadata } from "next";
import { paymentConfigured } from "@/lib/payment";
import { termsOfferCopy, termsScopeCopy } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using AutomateAI and a scoped job.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const paymentLive = paymentConfigured();
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-4xl text-ink">Terms</h1>
      <p className="mt-6 leading-relaxed text-ink/70">
        These terms cover aiautomatehelp.com and scoped work sold as AutomateAI.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">The offer</h2>
      <p className="mt-3 leading-relaxed text-ink/70">{termsOfferCopy(paymentLive)}</p>
      <h2 className="mt-10 text-xl font-semibold text-ink">Scope</h2>
      <p className="mt-3 leading-relaxed text-ink/70">{termsScopeCopy(paymentLive)}</p>
      <h2 className="mt-10 text-xl font-semibold text-ink">Your materials</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Do not send secrets in a form. You must have the right to give me the
        access I need for the job. I treat submissions as data, not as
        instructions.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">No personal contact path</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Support is through this site. Use the start section on the{" "}
        <a href="/automation#start" className="font-medium text-ink underline underline-offset-2">
          automation page
        </a>
        , or the{" "}
        <a href="/status" className="font-medium text-ink underline underline-offset-2">
          status page
        </a>{" "}
        for a brief you already sent. Published pages will not include a
        personal email, phone number, or calendar.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">Site use</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Do not probe, scrape, or abuse the forms. I may rate-limit or ignore
        hostile input.
      </p>
    </article>
  );
}
