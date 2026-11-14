import { resolve } from "node:path";

import type { Plugin, ViteDevServer } from "vite";

import { loadPosts } from "./posts.ts";

const VIRTUAL_ID = "virtual:posts";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/**
 * Exposes the blog as `virtual:posts`:
 *
 * - `posts`: validated metadata (no MDX bodies), newest first
 * - `postModules`: slug -> lazy import of the compiled MDX module
 *
 * Drafts are included in dev and left out of production builds (and never
 * bundled) unless SHOW_DRAFTS=true.
 */
export const content = ({ root }: { root: string }): Plugin => {
  const postsDirectory = resolve(root, "posts");
  let includeDrafts = false;

  const reload = (server: ViteDevServer, file: string) => {
    if (!file.startsWith(postsDirectory)) return;
    for (const environment of Object.values(server.environments)) {
      const module = environment.moduleGraph.getModuleById(RESOLVED_ID);
      if (module) environment.moduleGraph.invalidateModule(module);
    }
    server.ws.send({ type: "full-reload" });
  };

  return {
    name: "personal-website:content",
    configResolved(config) {
      includeDrafts =
        config.command === "serve" || process.env.SHOW_DRAFTS === "true";
    },
    configureServer(server) {
      server.watcher.add(postsDirectory);
      for (const event of ["add", "change", "unlink"] as const) {
        server.watcher.on(event, (file) => reload(server, file));
      }
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return;

      const posts = await loadPosts(postsDirectory, { includeDrafts });
      for (const post of posts) this.addWatchFile(post.file);

      const metadata = posts.map(({ file: _file, body: _body, ...post }) => post);
      const modules = posts
        .map(
          (post) =>
            `  ${JSON.stringify(post.slug)}: () => import(${JSON.stringify(post.file)}),`,
        )
        .join("\n");

      return [
        `export const posts = ${JSON.stringify(metadata)};`,
        `export const postModules = {\n${modules}\n};`,
      ].join("\n");
    },
  };
};
