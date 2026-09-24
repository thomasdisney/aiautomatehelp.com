import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StatusEmailPrefiller } from "@/app/components/status-email-prefiller";
import { StatusForm } from "@/app/components/status-form";
import { intakeBlobPath } from "@/lib/intake";
import { paymentConfigured } from "@/lib/payment";
import { statusIntroCopy } from "@/lib/site-copy";
import { sanitizeStatusEmailParam, statusSearchRedirect } from "@/lib/status";

export const metadata: Metadata = {
  title: "Check a brief",
  description: "Check a brief you already sent to AutomateAI. Support stays on this site.",
  alternates: { canonical: "/status" },
};

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{
    ref?: string | string[];
    email?: string | string[];
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const params = await searchParams;
  const stripped = statusSearchRedirect(params);
  if (stripped) redirect(stripped);
  const ref = typeof params.ref === "string" ? params.ref.trim().toLowerCase() : "";
  const initialId = intakeBlobPath(ref) ? ref : "";
  const initialEmail = sanitizeStatusEmailParam(params.email);
  const paymentConnected = paymentConfigured();

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-pretty text-4xl text-ink">Check a brief</h1>
      <p className="mt-6 leading-relaxed text-ink/70">{statusIntroCopy(paymentConnected)}</p>
      <p className="mt-4 leading-relaxed text-ink/70">
        If a brief is closed, or this reference and email do not match, send a new named-workflow
        brief on the{" "}
        <a href="/automation#start" className="font-medium text-ink underline underline-offset-2">
          automation page
        </a>
        .
      </p>
      <p className="mt-4 text-sm leading-relaxed text-ink/60">
        Optional <span className="font-mono">?email=</span> in the URL pre-fills the email field
        on this device only. It is not logged beyond the existing status lookup APIs.
      </p>
      <div className="mt-10 [&_input]:min-h-11 [&_input]:text-base [&_button]:min-h-11">
        <StatusEmailPrefiller email={initialEmail} />
        <StatusForm initialId={initialId} paymentConnected={paymentConnected} />
      </div>
    </article>
  );
}
