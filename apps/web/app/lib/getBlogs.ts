import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { extname, join } from "path";
import { cache } from "react";
import { cwd } from "process";

import type { Blog } from "@/types";
import { calculateReadingTime } from "./calculateReadingTime";

export const getBlogs = cache(async (): Promise<Blog[]> => {
  const postsDirectory = join(cwd(), "posts");
  const posts = (await readdir(postsDirectory)).filter((file) =>
    [".md", ".mdx"].includes(extname(file))
  );

  const postsPromises = await Promise.allSettled(
    posts.map(async (file) => {
      const filePath = join(postsDirectory, file);
      const postContent = await readFile(filePath, "utf-8");
      const { data, content } = matter(postContent);

      const readingTime = calculateReadingTime(content);
      const tags = data.tags
        ? Array.isArray(data.tags)
          ? data.tags
          : [data.tags]
        : undefined;

      return {
        ...data,
        body: content,
        readingTime,
        tags,
      } as Blog;
    })
  );

  return postsPromises
    .filter((res) => res.status === "fulfilled")
    .map((res) => {
      const fulfilledResult = res as PromiseFulfilledResult<Blog>;
      return fulfilledResult.value;
    });
});
