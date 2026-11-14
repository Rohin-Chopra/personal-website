import { createFileRoute } from "@tanstack/react-router";

import { renderSitemap } from "@/lib/feeds";
import { posts } from "@/lib/posts";

// Prerendered to /sitemap.xml at build time.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(renderSitemap(posts), {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        }),
    },
  },
});
