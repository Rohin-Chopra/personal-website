import { fileURLToPath } from "node:url";

import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { defineConfig } from "vite";

import { content } from "./plugins/content.ts";
import { rehypeImageSize } from "./plugins/rehype-image-size.ts";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 3000 },
  build: {
    // The CSP only allows fonts from 'self', so never inline them as data URIs.
    assetsInlineLimit: (file) =>
      /\.(woff2?|ttf|otf)$/.test(file) ? false : undefined,
  },
  plugins: [
    content({ root }),
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkGfm],
        rehypePlugins: [
          rehypeImageSize,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["heading-anchor"] },
            },
          ],
          [
            rehypeShiki,
            {
              themes: { light: "github-light", dark: "github-dark-dimmed" },
              defaultColor: false,
              langAlias: { tf: "terraform" },
            },
          ],
        ],
      }),
    },
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
        // Query strings and fragments map onto the same file as the bare
        // path; prerender each page once, from its canonical URL.
        filter: ({ path }) =>
          !/[?#]/.test(path) && (path === "/" || !path.endsWith("/")),
      },
      pages: [
        { path: "/" },
        { path: "/feed.xml" },
        { path: "/sitemap.xml" },
        { path: "/404", prerender: { outputPath: "/404.html" } },
      ],
    }),
    react(),
  ],
});
