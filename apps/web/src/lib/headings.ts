import GithubSlugger from "github-slugger";

export type BlogHeading = {
  id: string;
  text: string;
  depth: 2 | 3;
};

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/;

const toPlainText = (markdown: string) =>
  markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__|\*|_|~~)(.+?)\1/g, "$2")
    .trim();

/**
 * Extracts the h2/h3 headings of a post, with the same ids `rehype-slug`
 * assigns. Every heading is slugged, in order, so duplicate ids are numbered
 * the same way.
 */
export const getBlogHeadings = (markdown: string): BlogHeading[] => {
  const slugger = new GithubSlugger();
  const headings: BlogHeading[] = [];
  let fence: string | undefined;

  for (const line of markdown.split("\n")) {
    const fenceMatch = line.match(FENCE);
    if (fenceMatch?.[1]) {
      const marker = fenceMatch[1];
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length)
        fence = undefined;
      continue;
    }
    if (fence) continue;

    const [, hashes, content] = line.match(HEADING) ?? [];
    if (!hashes || !content) continue;

    const text = toPlainText(content);
    const id = slugger.slug(text);
    const depth = hashes.length;
    if (depth === 2 || depth === 3) headings.push({ id, text, depth });
  }

  return headings;
};
