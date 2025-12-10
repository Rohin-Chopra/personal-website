import { getBlogs } from "@/lib/getBlogs";

export async function GET() {
  const blogs = await getBlogs();
  const baseUrl = "https://www.rohinchopra.com";

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Rohin Chopra - Blog</title>
    <description>Blog posts by Rohin Chopra about software development, AWS, and technology</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${blogs
      .map((blog) => {
        const pubDate = new Date(blog.createdAt).toUTCString();
        return `
    <item>
      <title><![CDATA[${blog.title}]]></title>
      <description><![CDATA[${blog.description}]]></description>
      <link>${baseUrl}/blogs/${blog.slug}</link>
      <guid>${baseUrl}/blogs/${blog.slug}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

