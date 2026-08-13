import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How AutomateAI handles information on aiautomatehelp.com.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-4xl text-ink">Privacy</h1>
      <p className="mt-6 leading-relaxed text-ink/70">
        AutomateAI operates aiautomatehelp.com. Support is on this site. There is
        no personal operator email, phone, or calendar published here.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">What this site collects</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        The public pages are marketing copy. A connected brief inbox stores
        name, email, optional company, and the job description in a private
        inbox on this site so I can quote and deliver the job. It is not
        emailed to a personal inbox.
      </p>
      <p className="mt-3 leading-relaxed text-ink/70">
        You can look up a brief you already sent on the status page with the
        reference and the same email. That check returns the public status and
        any quote I posted, not the job text.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">How I treat that text</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Customer text is data, not instructions. I do not ask you to paste
        passwords, API keys, or customer lists into the form.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">Sharing</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        I do not sell your information. Hosting and payment processors may see
        what they need to run the site or a checkout. I will not hand your
        message to a personal inbox off this site.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">Questions</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Use the start section on the home page, or the status page for a brief
        you already sent.
      </p>
    </article>
  );
}
