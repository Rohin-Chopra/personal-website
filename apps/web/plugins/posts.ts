// Reads posts/*.mdx at build time. Shared by the Vite content plugin and the
// Node postbuild script, so it only uses relative `.ts` imports.
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

import matter from "gray-matter";

import { getBlogHeadings } from "../src/lib/headings.ts";
import { parseBlogFrontmatter, toBlogDate } from "../src/lib/post-schema.ts";
import { calculateReadingTime } from "../src/lib/reading-time.ts";
import type { Post } from "../src/lib/types.ts";

export type PostRecord = Post & {
  /** Absolute path of the source file. */
  file: string;
  body: string;
};

/**
 * Every post, newest first. Invalid frontmatter or duplicate slugs throw, so
 * a bad post fails the build instead of silently disappearing.
 */
export const loadPosts = async (
  postsDirectory: string,
  { includeDrafts }: { includeDrafts: boolean },
): Promise<PostRecord[]> => {
  const files = (await readdir(postsDirectory)).filter((file) =>
    [".md", ".mdx"].includes(extname(file)),
  );

  const posts = await Promise.all(
    files.map(async (name): Promise<PostRecord> => {
      const file = join(postsDirectory, name);
      const { data, content } = matter(await readFile(file, "utf8"));
      const frontmatter = parseBlogFrontmatter(data, name);
      return {
        ...frontmatter,
        file,
        body: content,
        readingTime: calculateReadingTime(content),
        headings: getBlogHeadings(content),
      };
    }),
  );

  const slugs = new Set<string>();
  for (const post of posts) {
    if (slugs.has(post.slug)) {
      throw new Error(`Duplicate blog slug "${post.slug}"`);
    }
    slugs.add(post.slug);
  }

  return posts
    .filter((post) => includeDrafts || !post.draft)
    .sort(
      (a, b) =>
        toBlogDate(b.createdAt).getTime() - toBlogDate(a.createdAt).getTime() ||
        a.slug.localeCompare(b.slug),
    );
};
