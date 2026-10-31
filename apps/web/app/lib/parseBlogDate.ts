/**
 * Parses human-written frontmatter dates such as "August 20th, 2023",
 * which `new Date()` cannot handle because of the ordinal suffix.
 */
export const parseBlogDate = (value: string): Date => {
  const normalized = value.replace(/(\d+)(st|nd|rd|th)\b/gi, "$1");
  return new Date(normalized);
};
