import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center dark:text-white">
      <p className="text-6xl font-bold text-primary md:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold md:text-4xl">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
        The link may be broken or the page may have moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-sm bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90"
        >
          Back home
        </Link>
        <Link
          href="/blogs"
          className="rounded-sm border border-primary px-6 py-3 font-medium hover:bg-primary/10"
        >
          Read the blog
        </Link>
      </div>
    </main>
  );
}
