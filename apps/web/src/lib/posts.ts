import type { MDXContent } from "mdx/types";
import { postModules, posts } from "virtual:posts";

import type { Post } from "./types.ts";

export { posts };

export const getPost = (slug: string): Post | undefined =>
  posts.find((post) => post.slug === slug);

// Compiled MDX components can't go through loader data (it's serialised), so
// loaders put them here and components read them synchronously. The client
// entry fills this before hydrating a post page.
const loaded = new Map<string, MDXContent>();

export const loadPostContent = async (slug: string): Promise<MDXContent> => {
  const cached = loaded.get(slug);
  if (cached) return cached;
  const load = postModules[slug];
  if (!load) throw new Error(`Unknown post "${slug}"`);
  const { default: Content } = await load();
  loaded.set(slug, Content);
  return Content;
};

export const getLoadedPostContent = (slug: string): MDXContent => {
  const Content = loaded.get(slug);
  if (!Content) throw new Error(`Post "${slug}" was rendered before it loaded`);
  return Content;
};

/** All tags across posts, sorted. */
export const postTags = [...new Set(posts.flatMap((post) => post.tags))].sort(
  (a, b) => a.localeCompare(b),
);
