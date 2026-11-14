import { useEffect, useState } from "react";

import type { BlogHeading } from "@/lib/headings";

export const TableOfContents = ({ headings }: { headings: BlogHeading[] }) => {
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    // The active section is the top-most heading in the upper part of the
    // viewport, below the sticky header.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <ol className="space-y-1 border-l border-line text-sm">
      {headings.map(({ id, text, depth }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            aria-current={activeId === id ? "location" : undefined}
            className={`-ml-px block border-l py-1 leading-snug transition-colors ${
              depth === 3 ? "pl-7" : "pl-4"
            } ${
              activeId === id
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {text}
          </a>
        </li>
      ))}
    </ol>
  );
};
