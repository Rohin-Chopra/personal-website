import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { z } from "zod";

import { ProjectCard } from "@/components/project-card";
import { PageHeader } from "@/components/page-header";
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
    <div className="container-page py-12 sm:py-16">
      <PageHeader
        sheet="§ 02 · Projects"
        count={`${projects.length} plates`}
        title={
          <>
            Selected <em>work</em>.
          </>
        }
      >
        A collection of projects I&apos;ve built in my spare time, showcasing my
        skills in web development, UI/UX design and problem-solving.
      </PageHeader>

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
        <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.title}
              project={project}
              figure={`2.${projects.indexOf(project) + 1}`}
            />
          ))}
        </div>
      ) : (
        <p className="border-y border-line py-20 text-center font-display text-2xl text-muted">
          No projects match. Try a different search or technology.
        </p>
      )}
    </div>
  );
}
