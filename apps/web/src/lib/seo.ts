import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site.ts";

type SeoOptions = {
  title?: string;
  description?: string;
  /** Path of the page, e.g. `/blogs`. */
  path: string;
  /** Path of the Open Graph image, generated at build time. */
  image?: string;
  type?: "website" | "article";
  article?: {
    publishedTime: string;
    modifiedTime: string;
    tags: string[];
  };
};

/** `head()` meta and links for a page. */
export const seo = ({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = "/og/default.png",
  type = "website",
  article,
}: SeoOptions) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const imageUrl = `${SITE_URL}${image}`;

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:type", content: type },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: title ?? SITE_NAME },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: imageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title ?? SITE_NAME },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
      ...(article
        ? [
            { property: "article:published_time", content: article.publishedTime },
            { property: "article:modified_time", content: article.modifiedTime },
            { property: "article:author", content: SITE_NAME },
            // Meta is de-duplicated by name/property, so tags go in one tag.
            { name: "keywords", content: article.tags.join(", ") },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: url }],
  };
};
