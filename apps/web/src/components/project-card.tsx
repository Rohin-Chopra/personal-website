import { ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import type { Project } from "@/lib/types";

type Props = {
  project: Project;
  /** Hide the tech chips (used on the home page). */
  compact?: boolean;
};

/**
 * The whole card links to the live project (stretched link on the title);
 * the Code link sits above it so it stays separately clickable.
 */
export const ProjectCard = ({ project, compact = false }: Props) => (
  <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 focus-within:ring-2 focus-within:ring-accent hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_18px_40px_-24px_color-mix(in_oklch,var(--accent)_60%,transparent)]">
    <div className="aspect-[16/9] overflow-hidden border-b border-line bg-code">
      <img
        src={project.imgUrl}
        alt=""
        width={1200}
        height={675}
        loading="lazy"
        decoding="async"
        className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>
    <div className="flex flex-1 flex-col p-5">
      <h3 className="flex items-start justify-between gap-3 text-lg font-semibold tracking-tight">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {project.title}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <ArrowUpRight
          aria-hidden
          className="mt-0.5 size-5 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        />
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>
      <div className="mt-auto flex items-end justify-between gap-4 pt-5">
        {!compact ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.technologies.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : (
          <span />
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex shrink-0 items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            <FaGithub aria-hidden className="size-4" />
            Code
            <span className="sr-only"> for {project.title} (opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  </article>
);
