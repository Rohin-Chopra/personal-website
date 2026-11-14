import { Link } from "@tanstack/react-router";

export const NotFound = () => (
  <section className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
    <p className="font-mono text-xs tracking-widest text-accent uppercase">Error 404</p>
    <h1 className="mt-4 font-serif text-6xl tracking-tight sm:text-7xl">
      This page doesn&apos;t <em>exist</em>.
    </h1>
    <p className="mt-4 max-w-md text-lg text-muted">
      The link may be broken or the page may have moved.
    </p>
    <div className="mt-10 flex flex-wrap gap-3">
      <Link
        to="/"
        className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent hover:text-accent-ink"
      >
        Back home
      </Link>
      <Link
        to="/blogs"
        className="rounded-full border border-line px-6 py-3 font-medium transition-colors hover:border-ink/30"
      >
        Read the blog
      </Link>
    </div>
  </section>
);
