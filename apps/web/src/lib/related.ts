import type { PostSummary } from "./types.ts";

/** `blogs` is newest first, so "previous" is the older post. */
export const getAdjacentBlogs = (blogs: PostSummary[], slug: string) => {
  const index = blogs.findIndex((blog) => blog.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };

  return {
    previous: blogs[index + 1],
    next: index > 0 ? blogs[index - 1] : undefined,
  };
};

/** Up to `limit` other posts, ranked by shared tags then recency. */
export const getRelatedBlogs = (
  blogs: PostSummary[],
  blog: PostSummary,
  limit = 3,
): PostSummary[] => {
  const tags = new Set(blog.tags.map((tag) => tag.toLowerCase()));
  if (tags.size === 0) return [];

  return blogs
    .filter((other) => other.slug !== blog.slug)
    .map((other, index) => ({
      other,
      index,
      shared: other.tags.filter((tag) => tags.has(tag.toLowerCase())).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || a.index - b.index)
    .slice(0, limit)
    .map(({ other }) => other);
};
