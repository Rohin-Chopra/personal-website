/// <reference types="vite/client" />

declare module "virtual:posts" {
  import type { MDXContent } from "mdx/types";

  import type { Post } from "@/lib/types";

  export const posts: Post[];
  export const postModules: Record<
    string,
    () => Promise<{ default: MDXContent }>
  >;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}
