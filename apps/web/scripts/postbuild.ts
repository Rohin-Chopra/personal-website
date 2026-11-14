// Runs after `vite build` (and its prerender):
//   1. renders Open Graph images for the home page and every post
//   2. adds a per-page CSP <meta> that only allows the page's own inline
//      scripts (by hash), so the header policy's 'unsafe-inline' never applies
//   3. checks the files CloudFront depends on exist
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadPosts } from "../plugins/posts.ts";
import { renderOgImage } from "./og.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(root, "dist", "client");

const SCRIPT_SRC_ALLOWLIST = ["'self'", "https://challenges.cloudflare.com"];

const walk = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return nested.flat();
};

const writeOgImages = async () => {
  const posts = await loadPosts(join(root, "posts"), {
    includeDrafts: process.env.SHOW_DRAFTS === "true",
  });

  const images: Array<[string, Parameters<typeof renderOgImage>[0]]> = [
    [
      "og/default.png",
      {
        eyebrow: "Senior Software Engineer",
        title: "Hi, I'm Rohin.",
        subtitle:
          "Architecting, designing and developing robust and scalable solutions.",
      },
    ],
    ...posts.map((post): [string, Parameters<typeof renderOgImage>[0]] => [
      `og/blogs/${post.slug}.png`,
      {
        eyebrow: `Writing · ${post.readingTime} min read`,
        title: post.title,
        subtitle: post.description,
      },
    ]),
  ];

  await Promise.all(
    images.map(async ([path, options]) => {
      const file = join(outDir, path);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, await renderOgImage(options));
    }),
  );
  return images.length;
};

// Inline scripts the browser executes: no src, and a JavaScript type.
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
const isExecutable = (attrs: string) => {
  const type = /\btype=["']?([^"'\s>]+)/i.exec(attrs)?.[1]?.toLowerCase();
  return (
    !type ||
    type === "module" ||
    type === "text/javascript" ||
    type === "application/javascript"
  );
};

const addCspMeta = async () => {
  const pages = (await walk(outDir)).filter((file) => file.endsWith(".html"));

  for (const page of pages) {
    let html = await readFile(page, "utf8");
    if (html.includes('http-equiv="Content-Security-Policy"')) continue;

    const hashes = new Set<string>();
    for (const [, attrs = "", body = ""] of html.matchAll(INLINE_SCRIPT)) {
      if (!isExecutable(attrs) || body.length === 0) continue;
      hashes.add(
        `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`,
      );
    }

    const policy = `script-src ${[...SCRIPT_SRC_ALLOWLIST, ...hashes].join(" ")}`;
    const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}">`;
    // The policy must come before the first script it governs.
    if (!/<head[^>]*>/i.test(html)) throw new Error(`${page} has no <head>`);
    html = html.replace(/<head[^>]*>/i, (head) => `${head}${meta}`);
    await writeFile(page, html);
  }
  return pages.length;
};

// CloudFront serves 404.html for *any* unknown path, but its router state is
// for /404, so hydrating it would mismatch. Ship it as static HTML: keep only
// the theme script; its links are plain anchors and still work.
const makeNotFoundStatic = async () => {
  const file = join(outDir, "404.html");
  const html = (await readFile(file, "utf8"))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) =>
      script.includes('localStorage.getItem("theme")') ? script : "",
    )
    .replace(/<link rel="modulepreload"[^>]*>/gi, "");
  await writeFile(file, html);
};

const assertOutputs = () => {
  const required = [
    "index.html",
    "404.html",
    "blogs/index.html",
    "projects/index.html",
    "feed.xml",
    "sitemap.xml",
    "robots.txt",
  ];
  const missing = required.filter((file) => !existsSync(join(outDir, file)));
  if (missing.length)
    throw new Error(`Build output is missing: ${missing.join(", ")}`);
};

assertOutputs();
await makeNotFoundStatic();
const [og, csp] = await Promise.all([writeOgImages(), addCspMeta()]);
console.log(`postbuild: ${og} Open Graph images, CSP meta on ${csp} pages`);
