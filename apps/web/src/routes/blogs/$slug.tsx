import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { mdxComponents } from "@/components/mdx-components";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";
import { formatBlogDate, toBlogDate } from "@/lib/post-schema";
import { getLoadedPostContent, getPost, loadPostContent, posts } from "@/lib/posts";
import { getAdjacentBlogs, getRelatedBlogs } from "@/lib/related";
import { seo } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/blogs/$slug")({
  loader: async ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    await loadPostContent(post.slug);
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { post } = loaderData;
    const path = `/blogs/${post.slug}`;
    const published = toBlogDate(post.createdAt).toISOString();
    const modified = toBlogDate(post.updatedAt ?? post.createdAt).toISOString();
    const { meta, links } = seo({
      title: post.title,
      description: post.description,
      path,
      type: "article",
      image: `/og/blogs/${post.slug}.png`,
      article: { publishedTime: published, modifiedTime: modified, tags: post.tags },
    });
    return {
      meta: [
        ...meta,
        {
          "script:ld+json": {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            image: `${SITE_URL}/og/blogs/${post.slug}.png`,
            datePublished: published,
            dateModified: modified,
            url: `${SITE_URL}${path}`,
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
            keywords: post.tags,
            author: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
          },
        },
      ],
      links,
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const Content = getLoadedPostContent(post.slug);
  const { previous, next } = getAdjacentBlogs(posts, post.slug);
  const related = getRelatedBlogs(posts, post);

  return (
    <>
      <ReadingProgress />
      <article className="container-page py-12 sm:py-20">
        <header className="mx-auto max-w-3xl">
          <Link
            to="/blogs"
            className="group mb-10 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" />
            All posts
          </Link>
          <p className="font-mono text-xs text-muted">
            <time dateTime={post.createdAt}>{formatBlogDate(post.createdAt)}</time>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <>
                {" "}
                · Updated <time dateTime={post.updatedAt}>{formatBlogDate(post.updatedAt)}</time>
              </>
            )}{" "}
            · {post.readingTime} min read
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl">
            {post.title}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-muted">{post.description}</p>
          {post.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to="/blogs"
                    search={{ tag }}
                    className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] text-accent hover:bg-accent hover:text-accent-ink"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="relative mx-auto mt-12 max-w-3xl border-t border-line pt-10">
          {post.headings.length > 0 && (
            <>
              <details className="mb-10 rounded-xl border border-line bg-surface p-4 xl:hidden">
                <summary className="cursor-pointer text-sm font-medium">On this page</summary>
                <nav aria-label="Table of contents" className="mt-4">
                  <TableOfContents headings={post.headings} />
                </nav>
              </details>
              <aside className="absolute top-10 left-full ml-14 hidden h-[calc(100%-2.5rem)] w-60 xl:block">
                <nav aria-label="Table of contents" className="sticky top-24">
                  <p className="mb-3 font-mono text-xs tracking-widest text-muted uppercase">
                    On this page
                  </p>
                  <TableOfContents headings={post.headings} />
                </nav>
              </aside>
            </>
          )}

          <div className="prose-post prose max-w-none">
            <Content components={mdxComponents} />
          </div>

          <footer className="mt-16 space-y-12 border-t border-line pt-10">
            {related.length > 0 && (
              <section aria-labelledby="related-heading">
                <h2 id="related-heading" className="mb-5 font-serif text-3xl">
                  Related posts
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {related.map((other) => (
                    <li key={other.slug}>
                      <Link
                        to="/blogs/$slug"
                        params={{ slug: other.slug }}
                        className="block h-full rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/40"
                      >
                        <p className="font-mono text-xs text-muted">{formatBlogDate(other.createdAt)}</p>
                        <p className="mt-1.5 font-medium">{other.title}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {(previous || next) && (
              <nav aria-label="More posts" className="grid gap-4 sm:grid-cols-2">
                {previous ? (
                  <Link
                    to="/blogs/$slug"
                    params={{ slug: previous.slug }}
                    rel="prev"
                    className="group rounded-xl border border-line p-5 transition-colors hover:border-accent/40"
                  >
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                      <ArrowLeft aria-hidden className="size-3.5" /> Previous
                    </span>
                    <span className="mt-1.5 block font-medium">{previous.title}</span>
                  </Link>
                ) : (
                  <span aria-hidden />
                )}
                {next && (
                  <Link
                    to="/blogs/$slug"
                    params={{ slug: next.slug }}
                    rel="next"
                    className="group rounded-xl border border-line p-5 text-right transition-colors hover:border-accent/40"
                  >
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                      Next <ArrowRight aria-hidden className="size-3.5" />
                    </span>
                    <span className="mt-1.5 block font-medium">{next.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </footer>
        </div>
      </article>
    </>
  );
}
