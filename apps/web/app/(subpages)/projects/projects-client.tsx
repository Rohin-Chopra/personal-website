"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { MdSearch } from "react-icons/md";

import { Breadcrumbs } from "@/components/breadcrumbs";

// Define the Project type
interface Project {
  link: string;
  imgUrl: string;
  title: string;
  description?: string;
  technologies?: string[];
  github?: string;
}

type Props = {
  projects: Project[];
};

const ProjectsClient: React.FC<Props> = ({ projects }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  // Get all unique technologies
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((project) => {
      project.technologies?.forEach((tech) => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filter by technology
    if (selectedTech) {
      filtered = filtered.filter((project) =>
        project.technologies?.includes(selectedTech)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.technologies?.some((tech) =>
            tech.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  }, [projects, searchQuery, selectedTech]);

  return (
    <div className="min-h-screen bg-white py-16 dark:bg-dark dark:text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumbs items={[{ label: "Projects" }]} />
        <h1 className="mb-2 mt-4 text-4xl font-bold">Projects</h1>
        <p className="mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          A collection of projects I&apos;ve built in my spare time, showcasing
          my skills in web development, UI/UX design, and problem-solving.
        </p>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-darkGray dark:text-white"
            />
          </div>

          {/* Technology Filters */}
          {allTechnologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTech(null)}
                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                  selectedTech === null
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {allTechnologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setSelectedTech(tech)}
                  className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                    selectedTech === tech
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          )}

          {/* Results count */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "project" : "projects"} found
          </p>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No projects found. Try adjusting your search or filters.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project: Project) => (
              <div
                key={project.title}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-darkGray"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={project.imgUrl}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold">{project.title}</h3>
                  {project.description && (
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                      {project.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies &&
                      project.technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {tech}
                        </span>
                      ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    {project.github && (
                      <a
                        href={project.github}
                        className="flex items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGithub className="mr-2" />
                        <span>Code</span>
                      </a>
                    )}
                    <a
                      href={project.link}
                      className="flex items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaExternalLinkAlt className="mr-2" />
                      <span>Live Demo</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsClient;

