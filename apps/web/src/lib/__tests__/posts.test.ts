// @vitest-environment node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadPosts } from "../../../plugins/posts.ts";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const POSTS_DIRECTORY = join(ROOT, "posts");
const PUBLIC_DIRECTORY = join(ROOT, "public");
const STATIC_ROUTES = new Set([
  "/",
  "/blogs",
  "/projects",
  "/feed.xml",
  "/sitemap.xml",
]);

// Markdown links/images and JSX href/src attributes pointing at local paths.
const localLinks = (content: string) =>
  [
    ...content.matchAll(/(!?)\[[^\]]*\]\((\/[^)\s]*)\)/g),
    ...content.matchAll(/\b(href|src)=["'](\/[^"']*)["']/g),
  ].map(([, kind, target = "/"]) => ({
    isImage: kind === "!" || kind === "src",
    path: new URL(target, "http://localhost").pathname,
  }));

describe("blog posts", () => {
  it("have valid frontmatter and unique slugs", async () => {
    // loadPosts throws on invalid frontmatter or duplicate slugs.
    const posts = await loadPosts(POSTS_DIRECTORY, { includeDrafts: true });
    expect(posts.length).toBeGreaterThan(0);
  });

  it("only link to routes and files that exist", async () => {
    const posts = await loadPosts(POSTS_DIRECTORY, { includeDrafts: true });
    const published = new Set(
      posts.filter((post) => !post.draft).map((post) => `/blogs/${post.slug}`),
    );

    const broken = posts.flatMap(({ file, body }) =>
      localLinks(body)
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
