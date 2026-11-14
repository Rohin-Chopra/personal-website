import { getBlogHeadings } from "../getBlogHeadings";

describe("getBlogHeadings", () => {
  it("returns h2/h3 headings with rehype-slug ids", () => {
    const markdown = [
      "# Title",
      "## Introduction",
      "### What is `BacklogPerTask`?",
      "#### Too deep",
      "## [Linked](https://example.com) **heading**",
    ].join("\n");

    expect(getBlogHeadings(markdown)).toEqual([
      { id: "introduction", text: "Introduction", depth: 2 },
      {
        id: "what-is-backlogpertask",
        text: "What is BacklogPerTask?",
        depth: 3,
      },
      { id: "linked-heading", text: "Linked heading", depth: 2 },
    ]);
  });

  it("numbers duplicate headings and ignores code blocks", () => {
    const markdown = [
      "## Lambda",
      "```sh",
      "## not a heading",
      "```",
      "### Lambda",
    ].join("\n");

    expect(getBlogHeadings(markdown).map(({ id }) => id)).toEqual([
      "lambda",
      "lambda-1",
    ]);
  });
});
