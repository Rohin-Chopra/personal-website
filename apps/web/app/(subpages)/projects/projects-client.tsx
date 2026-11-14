"use client";

import { ProjectCard } from "@/components/project-card";
import { SearchFilter, useSearchFilter } from "@/components/search-filter";
import type { Project } from "@/types";

const getTags = (project: Project) => project.technologies;
const getSearchText = (project: Project) => [
  project.title,
  project.description,
];

export const ProjectGrid = ({ projects }: { projects: Project[] }) =>
  projects.length === 0 ? (
    <p className="text-center text-gray-600 dark:text-gray-400">
      No projects found. Try adjusting your search or filters.
    </p>
  ) : (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.title} project={project} />
      ))}
    </div>
  );

export const ProjectsClient = ({ projects }: { projects: Project[] }) => {
  const { query, setQuery, tags, selectedTag, setSelectedTag, filtered } =
    useSearchFilter({
      items: projects,
      getTags,
      getSearchText,
      tagParam: "tech",
    });

  return (
    <>
      <SearchFilter
        label="Search projects"
        placeholder="Search projects..."
        query={query}
        onQueryChange={setQuery}
        tags={tags}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        resultCount={filtered.length}
        noun={{ singular: "project", plural: "projects" }}
      />
      <ProjectGrid projects={filtered} />
    </>
  );
};
