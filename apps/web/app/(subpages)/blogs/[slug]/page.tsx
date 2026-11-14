import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MDXBlogBody } from "@/(subpages)/blogs/[slug]/mdx/MDXBlogBody";
import type { BlogParams } from "@/(subpages)/blogs/[slug]/types";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { formatBlogDate, toBlogDate } from "@/lib/blogFrontmatter";
import { getBlog, getBlogs } from "@/lib/getBlogs";
import { getAdjacentBlogs, getRelatedBlogs } from "@/lib/relatedBlogs";
import { SITE_NAME, SITE_URL } from "@/lib/site";

import { BlogNavigation } from "./BlogNavigation";

import "./style.css";

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getBlogs();

  return posts.map((post) => {
    return {
      slug: post.slug,
    };
  });
}

export const generateMetadata = async ({
  params,
}: BlogParams): Promise<Metadata> => {
  const { slug } = await params;
  const post = await getBlog(slug);

  if (!post) {
    return notFound();
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: {
      canonical: `/blogs/${slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blogs/${slug}`,
      publishedTime: toBlogDate(post.createdAt).toISOString(),
      modifiedTime: toBlogDate(post.updatedAt ?? post.createdAt).toISOString(),
      authors: [SITE_NAME],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
};

const BlogPage = async ({ params }: BlogParams) => {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) return notFound();

  const blogs = await getBlogs();
  const { previous, next } = getAdjacentBlogs(blogs, blog.slug);
  const related = getRelatedBlogs(blogs, blog);

  const url = `${SITE_URL}/blogs/${blog.slug}`;
  const publishedAt = toBlogDate(blog.createdAt);
  const modifiedAt = toBlogDate(blog.updatedAt ?? blog.createdAt);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.description,
    image: `${url}/opengraph-image`,
    datePublished: publishedAt.toISOString(),
    dateModified: modifiedAt.toISOString(),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: blog.tags,
    author: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ScrollProgressBar />
      <main className="min-h-screen pt-24 font-roboto dark:text-white">
        <header id="gradientBackgroundHeader">
          <div className="container px-4 pt-6 md:mx-auto md:flex md:flex-col md:items-center">
            <div className="self-start md:self-auto">
              <div className="lg:w-2xl">
                <Breadcrumbs
                  items={[
                    { label: "Blogs", href: "/blogs" },
                    { label: blog.title },
                  ]}
                />
              </div>
            </div>
            <div className="pt-8">
              <div className="lg:w-2xl">
                <p className="mb-4 dark:text-slate-400">
                  <time dateTime={blog.createdAt}>
                    {formatBlogDate(blog.createdAt)}
                  </time>
                  {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                    <>
                      {" "}
                      · Updated{" "}
                      <time dateTime={blog.updatedAt}>
                        {formatBlogDate(blog.updatedAt)}
                      </time>
                    </>
                  )}
                  {blog.readingTime && <> · {blog.readingTime} min read</>}
                </p>
                <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                  {blog.title}
                </h1>
                <p className="mb-8 dark:text-slate-400">{blog.description}</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container px-4 pt-2 pb-8 md:mx-auto md:flex md:justify-center">
          <div>
            <div className="lg:w-2xl">
              <MDXBlogBody blog={blog} />
              <BlogNavigation
                previous={previous}
                next={next}
                related={related}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default BlogPage;
