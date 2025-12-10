"use client";

import { useState } from "react";

import { BlogItem } from "../../components/blog-item";
import { BlogSearch } from "../../components/blog-search";
import type { Blog } from "../../types";

type Props = {
  initialBlogs: Blog[];
};

export const BlogsClient = ({ initialBlogs }: Props) => {
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>(initialBlogs);

  return (
    <div className="min-h-screen pt-4 dark:text-white md:pt-10">
      <div className="container px-8">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">My Blogs</h1>
        <BlogSearch blogs={initialBlogs} onFilterChange={setFilteredBlogs} />
        {filteredBlogs.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No blogs found. Try adjusting your search or filters.
          </p>
        ) : (
          filteredBlogs.map((post, index) => (
            <div className="my-6 md:my-8" key={post.slug}>
              <BlogItem blog={post} />
              {index !== filteredBlogs.length - 1 && (
                <hr className="mt-6 border-t-slate-800 dark:border-t-slate-400 md:mt-8" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

