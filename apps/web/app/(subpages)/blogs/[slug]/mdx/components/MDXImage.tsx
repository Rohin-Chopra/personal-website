import Image from "next/image";

type Props = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

// The post column is `lg:w-2xl` (42rem) and full width below that.
const SIZES = "(min-width: 1024px) 42rem, 100vw";

/** Renders MDX images. `rehypeImageSize` fills in `width`/`height`. */
export const MDXImage = ({ src, alt = "", width, height }: Props) => {
  if (typeof src !== "string" || !src) {
    throw new Error("MDX image src must be a non-empty string");
  }

  if (!width || !height) {
    throw new Error(
      `Missing dimensions for ${src}. Add ?w=&h= to external image URLs.`,
    );
  }

  return (
    <Image
      className="mx-auto h-auto max-w-full"
      src={src}
      alt={alt}
      width={Number(width)}
      height={Number(height)}
      sizes={SIZES}
    />
  );
};
