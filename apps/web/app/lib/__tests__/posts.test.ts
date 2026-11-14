/**
 * @jest-environment node
 */
import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { join } from "path";

import { parseBlogFrontmatter } from "../blogFrontmatter";
import { POSTS_DIRECTORY } from "../getBlogs";

const PUBLIC_DIRECTORY = join(POSTS_DIRECTORY, "..", "public");
const STATIC_ROUTES = new Set(["/", "/blogs", "/projects", "/feed.xml"]);

const loadPosts = async () => {
  const files = (await readdir(POSTS_DIRECTORY)).filter((file) =>
    /\.mdx?$/.test(file),
  );
  return Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(
        await readFile(join(POSTS_DIRECTORY, file), "utf-8"),
      );
      return { file, frontmatter: parseBlogFrontmatter(data, file), content };
    }),
  );
};

// Markdown links/images and JSX href/src attributes pointing at local paths.
const localLinks = (content: string) =>
  [
    ...content.matchAll(/(!?)\[[^\]]*\]\((\/[^)\s]*)\)/g),
    ...content.matchAll(/\b(href|src)=["'](\/[^"']*)["']/g),
  ].map(([, kind, target]) => ({
    isImage: kind === "!" || kind === "src",
    path: new URL(target, "http://localhost").pathname,
  }));

describe("blog posts", () => {
  it("have valid frontmatter and unique slugs", async () => {
    const posts = await loadPosts();
    const slugs = posts.map((post) => post.frontmatter.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only link to routes and files that exist", async () => {
    const posts = await loadPosts();
    const published = new Set(
      posts
        .filter((post) => !post.frontmatter.draft)
        .map((post) => `/blogs/${post.frontmatter.slug}`),
    );

    const broken = posts.flatMap(({ file, content }) =>
      localLinks(content)
        .filter(({ isImage, path }) => {
          const exists = existsSync(
            join(PUBLIC_DIRECTORY, decodeURIComponent(path)),
          );
          if (isImage) return !exists;
          return !(exists || STATIC_ROUTES.has(path) || published.has(path));
        })
        .map(({ path }) => `${file}: ${path}`),
    );

    expect(broken).toEqual([]);
  });
});
