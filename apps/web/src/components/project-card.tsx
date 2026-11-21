import { ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import type { Project } from "@/lib/types";

type Props = {
  project: Project;
  /** Figure number shown in the caption, e.g. "2.1". */
  figure: string;
  /** Hide the tech list (used on the home page). */
  compact?: boolean;
};

/**
 * A project as a figure plate. The whole card links to the live project
 * (stretched link on the title); the Code link sits above it so it stays
 * separately clickable.
 */
export const ProjectCard = ({ project, figure, compact = false }: Props) => (
  <article className="group relative flex flex-col focus-within:outline-2 focus-within:outline-offset-8 focus-within:outline-accent">
    <div className="plate border border-line bg-surface p-2.5">
      <div className="aspect-[16/10] overflow-hidden bg-code">
        <img
          src={project.imgUrl}
          alt=""
          width={1200}
          height={675}
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-top grayscale-[0.35] transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
        />
      </div>
    </div>
    <p className="label mt-4 flex justify-between text-muted">
      <span>
        <span className="text-accent">Fig. {figure}</span>
      </span>
      {project.link.replace(/^https?:\/\/(www\.)?/, "")}
    </p>
    <h3 className="mt-2 flex items-start justify-between gap-3 font-display text-3xl leading-tight">
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
        className="mt-2 size-6 shrink-0 text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        strokeWidth={1.5}
      />
    </h3>
    <p className="mt-2 leading-relaxed text-muted">{project.description}</p>
    <div className="mt-auto flex items-end justify-between gap-4 pt-5">
      {!compact ? (
        <p className="font-mono text-xs leading-5 text-muted">
          <span className="sr-only">Built with: </span>
          {project.technologies.join(" / ")}
        </p>
      ) : (
        <span />
      )}
      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="label relative z-10 inline-flex shrink-0 items-center gap-1.5 text-muted transition-colors hover:text-accent"
        >
          <FaGithub aria-hidden className="size-3.5" />
          Source
          <span className="sr-only">
            {" "}
            for {project.title} (opens in a new tab)
          </span>
        </a>
      )}
    </div>
  </article>
);
