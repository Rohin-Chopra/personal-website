"use client";

import { useEffect, useState } from "react";

import type { BlogHeading } from "@/lib/getBlogHeadings";
import { cn } from "@/lib/utils";

type Props = {
  headings: BlogHeading[];
};

export const TableOfContents = ({ headings }: Props) => {
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    // The active section is the top-most heading in the upper part of the
    // viewport, below the fixed navbar.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-112px 0px -60% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <ol className="space-y-2 border-l border-slate-200 text-sm dark:border-slate-700">
      {headings.map(({ id, text, depth }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            aria-current={activeId === id ? "location" : undefined}
            className={cn(
              "-ml-px block border-l-2 py-0.5 transition-colors",
              depth === 3 ? "pl-6" : "pl-3",
              activeId === id
                ? "border-primary font-medium text-primary dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            {text}
          </a>
        </li>
      ))}
    </ol>
  );
};
