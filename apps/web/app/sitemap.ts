import type { MetadataRoute } from "next";

import { getBlogs } from "@/lib/getBlogs";
import { parseBlogDate } from "@/lib/parseBlogDate";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogs();

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blogs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, changeFrequency: "monthly", priority: 0.6 },
    ...blogs.map((blog) => ({
      url: `${SITE_URL}/blogs/${blog.slug}`,
      lastModified: parseBlogDate(blog.createdAt),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
