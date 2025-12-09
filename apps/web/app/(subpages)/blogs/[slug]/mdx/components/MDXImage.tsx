import type { ImageProps } from "next/image";
import Image from "next/image";

type Props = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

export const MDXImage = ({ src, alt = "" }: Props) => {
  if (!src) {
    throw new Error("src not provided");
  }

  let widthFromSrc = 550,
    heightFromSrc = 450;

  const url = new URL(src, "http://localhost.com");
  const widthParam = url.searchParams.get("w") || url.searchParams.get("width");
  const heightParam =
    url.searchParams.get("h") || url.searchParams.get("height");

  if (widthParam) {
    widthFromSrc = +widthParam;
  }
  if (heightParam) {
    heightFromSrc = +heightParam;
  }

  const imageProps: ImageProps = {
    src,
    alt: alt || "",
    height: heightFromSrc,
    width: widthFromSrc,
  };

  return <Image className="mx-auto" alt={alt || ""} {...imageProps} />;
};
