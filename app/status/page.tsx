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
        After you send a brief, you get a reference. Enter that reference and the same email
        to see whether I have it, the yes/no or fixed quote, delivery date, and done-when test,
        the notes on this brief in order, and to accept the price, date, and test together,
        decline until it is paid, ask a question, or pay after you accept. There is no personal
        inbox, phone, or calendar.
      </p>
      <div className="mt-10">
        <StatusForm initialId={initialId} paymentConnected={paymentConfigured()} />
      </div>
    </article>
  );
}
