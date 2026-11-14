import type { ReactNode } from "react";

type Props = {
  index: string;
  title: string;
  id?: string;
  description?: ReactNode;
  action?: ReactNode;
};

export const SectionHeading = ({ index, title, id, description, action }: Props) => (
  <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="mb-3 font-mono text-xs tracking-widest text-muted uppercase">
        <span className="text-accent">{index}</span> / {title}
      </p>
      <h2 id={id} className="font-serif text-4xl tracking-tight text-balance sm:text-5xl">
        {description}
      </h2>
    </div>
    {action}
  </div>
);
