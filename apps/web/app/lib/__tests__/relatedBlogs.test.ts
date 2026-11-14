import type { BlogSummary } from "@/types";
import { getAdjacentBlogs, getRelatedBlogs } from "../relatedBlogs";

const blog = (slug: string, tags?: string[]): BlogSummary => ({
  slug,
  title: slug,
  description: "",
  createdAt: "2024-01-01",
  tags,
});

// Newest first, like getBlogs().
const blogs = [
  blog("newest", ["AWS"]),
  blog("middle", ["AWS", "Terraform"]),
  blog("oldest", ["Terraform", "ECS"]),
  blog("unrelated", ["React"]),
];

describe("getAdjacentBlogs", () => {
  it("returns the older post as previous and the newer post as next", () => {
    expect(getAdjacentBlogs(blogs, "middle")).toEqual({
      previous: blogs[2],
      next: blogs[0],
    });
  });

  it("has no next post for the newest post", () => {
    expect(getAdjacentBlogs(blogs, "newest").next).toBeUndefined();
  });
});

describe("getRelatedBlogs", () => {
  it("ranks by shared tags, then recency, excluding the post itself", () => {
    expect(
      getRelatedBlogs(blogs, blog("x", ["aws", "terraform"])).map(
        (b) => b.slug,
      ),
    ).toEqual(["middle", "newest", "oldest"]);
  });

  it("returns nothing for posts without tags", () => {
    expect(getRelatedBlogs(blogs, blog("x"))).toEqual([]);
  });
});
