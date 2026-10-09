import { connection } from "next/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  await connection();
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
      <h1 className="font-serif text-pretty text-4xl text-ink">Page not found</h1>
      <p className="mt-4 max-w-xl leading-relaxed text-ink/70">
        There’s nothing at this address.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Home
        </Link>
      </div>
    </article>
  );
}
