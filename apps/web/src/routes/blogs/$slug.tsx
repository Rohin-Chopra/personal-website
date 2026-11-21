import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createElement } from "react";

import { mdxComponents } from "@/components/mdx-components";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";
import { formatBlogDate, toBlogDate } from "@/lib/post-schema";
import {
  getLoadedPostContent,
  getPost,
  loadPostContent,
  posts,
} from "@/lib/posts";
import { getAdjacentBlogs, getRelatedBlogs } from "@/lib/related";
import { jsonLd, seo } from "@/lib/seo";
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
      article: {
        publishedTime: published,
        modifiedTime: modified,
        tags: post.tags,
      },
    });
    return {
      meta,
      links,
      scripts: [
        jsonLd({
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
        }),
      ],
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
            className="label group mb-12 inline-flex items-center gap-1.5 text-muted hover:text-accent"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform group-hover:-translate-x-0.5"
            />
            All posts
          </Link>
          <p className="label flex flex-wrap gap-x-2 border-t-2 border-ink pt-3 text-muted">
            <time dateTime={post.createdAt}>
              {formatBlogDate(post.createdAt)}
            </time>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <>
                {" "}
                · Updated{" "}
                <time dateTime={post.updatedAt}>
                  {formatBlogDate(post.updatedAt)}
                </time>
              </>
            )}{" "}
            · {post.readingTime} min read
          </p>
          <h1 className="mt-8 font-display text-5xl leading-[0.98] text-balance sm:text-7xl">
            {post.title}
          </h1>
          <p className="mt-6 font-serif text-xl leading-relaxed text-muted italic sm:text-2xl">
            {post.description}
          </p>
          {post.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to="/blogs"
                    search={{ tag }}
                    className="label border border-line px-2 py-1 text-muted transition-colors hover:border-accent hover:text-accent"
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
              <details className="mb-10 border border-line bg-surface p-4 xl:hidden">
                <summary className="label cursor-pointer">On this page</summary>
                <nav aria-label="Table of contents" className="mt-4">
                  <TableOfContents headings={post.headings} />
                </nav>
              </details>
              <aside className="absolute top-10 left-full ml-14 hidden h-[calc(100%-2.5rem)] w-60 xl:block">
                <nav aria-label="Table of contents" className="sticky top-24">
                  <p className="label mb-3 text-muted">On this page</p>
                  <TableOfContents headings={post.headings} />
                </nav>
              </aside>
            </>
          )}

          <div className="prose-post prose max-w-none">
            {/* Content comes from a per-slug module cache, so its identity is
                stable across renders even though it's looked up here. */}
            {createElement(Content, { components: mdxComponents })}
          </div>

          <footer className="mt-16 space-y-12 border-t border-line pt-10">
            {related.length > 0 && (
              <section aria-labelledby="related-heading">
                <h2 id="related-heading" className="mb-6 font-display text-4xl">
                  Related posts
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {related.map((other) => (
                    <li key={other.slug}>
                      <Link
                        to="/blogs/$slug"
                        params={{ slug: other.slug }}
                        className="block h-full border border-line bg-surface p-5 transition-colors hover:border-accent"
                      >
                        <p className="label flex flex-wrap gap-x-2 border-t-2 border-ink pt-3 text-muted">
                          {formatBlogDate(other.createdAt)}
                        </p>
                        <p className="mt-2 font-display text-xl leading-snug">
                          {other.title}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {(previous || next) && (
              <nav
                aria-label="More posts"
                className="grid gap-4 sm:grid-cols-2"
              >
                {previous ? (
                  <Link
                    to="/blogs/$slug"
                    params={{ slug: previous.slug }}
                    rel="prev"
                    className="group border-t-2 border-ink pt-4 transition-colors hover:border-accent"
                  >
                    <span className="label inline-flex items-center gap-1 text-muted">
                      <ArrowLeft aria-hidden className="size-3.5" /> Previous
                    </span>
                    <span className="mt-2 block font-display text-2xl leading-snug transition-colors group-hover:text-accent">
                      {previous.title}
                    </span>
                  </Link>
                ) : (
                  <span aria-hidden />
                )}
                {next && (
                  <Link
                    to="/blogs/$slug"
                    params={{ slug: next.slug }}
                    rel="next"
                    className="group border-t-2 border-ink pt-4 text-right transition-colors hover:border-accent"
                  >
                    <span className="label inline-flex items-center gap-1 text-muted">
                      Next <ArrowRight aria-hidden className="size-3.5" />
                    </span>
                    <span className="mt-2 block font-display text-2xl leading-snug transition-colors group-hover:text-accent">
                      {next.title}
                    </span>
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
