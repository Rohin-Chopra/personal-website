import type { ReactNode } from "react";

/** Opener for the index pages: sheet label, display headline, standfirst. */
export const PageHeader = ({
  sheet,
  title,
  children,
  count,
}: {
  sheet: string;
  title: ReactNode;
  children: ReactNode;
  count: string;
}) => (
  <header className="mb-14 sm:mb-20">
    <div className="label flex items-center justify-between gap-4 border-t-2 border-ink pt-3 text-muted">
      <span>
        <span className="text-accent">{sheet}</span>
      </span>
      <span>{count}</span>
    </div>
    <h1 className="mt-8 font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.88] [&_em]:font-wonk [&_em]:text-accent">
      {title}
    </h1>
    <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
      {children}
    </p>
  </header>
);
