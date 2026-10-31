import { notFound } from "next/navigation";

import { getBlog } from "@/lib/getBlog";
import { getBlogs } from "@/lib/getBlogs";
import { ogImageSize, renderOgImage } from "@/lib/ogImage";

export const alt = "Blog post by Rohin Chopra";
export const size = ogImageSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  const posts = await getBlogs();
  return posts.map((post) => ({ slug: post.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) notFound();

  return renderOgImage({
    eyebrow: "Rohin Chopra · Blog",
    title: blog.title,
    subtitle: blog.description,
  });
}
