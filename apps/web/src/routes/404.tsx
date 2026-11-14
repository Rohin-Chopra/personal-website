import { createFileRoute } from "@tanstack/react-router";

import { NotFound } from "@/components/not-found";
import { SITE_NAME } from "@/lib/site";

// Prerendered to /404.html, which CloudFront serves for unknown paths.
export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: `Page not found | ${SITE_NAME}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotFound,
});
