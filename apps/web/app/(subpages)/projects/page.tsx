import projects from "./projects.json";
import ProjectsClient from "./projects-client";

const ProjectsPage = () => {
  return <ProjectsClient projects={projects} />;
};

export default ProjectsPage;
