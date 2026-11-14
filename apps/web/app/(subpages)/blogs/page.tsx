import { Suspense } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { getBlogs } from "@/lib/getBlogs";

import { BlogList, BlogsClient } from "./blogs-client";

const BlogsPage = async () => {
  const posts = await getBlogs();

  return (
    <>
      <div className="container px-8 pt-4 md:pt-10">
        <Breadcrumbs items={[{ label: "Blogs" }]} />
      </div>
      <div className="min-h-screen pt-4 md:pt-10 dark:text-white">
        <div className="container px-8">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">My Blogs</h1>
          {/* useSearchParams opts out of prerendering, so the static HTML gets the full list. */}
          <Suspense fallback={<BlogList blogs={posts} />}>
            <BlogsClient blogs={posts} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default BlogsPage;
