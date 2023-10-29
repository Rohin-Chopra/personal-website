import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { extname } from "path";
import type { Blog } from "../../(subpages)/blogs/types";

export async function GET() {
  const posts = (await readdir("./posts/")).filter((file) =>
    [".md", ".mdx"].includes(extname(file))
  );

  const postsPromises = await Promise.allSettled(
    posts.map(async (file) => {
      const filePath = `./posts/${file}`;
      const postContent = await readFile(filePath, "utf-8");
      const { data, content } = matter(postContent);

      return { ...data, body: content } as Blog;
    })
  );

  const blogs = postsPromises
    .filter((res) => res.status === "fulfilled")
    .map((res) => {
      const fulfilledResult = res as PromiseFulfilledResult<Blog>;
      return fulfilledResult.value;
    });

  return Response.json({
    blogs,
  });
}
