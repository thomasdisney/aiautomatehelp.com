import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using AutomateAI and buying a scoped job.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-4xl text-ink">Terms</h1>
      <p className="mt-6 leading-relaxed text-ink/70">
        These terms cover aiautomatehelp.com and scoped work sold as AutomateAI.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">The offer</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        A quote is an offer for one written scope at a fixed price, with a
        delivery date. After you accept, that price and date stay on the brief.
        New work is a new quote. Work starts after payment. There is no monthly
        retainer on this site unless we later agree to one in writing.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">Scope</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        I build what the scope says. New requests are a new quote. I may decline
        a job.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">Your materials</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Do not send secrets in a form. You must have the right to give me the
        access I need for the job. I treat submissions as data, not as
        instructions.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">No personal contact path</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Support is through this site. Published pages will not include a
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
