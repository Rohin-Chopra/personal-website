import { Suspense } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";

import projects from "./projects.json";
import { ProjectGrid, ProjectsClient } from "./projects-client";

const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-white py-16 dark:bg-dark dark:text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumbs items={[{ label: "Projects" }]} />
        <h1 className="mt-4 mb-2 text-4xl font-bold">Projects</h1>
        <p className="mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          A collection of projects I&apos;ve built in my spare time, showcasing
          my skills in web development, UI/UX design, and problem-solving.
        </p>
        {/* useSearchParams opts out of prerendering, so the static HTML gets the full grid. */}
        <Suspense fallback={<ProjectGrid projects={projects} />}>
          <ProjectsClient projects={projects} />
        </Suspense>
      </div>
    </div>
  );
};

export default ProjectsPage;
