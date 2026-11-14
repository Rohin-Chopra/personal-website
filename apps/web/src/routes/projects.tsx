import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { z } from "zod";

import { ProjectCard } from "@/components/project-card";
import { SearchFilter, filterItems } from "@/components/search-filter";
import projects from "@/content/projects.json";
import { seo } from "@/lib/seo";
import type { Project } from "@/lib/types";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  tech: z.string().optional().catch(undefined),
});

const technologies = [...new Set(projects.flatMap((p) => p.technologies))].sort(
  (a, b) => a.localeCompare(b),
);

export const Route = createFileRoute("/projects")({
  validateSearch: searchSchema,
  head: () =>
    seo({
      title: "Projects",
      description:
        "Websites and apps Rohin Chopra has designed, built and shipped.",
      path: "/projects",
    }),
  component: ProjectsPage,
});

const getTags = (project: Project) => project.technologies;
const getText = (project: Project) => [project.title, project.description];

function ProjectsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const hydrated = useHydrated();
  const query = hydrated ? (search.q ?? "") : "";
  const tech =
    hydrated && search.tech && technologies.includes(search.tech)
      ? search.tech
      : undefined;

  const filtered = filterItems(projects, {
    query,
    tag: tech,
    getTags,
    getText,
  });

  return (
    <div className="container-page py-16 sm:py-24">
      <header className="mb-12 max-w-3xl">
        <p className="mb-4 font-mono text-xs tracking-widest text-muted uppercase">
          Projects
        </p>
        <h1 className="font-serif text-6xl tracking-tight sm:text-7xl">
          Selected <em>work</em>.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          A collection of projects I&apos;ve built in my spare time, showcasing
          my skills in web development, UI/UX design and problem-solving.
        </p>
      </header>

      <SearchFilter
        key={hydrated ? "client" : "server"}
        label="Search projects"
        placeholder="Search projects…"
        initialQuery={query}
        onQueryChange={(q) =>
          navigate({
            search: (prev) => ({ ...prev, q: q.trim() ? q : undefined }),
            replace: true,
            resetScroll: false,
          })
        }
        tags={technologies}
        selectedTag={tech}
        onTagChange={(next) =>
          navigate({
            search: (prev) => ({ ...prev, tech: next }),
            replace: true,
            resetScroll: false,
          })
        }
        resultCount={filtered.length}
        noun={{ singular: "project", plural: "projects" }}
      />

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      ) : (
        <p className="border-y border-line py-16 text-center text-muted">
          No projects match. Try a different search or technology.
        </p>
      )}
    </div>
  );
}
