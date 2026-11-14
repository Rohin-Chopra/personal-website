import Image from "next/image";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";

import type { Project } from "@/types";

type Props = {
  project: Project;
  /** Smaller card with a truncated description and no tech chips. */
  compact?: boolean;
};

const DESCRIPTION_LIMIT = 100;

/**
 * The whole card links to the live project (stretched link on the title);
 * the Code link sits above it so it stays separately clickable.
 */
export const ProjectCard = ({ project, compact = false }: Props) => {
  const description =
    compact &&
    project.description &&
    project.description.length > DESCRIPTION_LIMIT
      ? `${project.description.substring(0, DESCRIPTION_LIMIT)}...`
      : project.description;

  return (
    <article className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-primary hover:shadow-lg dark:border-gray-700 dark:bg-darkGray">
      <div
        className={`relative w-full overflow-hidden ${compact ? "h-40" : "h-48"}`}
      >
        <Image
          src={project.imgUrl}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className={compact ? "p-4" : "p-6"}>
        <h3 className={`mb-2 font-bold ${compact ? "text-lg" : "text-xl"}`}>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group-hover:text-primary after:absolute after:inset-0 focus-visible:outline-hidden"
          >
            {project.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h3>
        {description && (
          <p
            className={`text-gray-600 dark:text-gray-300 ${compact ? "mb-3 text-sm" : "mb-4"}`}
          >
            {description}
          </p>
        )}
        {!compact && project.technologies && (
          <ul className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <li
                key={tech}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between text-sm">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 flex items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
            >
              <FaGithub aria-hidden className="mr-2" />
              Code
              <span className="sr-only">
                {" "}
                for {project.title} (opens in a new tab)
              </span>
            </a>
          )}
          <span
            aria-hidden
            className="ml-auto flex items-center text-gray-600 group-hover:text-primary dark:text-gray-300"
          >
            <FaExternalLinkAlt className="mr-2" />
            Live Demo
          </span>
        </div>
      </div>
    </article>
  );
};
