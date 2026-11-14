import { createFileRoute } from "@tanstack/react-router";

import { renderRss } from "@/lib/feeds";
import { posts } from "@/lib/posts";

// Prerendered to /feed.xml at build time.
export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(renderRss(posts), {
          headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
        }),
    },
  },
});
