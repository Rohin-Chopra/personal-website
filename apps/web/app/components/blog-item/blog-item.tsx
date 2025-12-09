import Link from "next/link";

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
      <p className="mb-2 text-slate-800 dark:text-slate-400">
        {blog.createdAt}
      </p>
      <h2 className="text-xl font-semibold md:text-2xl"> {blog.title}</h2>
      <p className="mt-2 text-slate-800 dark:text-slate-400">
        {blog.description}
      </p>
    </Link>
  );
};


