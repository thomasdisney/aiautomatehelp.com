import type { Metadata } from "next";
import { StatusForm } from "@/app/components/status-form";
import { intakeBlobPath } from "@/lib/intake";
import { paymentConfigured } from "@/lib/payment";

export const metadata: Metadata = {
  title: "Status",
  description: "Check a brief you already sent to AutomateAI. Support stays on this site.",
};

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref.trim().toLowerCase() : "";
  const initialId = intakeBlobPath(ref) ? ref : "";

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-4xl text-ink">Check a brief</h1>
      <p className="mt-6 leading-relaxed text-ink/70">
        Enter the reference from your confirmation and the same email. You can see the
        quote, accept or decline, pay after you accept, ask a question, or confirm the
        done-when test after handoff. This browser keeps the reference and shows the
        original received time from this device.
      </p>
      <div className="mt-10">
        <StatusForm initialId={initialId} paymentConnected={paymentConfigured()} />
      </div>
    </article>
  );
}
