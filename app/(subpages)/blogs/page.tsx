"use client";

import { useEffect, useState } from "react";
import { BlogItem } from "./components/BlogItem";
import type { Blog } from "./types";

type GetBlogsBody = {
  blogs: Blog[];
};

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const getBlogs = async () => {
      const response = await fetch("/api/blogs");
      if (!response.ok) throw new Error("Error while getting blogs");

      const { blogs } = (await response.json()) as GetBlogsBody;
      setBlogs(blogs);
    };

    getBlogs();
  });

  return (
    <div className="min-h-screen pt-4 dark:text-white md:pt-10">
      <div className="container px-8">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">My Blogs</h1>
        {blogs.map((blog, index) => (
          <div className="my-6 md:my-8 " key={blog.slug}>
            <BlogItem blog={blog} />
            {index !== blogs.length - 1 && (
              <hr className="mt-6 border-t-slate-800 dark:border-t-slate-400 md:mt-8" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
