import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { formatBlogDate } from "@/lib/post-schema";
import { posts as allPosts } from "@/lib/posts";
import type { PostSummary } from "@/lib/types";

/** Oldest post is No. 1, so numbers stay put when the list is filtered. */
const numberOf = (slug: string) =>
  String(allPosts.length - allPosts.findIndex((p) => p.slug === slug)).padStart(
    2,
    "0",
  );

export const PostList = ({
  posts,
  headingLevel = 3,
}: {
  posts: PostSummary[];
  headingLevel?: 2 | 3;
}) => {
  const Heading = `h${headingLevel}` as const;

  return (
    <ol className="border-b border-line">
      {posts.map((post) => (
        <li key={post.slug} className="border-t border-line">
          <Link
            to="/blogs/$slug"
            params={{ slug: post.slug }}
            className="group relative grid gap-x-8 gap-y-3 py-8 sm:grid-cols-[5rem_1fr_11rem] sm:py-10"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-3 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 group-hover:scale-y-100 sm:-left-5"
            />
            <span
              aria-hidden
              className="font-display text-4xl leading-none text-muted/50 transition-colors duration-300 group-hover:text-accent sm:text-5xl"
            >
              {numberOf(post.slug)}
            </span>
            <div>
              <Heading className="font-display text-3xl leading-[1.05] text-balance sm:text-4xl">
                <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                  {post.title}
                </span>
              </Heading>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                {post.description}
              </p>
              {post.tags.length > 0 && (
                <ul
                  className="label mt-4 flex flex-wrap gap-x-3 gap-y-1 text-muted"
                  aria-label="Tags"
                >
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="before:text-accent before:content-['#']"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-start justify-between gap-4 font-mono text-xs leading-5 text-muted sm:flex-col sm:items-end sm:text-right">
              <div>
                <time dateTime={post.createdAt} className="block text-ink">
                  {formatBlogDate(post.createdAt)}
                </time>
                <span>{post.readingTime} min read</span>
              </div>
              <ArrowUpRight
                aria-hidden
                className="size-5 text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
              />
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
};
