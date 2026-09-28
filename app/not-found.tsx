import { connection } from "next/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  await connection();
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/50">404</p>
      <h1 className="font-serif mt-4 text-pretty text-4xl text-ink">Page not found</h1>
      <p className="mt-4 max-w-xl leading-relaxed text-ink/70">
        That URL is not on this site. Head home to connect your agent.
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
