import type { Metadata } from "next";
import { StatusForm } from "@/app/components/status-form";
import { intakeBlobPath } from "@/lib/intake";
import { paymentConfigured } from "@/lib/payment";
import { statusIntroCopy } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Status",
  description: "Check a brief you already sent to AutomateAI. Support stays on this site.",
  alternates: { canonical: "/status" },
};

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref.trim().toLowerCase() : "";
  const initialId = intakeBlobPath(ref) ? ref : "";
  const paymentConnected = paymentConfigured();

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-pretty text-4xl text-ink">Check a brief</h1>
      <p className="mt-6 leading-relaxed text-ink/70">
        {statusIntroCopy(paymentConnected)}
      </p>
      <p className="mt-4 leading-relaxed text-ink/70">
        If a brief is closed, or this reference and email do not match, send a
        new named-workflow brief on the{" "}
        <a href="/automation#start" className="font-medium text-ink underline underline-offset-2">
          automation page
        </a>
        .
      </p>
      <div className="mt-10">
        <StatusForm initialId={initialId} paymentConnected={paymentConnected} />
      </div>
    </article>
  );
}
