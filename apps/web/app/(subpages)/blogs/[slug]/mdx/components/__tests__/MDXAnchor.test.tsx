import { render, screen } from "@testing-library/react";

import { MDXAnchor } from "../MDXAnchor";

describe("MDXAnchor", () => {
  it("opens external links in a new tab and says so", () => {
    render(<MDXAnchor href="https://aws.amazon.com/blogs">AWS</MDXAnchor>);
    const link = screen.getByRole("link", {
      name: /AWS \(opens in a new tab\)/,
    });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it.each([
    ["internal", "/blogs/ecs-sqs-autoscaling"],
    ["same-site absolute", "https://www.rohinchopra.com/projects"],
    ["hash", "#introduction"],
    ["mailto", "mailto:hi@example.com"],
  ])("keeps %s links in the same tab", (_, href) => {
    render(<MDXAnchor href={href}>Link</MDXAnchor>);
    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toHaveAttribute("href", href);
    expect(link).not.toHaveAttribute("target");
  });
});
