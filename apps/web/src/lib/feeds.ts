import { toBlogDate } from "./post-schema.ts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site.ts";
import type { PostSummary } from "./types.ts";

const cdata = (value: string) => `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const lastModified = (post: PostSummary) => toBlogDate(post.updatedAt ?? post.createdAt);

export const renderRss = (posts: PostSummary[]) => {
  const lastBuildDate = posts.length
    ? new Date(Math.max(...posts.map((post) => lastModified(post).getTime())))
    : new Date(0);

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blogs/${post.slug}`;
      const categories = post.tags
        .map((tag) => `\n      <category>${cdata(tag)}</category>`)
        .join("");
      return `
    <item>
      <title>${cdata(post.title)}</title>
      <description>${cdata(post.description)}</description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toBlogDate(post.createdAt).toUTCString()}</pubDate>${categories}
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${cdata(`${SITE_NAME} · Writing`)}</title>
    <description>${cdata(SITE_DESCRIPTION)}</description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>
`;
};

export const renderSitemap = (posts: PostSummary[]) => {
  const entries = [
    { path: "/", changefreq: "monthly", priority: "1.0" },
    { path: "/blogs", changefreq: "weekly", priority: "0.8" },
    { path: "/projects", changefreq: "monthly", priority: "0.6" },
    ...posts.map((post) => ({
      path: `/blogs/${post.slug}`,
      lastmod: lastModified(post).toISOString().slice(0, 10),
      changefreq: "yearly",
      priority: "0.7",
    })),
  ];

  const urls = entries
    .map(
      (entry) => `
  <url>
    <loc>${escapeXml(`${SITE_URL}${entry.path === "/" ? "" : entry.path}`)}</loc>${
      "lastmod" in entry ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""
    }
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>
`;
};
