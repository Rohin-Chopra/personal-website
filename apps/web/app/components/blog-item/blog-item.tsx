import Link from "next/link";
import { MdAccessTime } from "react-icons/md";

import type { Blog } from "@/types";

type Props = {
  blog: Blog;
};

export const BlogItem = ({ blog }: Props) => {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="cursor-pointer hover:opacity-80"
      passHref
    >
      <div className="mb-2 flex flex-wrap items-center gap-4 text-slate-800 dark:text-slate-400">
        <p>{blog.createdAt}</p>
        {blog.readingTime && (
          <div className="flex items-center gap-1">
            <MdAccessTime className="h-4 w-4" />
            <span>{blog.readingTime} min read</span>
          </div>
        )}
      </div>
      <h2 className="text-xl font-semibold md:text-2xl">{blog.title}</h2>
      <p className="mt-2 text-slate-800 dark:text-slate-400">
        {blog.description}
      </p>
      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};




