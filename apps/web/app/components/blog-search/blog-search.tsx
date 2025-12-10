"use client";

import { useState, useMemo, useEffect } from "react";
import { MdSearch } from "react-icons/md";

import type { Blog } from "@/types";

type Props = {
  blogs: Blog[];
  onFilterChange: (filteredBlogs: Blog[]) => void;
};

export const BlogSearch = ({ blogs, onFilterChange }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags from blogs
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    blogs.forEach((blog) => {
      blog.tags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [blogs]);

  // Filter blogs based on search query and selected tag
  const filteredBlogs = useMemo(() => {
    let filtered = blogs;

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(
        (blog) => blog.tags?.includes(selectedTag)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.description.toLowerCase().includes(query) ||
          blog.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [blogs, searchQuery, selectedTag]);

  // Notify parent of filtered blogs
  useEffect(() => {
    onFilterChange(filteredBlogs);
  }, [filteredBlogs, onFilterChange]);

  return (
    <div className="mb-8 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-darkGray dark:text-white"
        />
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
              selectedTag === null
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"} found
      </p>
    </div>
  );
};

