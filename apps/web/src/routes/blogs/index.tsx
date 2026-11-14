import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { z } from "zod";

import { PostList } from "@/components/post-list";
import { SearchFilter, filterItems } from "@/components/search-filter";
import { posts, postTags } from "@/lib/posts";
import { seo } from "@/lib/seo";
import type { PostSummary } from "@/lib/types";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  tag: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/blogs/")({
  validateSearch: searchSchema,
  head: () =>
    seo({
      title: "Writing",
      description:
        "Long-form guides on AWS, serverless, Terraform and building scalable systems.",
      path: "/blogs",
    }),
  component: BlogsPage,
});

const getTags = (post: PostSummary) => post.tags;
const getText = (post: PostSummary) => [post.title, post.description];

function BlogsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  // The page is prerendered without search params, so filters apply after
  // hydration to keep the first client render identical to the HTML.
  const hydrated = useHydrated();
  const query = hydrated ? (search.q ?? "") : "";
  const tag =
    hydrated && search.tag && postTags.includes(search.tag)
      ? search.tag
      : undefined;

  const filtered = filterItems(posts, { query, tag, getTags, getText });

  return (
    <div className="container-page py-16 sm:py-24">
      <header className="mb-12 max-w-3xl">
        <p className="mb-4 font-mono text-xs tracking-widest text-muted uppercase">
          Writing
        </p>
        <h1 className="font-serif text-6xl tracking-tight sm:text-7xl">
          Notes &amp; <em>guides</em>.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Hands-on write-ups about AWS, serverless architecture and
          infrastructure as code.
        </p>
      </header>

      <SearchFilter
        key={hydrated ? "client" : "server"}
        label="Search posts"
        placeholder="Search posts…"
        initialQuery={query}
        onQueryChange={(q) =>
          navigate({
            search: (prev) => ({ ...prev, q: q.trim() ? q : undefined }),
            replace: true,
            resetScroll: false,
          })
        }
        tags={postTags}
        selectedTag={tag}
        onTagChange={(next) =>
          navigate({
            search: (prev) => ({ ...prev, tag: next }),
            replace: true,
            resetScroll: false,
          })
        }
        resultCount={filtered.length}
        noun={{ singular: "post", plural: "posts" }}
      />

      {filtered.length > 0 ? (
        <PostList posts={filtered} headingLevel={2} />
      ) : (
        <p className="border-y border-line py-16 text-center text-muted">
          No posts match. Try a different search or tag.
        </p>
      )}
    </div>
  );
}
