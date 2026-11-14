import Link from "next/link";

import { formatBlogDate } from "@/lib/blogFrontmatter";
import type { BlogSummary } from "@/types";

type Props = {
  previous?: BlogSummary;
  next?: BlogSummary;
  related: BlogSummary[];
};

export const BlogNavigation = ({ previous, next, related }: Props) => {
  if (!previous && !next && related.length === 0) return null;

  return (
    <footer className="mt-12 border-t border-slate-300 pt-8 dark:border-slate-700">
      {related.length > 0 && (
        <section aria-labelledby="related-posts-heading" className="mb-10">
          <h2 id="related-posts-heading" className="mb-4 text-2xl font-bold">
            Related posts
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {related.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blogs/${post.slug}`}
                  className="block h-full rounded-lg border border-slate-300 p-4 transition-colors hover:border-primary dark:border-slate-700"
                >
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatBlogDate(post.createdAt)}
                  </p>
                  <p className="mt-1 font-semibold">{post.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {(previous || next) && (
        <nav aria-label="More posts" className="grid gap-4 md:grid-cols-2">
          {previous ? (
            <Link
              href={`/blogs/${previous.slug}`}
              rel="prev"
              className="rounded-lg border border-slate-300 p-4 transition-colors hover:border-primary dark:border-slate-700"
            >
              <span className="text-sm text-slate-600 dark:text-slate-400">
                ← Previous post
              </span>
              <span className="mt-1 block font-semibold">{previous.title}</span>
            </Link>
          ) : (
            <span aria-hidden />
          )}
          {next && (
            <Link
              href={`/blogs/${next.slug}`}
              rel="next"
              className="rounded-lg border border-slate-300 p-4 text-right transition-colors hover:border-primary dark:border-slate-700"
            >
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Next post →
              </span>
              <span className="mt-1 block font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </footer>
  );
};
