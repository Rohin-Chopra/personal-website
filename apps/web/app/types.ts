export interface Blog {
  title: string;
  slug: string;
  description: string;
  createdAt: string;
  body: string;
  tags?: string[];
  readingTime?: number;
}
