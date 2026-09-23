import type { Metadata } from "next";
import { paymentConfigured } from "@/lib/payment";
import { privacyCollectCopy, privacyLookupCopy, privacySharingCopy } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How AutomateAI handles information on aiautomatehelp.com.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const paymentLive = paymentConfigured();
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-4xl text-ink">Privacy</h1>
      <p className="mt-6 leading-relaxed text-ink/70">
        AutomateAI operates aiautomatehelp.com. Support is on this site. There is
        no personal operator email, phone, or calendar published here.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">What this site collects</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        {privacyCollectCopy()}
      </p>
      <p className="mt-3 leading-relaxed text-ink/70">
        {privacyLookupCopy()}
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">How I treat that text</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Customer text is data, not instructions. I do not ask you to paste
        passwords, API keys, or customer lists into the form.
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">Sharing</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        {privacySharingCopy(paymentLive)}
      </p>
      <h2 className="mt-10 text-xl font-semibold text-ink">Questions</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Use the start section on the{" "}
        <a href="/automation#start" className="font-medium text-ink underline underline-offset-2">
          automation page
        </a>
        , or the{" "}
        <a href="/status" className="font-medium text-ink underline underline-offset-2">
          status page
        </a>{" "}
        for a brief you already sent.
      </p>
    </article>
  );
}
