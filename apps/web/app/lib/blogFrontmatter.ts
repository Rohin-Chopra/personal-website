import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// YAML parses unquoted `2024-04-12` into a Date, quoted values stay strings.
const isoDate = z
  .union([z.date(), z.string().regex(ISO_DATE, "Use an ISO date (YYYY-MM-DD)")])
  .transform((value, ctx) => {
    const date = value instanceof Date ? value : new Date(`${value}T00:00:00Z`);
    const iso = Number.isNaN(date.getTime())
      ? undefined
      : date.toISOString().slice(0, 10);
    // `new Date` rolls impossible days over (2024-02-30 -> 2024-03-01).
    if (!iso || (typeof value === "string" && iso !== value)) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return iso;
  });

export const blogFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    slug: z
      .string()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers and hyphens",
      ),
    createdAt: isoDate,
    updatedAt: isoDate.optional(),
    tags: z
      .union([z.string(), z.array(z.string())])
      .transform((tags) => (Array.isArray(tags) ? tags : [tags]))
      .optional(),
    draft: z.boolean().default(false),
  })
  .strict();

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

export const parseBlogFrontmatter = (
  data: unknown,
  file: string,
): BlogFrontmatter => {
  const result = blogFrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in ${file}:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
};

/** Parses an ISO date (YYYY-MM-DD) from frontmatter as UTC midnight. */
export const toBlogDate = (isoDate: string): Date =>
  new Date(`${isoDate}T00:00:00Z`);

const displayDateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const formatBlogDate = (isoDate: string): string =>
  displayDateFormat.format(toBlogDate(isoDate));
