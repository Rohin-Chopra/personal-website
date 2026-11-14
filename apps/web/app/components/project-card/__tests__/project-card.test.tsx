import { render, screen } from "@testing-library/react";

import { ProjectCard } from "../project-card";

const project = {
  title: "Makemycareer",
  link: "https://makemycareer.rohinchopra.com",
  imgUrl: "/makemycareer.png",
  description: "A".repeat(150),
  technologies: ["React", "AWS"],
  github: "https://github.com/Rohin-Chopra/makemycareer",
};

describe("ProjectCard", () => {
  it("links the title to the live project in a new tab", () => {
    render(<ProjectCard project={project} />);

    const link = screen.getByRole("link", { name: /^makemycareer/i });
    expect(link).toHaveAttribute("href", project.link);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps a separate Code link to the repository", () => {
    render(<ProjectCard project={project} />);

    expect(screen.getByRole("link", { name: /^code/i })).toHaveAttribute(
      "href",
      project.github,
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("truncates the description and hides tech chips when compact", () => {
    render(<ProjectCard project={project} compact />);

    expect(screen.getByText(`${"A".repeat(100)}...`)).toBeInTheDocument();
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });
});
