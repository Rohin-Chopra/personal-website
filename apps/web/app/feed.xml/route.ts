import { getBlogs } from "@/lib/getBlogs";
import { parseBlogDate } from "@/lib/parseBlogDate";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const cdata = (value: string) =>
  `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

export async function GET() {
  const blogs = await getBlogs();
  const lastBuildDate = blogs.length
    ? parseBlogDate(blogs[0].createdAt)
    : new Date();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Rohin Chopra - Blog</title>
    <description>Blog posts by Rohin Chopra about software development, AWS, and technology</description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    ${blogs
      .map(
        (blog) => `
    <item>
      <title>${cdata(blog.title)}</title>
      <description>${cdata(blog.description)}</description>
      <link>${SITE_URL}/blogs/${blog.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blogs/${blog.slug}</guid>
      <pubDate>${parseBlogDate(blog.createdAt).toUTCString()}</pubDate>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
