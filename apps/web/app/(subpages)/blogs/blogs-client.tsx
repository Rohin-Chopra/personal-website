"use client";

import { BlogItem } from "@/components/blog-item";
import { SearchFilter, useSearchFilter } from "@/components/search-filter";
import type { BlogSummary } from "@/types";

const getTags = (blog: BlogSummary) => blog.tags;
const getSearchText = (blog: BlogSummary) => [blog.title, blog.description];

export const BlogList = ({ blogs }: { blogs: BlogSummary[] }) =>
  blogs.length === 0 ? (
    <p className="text-center text-gray-600 dark:text-gray-400">
      No blogs found. Try adjusting your search or filters.
    </p>
  ) : (
    blogs.map((post, index) => (
      <div className="my-6 md:my-8" key={post.slug}>
        <BlogItem blog={post} />
        {index !== blogs.length - 1 && (
          <hr className="mt-6 border-t-slate-800 md:mt-8 dark:border-t-slate-400" />
        )}
      </div>
    ))
  );

export const BlogsClient = ({ blogs }: { blogs: BlogSummary[] }) => {
  const { query, setQuery, tags, selectedTag, setSelectedTag, filtered } =
    useSearchFilter({ items: blogs, getTags, getSearchText, tagParam: "tag" });

  return (
    <>
      <SearchFilter
        label="Search blogs"
        placeholder="Search blogs..."
        query={query}
        onQueryChange={setQuery}
        tags={tags}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        resultCount={filtered.length}
        noun={{ singular: "post", plural: "posts" }}
      />
      <BlogList blogs={filtered} />
    </>
  );
};
