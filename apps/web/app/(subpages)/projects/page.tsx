import type { NextPage } from "next";
import Image from "next/image";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import projects from "./projects.json";

// Define the Project type
interface Project {
  link: string;
  imgUrl: string;
  title: string;
  description?: string;
  technologies?: string[];
  github?: string;
}

const ProjectsPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-white py-16 dark:bg-dark dark:text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="mb-2 text-4xl font-bold">Projects</h1>
        <p className="mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          A collection of projects I&apos;ve built in my spare time, showcasing
          my skills in web development, UI/UX design, and problem-solving.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: Project) => (
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
      </div>
    </div>
  );
};

export default ProjectsPage;
