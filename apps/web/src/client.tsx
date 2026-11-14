import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

import { loadPostContent } from "./lib/posts";

// Post bodies are separate chunks. Load the current one before hydrating so
// the first client render matches the prerendered HTML.
const slug = /^\/blogs\/([^/]+)\/?$/.exec(window.location.pathname)?.[1];
if (slug) {
  await loadPostContent(decodeURIComponent(slug)).catch(() => {
    // Unknown slug: the router renders the not-found page instead.
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
