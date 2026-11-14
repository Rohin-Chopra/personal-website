import type { BlogHeading } from "./headings.ts";

export type PostSummary = {
  title: string;
  slug: string;
  description: string;
  /** ISO date (YYYY-MM-DD) */
  createdAt: string;
  /** ISO date (YYYY-MM-DD) */
  updatedAt?: string;
  tags: string[];
  readingTime: number;
  draft: boolean;
};

export type Post = PostSummary & {
  headings: BlogHeading[];
};

export type Project = {
  title: string;
  link: string;
  imgUrl: string;
  description: string;
  technologies: string[];
  github?: string;
};
