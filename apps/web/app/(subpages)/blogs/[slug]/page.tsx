import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

import { MDXBlogBody } from "@/(subpages)/blogs/[slug]/mdx/MDXBlogBody";
import type { BlogParams } from "@/(subpages)/blogs/[slug]/types";
import { getBlog } from "@/lib/getBlog";
import { getBlogs } from "@/lib/getBlogs";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

import "./style.css";

export async function generateStaticParams(): Promise<BlogParams["params"][]> {
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
  const post = await getBlog(params.slug);

  if (!post) {
    return notFound();
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `https://www.rohinchopra.com/blogs/${params.slug}`,
    },
  };
};

const BlogPage = async ({ params }: BlogParams) => {
  const blog = await getBlog(params.slug);

  // TODO: add 404 page
  if (!blog) return notFound();

  return (
    <>
      <ScrollProgressBar />
      <main className="min-h-screen pt-24 font-roboto dark:text-white">
        <header id="gradientBackgroundHeader">
          <div className="container px-4 pt-6 md:mx-auto md:flex md:flex-col md:items-center">
            <div className="self-start md:self-auto">
              <div className="lg:w-[42rem]">
                <Link
                  href="/blogs"
                  passHref
                  className="mb-4 flex items-center text-slate-800 hover:text-slate-400 dark:text-slate-400 hover:dark:text-white"
                >
                  <MdArrowBack className="mr-2" /> Back to blogs
                </Link>
              </div>
            </div>
            <div className="pt-8">
              <div className="lg:w-[42rem]">
                <p className="mb-4 dark:text-slate-400">{blog.createdAt}</p>
                <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                  {blog.title}
                </h1>
                <p className="mb-8 dark:text-slate-400">{blog.description}</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container px-4 pb-8 pt-2 md:mx-auto md:flex md:justify-center">
          <div>
            <div className="lg:w-[42rem]">
              <MDXBlogBody blog={blog} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default BlogPage;
