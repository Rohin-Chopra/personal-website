import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { formatBlogDate } from "@/lib/post-schema";
import type { PostSummary } from "@/lib/types";

export const PostList = ({
  posts,
  headingLevel = 3,
}: {
  posts: PostSummary[];
  headingLevel?: 2 | 3;
}) => {
  const Heading = `h${headingLevel}` as const;

  return (
    <ol className="divide-y divide-line border-y border-line">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            to="/blogs/$slug"
            params={{ slug: post.slug }}
            className="group grid gap-2 py-7 transition-colors sm:grid-cols-[10rem_1fr_auto] sm:gap-8"
          >
            <div className="font-mono text-xs leading-6 text-muted">
              <time dateTime={post.createdAt}>{formatBlogDate(post.createdAt)}</time>
              <span className="sm:block"> · {post.readingTime} min read</span>
            </div>
            <div>
              <Heading className="text-xl font-semibold tracking-tight text-balance transition-colors group-hover:text-accent">
                {post.title}
              </Heading>
              <p className="mt-2 max-w-2xl leading-relaxed text-muted">{post.description}</p>
              {post.tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] text-accent"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <ArrowRight
              aria-hidden
              className="hidden size-5 self-center text-muted transition-all group-hover:translate-x-1 group-hover:text-accent sm:block"
            />
          </Link>
        </li>
      ))}
    </ol>
  );
};
