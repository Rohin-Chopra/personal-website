import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { extname, join } from "path";
import { cwd } from "process";
import { cache } from "react";

import type { Blog, BlogSummary } from "@/types";
import { parseBlogFrontmatter, toBlogDate } from "./blogFrontmatter";
import { calculateReadingTime } from "./calculateReadingTime";

export const POSTS_DIRECTORY = join(cwd(), "posts");

// Drafts are visible in `next dev` but never ship in a production build
// (pages, sitemap, RSS) unless SHOW_DRAFTS=true.
const includeDrafts = () =>
  process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "true";

const readPost = async (file: string): Promise<Blog> => {
  const source = await readFile(join(POSTS_DIRECTORY, file), "utf-8");
  const { data, content } = matter(source);
  const frontmatter = parseBlogFrontmatter(data, file);

  return {
    ...frontmatter,
    body: content,
    readingTime: calculateReadingTime(content),
  };
};

const getPosts = cache(async (): Promise<Blog[]> => {
  const files = (await readdir(POSTS_DIRECTORY)).filter((file) =>
    [".md", ".mdx"].includes(extname(file)),
  );

  // Any invalid post fails the build instead of silently disappearing.
  const posts = await Promise.all(files.map(readPost));

  const slugs = new Set<string>();
  for (const post of posts) {
    if (slugs.has(post.slug)) {
      throw new Error(`Duplicate blog slug "${post.slug}"`);
    }
    slugs.add(post.slug);
  }

  return posts
    .filter((post) => includeDrafts() || !post.draft)
    .sort(
      (a, b) =>
        toBlogDate(b.createdAt).getTime() - toBlogDate(a.createdAt).getTime(),
    );
});

/** Every published post, newest first, without the MDX body. */
export const getBlogs = cache(async (): Promise<BlogSummary[]> =>
  (await getPosts()).map(({ body: _body, ...summary }) => summary),
);

/** A single post, including its MDX body. */
export const getBlog = async (slug: string): Promise<Blog | undefined> =>
  (await getPosts()).find((post) => post.slug === slug);
