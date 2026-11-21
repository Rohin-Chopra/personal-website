import type { ReactNode } from "react";

type Props = {
  index: string;
  title: string;
  id?: string;
  description?: ReactNode;
  action?: ReactNode;
};

/**
 * Section opener styled like a drawing's title block: a heavy rule, the
 * sheet number and name, then the headline in display type.
 */
export const SectionHeading = ({
  index,
  title,
  id,
  description,
  action,
}: Props) => (
  <div className="mb-12 sm:mb-16">
    <div className="flex items-center justify-between gap-4 border-t-2 border-ink pt-3">
      <p className="label flex gap-4 text-muted">
        <span className="text-accent">§ {index}</span>
        <span>{title}</span>
      </p>
      {action}
    </div>
    <h2
      id={id}
      className="mt-6 max-w-4xl font-display text-5xl leading-[0.95] text-balance sm:text-7xl [&_em]:font-wonk [&_em]:text-accent"
    >
      {description}
    </h2>
  </div>
);
