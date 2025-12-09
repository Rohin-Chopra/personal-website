import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { all } from "lowlight";

import { mdxComponents } from "@/(subpages)/blogs/[slug]/mdx/components";
import { terraformSyntaxHighlighter } from "@/(subpages)/blogs/[slug]/mdx/terraformSyntaxHighlighter";
import type { Blog } from "@/types";

import "./draculaTheme.css";

type Props = {
  blog: Blog;
};

export const MDXBlogBody = ({ blog }: Props) => {
  return (
    <div className="prose dark:prose-invert prose-h2:mb-4 prose-h4:mb-3 prose-h5:mb-2 prose-h5:font-bold prose-h6:mb-1 prose-h6:font-semibold prose-p:mb-2 prose-p:text-lg prose-blockquote:border-l-primary prose-code:rounded prose-code:bg-slate-200 prose-code:p-1 prose-li:text-lg dark:text-zinc-200 prose-headings:dark:text-white prose-strong:dark:text-white prose-code:dark:bg-dracula prose-code:dark:text-white lg:max-w-none">
      <MDXRemote
        source={blog.body}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkFrontmatter],
            rehypePlugins: [
              [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rehypeHighlight as any,
                {
                  languages: {
                    ...all,
                    hcl: terraformSyntaxHighlighter,
                  },
                },
              ],
            ],
          },
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components={mdxComponents as any}
      />
    </div>
  );
};
