export interface BlogSummary {
  title: string;
  slug: string;
  description: string;
  /** ISO date (YYYY-MM-DD) */
  createdAt: string;
  /** ISO date (YYYY-MM-DD) */
  updatedAt?: string;
  tags?: string[];
  readingTime?: number;
  draft?: boolean;
}

export interface Blog extends BlogSummary {
  body: string;
}
