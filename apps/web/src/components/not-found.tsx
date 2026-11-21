import { Link } from "@tanstack/react-router";

export const NotFound = () => (
  <section className="container-page py-16 sm:py-24">
    <div className="label flex justify-between border-t-2 border-ink pt-3 text-muted">
      <span className="text-accent">Error 404</span>
      <span>Sheet missing</span>
    </div>
    <div className="grid items-end gap-10 py-12 lg:grid-cols-[auto_1fr] lg:gap-16">
      <p
        aria-hidden
        className="font-display text-[clamp(8rem,28vw,20rem)] leading-[0.8] text-muted/25 select-none"
      >
        4<span className="font-wonk text-accent">0</span>4
      </p>
      <div>
        <h1 className="font-display text-5xl leading-[0.95] sm:text-7xl">
          This page doesn&apos;t{" "}
          <em className="font-wonk text-accent">exist</em>.
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted">
          The link may be broken or the page may have moved.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/"
            className="bg-ink px-6 py-3.5 font-medium text-paper transition-colors hover:bg-accent hover:text-accent-ink"
          >
            Back home
          </Link>
          <Link
            to="/blogs"
            className="border border-ink px-6 py-3.5 font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Read the blog
          </Link>
        </div>
      </div>
    </div>
  </section>
);
