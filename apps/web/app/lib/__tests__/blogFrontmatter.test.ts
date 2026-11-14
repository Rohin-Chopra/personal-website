import { formatBlogDate, parseBlogFrontmatter } from "../blogFrontmatter";

const valid = {
  title: "Title",
  description: "Description",
  slug: "my-post",
  createdAt: "2024-04-12",
};

describe("parseBlogFrontmatter", () => {
  it("accepts ISO date strings and YAML dates", () => {
    expect(parseBlogFrontmatter(valid, "a.mdx").createdAt).toBe("2024-04-12");
    expect(
      parseBlogFrontmatter(
        { ...valid, createdAt: new Date("2024-04-12T00:00:00Z") },
        "a.mdx",
      ).createdAt,
    ).toBe("2024-04-12");
  });

  it("defaults draft to false and normalises a single tag", () => {
    const frontmatter = parseBlogFrontmatter(
      { ...valid, tags: "AWS" },
      "a.mdx",
    );
    expect(frontmatter.draft).toBe(false);
    expect(frontmatter.tags).toEqual(["AWS"]);
  });

  it.each([
    ["a missing slug", { ...valid, slug: undefined }],
    ["a free-text date", { ...valid, createdAt: "April 12, 2024" }],
    ["an invalid slug", { ...valid, slug: "My Post" }],
    ["an impossible date", { ...valid, createdAt: "2024-02-30" }],
    ["an unknown field", { ...valid, publishedAt: "2024-04-12" }],
  ])("rejects %s", (_, data) => {
    expect(() => parseBlogFrontmatter(data, "bad.mdx")).toThrow(
      /Invalid frontmatter in bad\.mdx/,
    );
  });
});

describe("formatBlogDate", () => {
  it("formats ISO dates for display regardless of time zone", () => {
    expect(formatBlogDate("2023-08-05")).toBe("August 5, 2023");
  });
});
