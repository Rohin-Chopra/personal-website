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

  if (typeof src !== "string") {
    throw new Error("src must be a string");
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

  // Strip query string from src since we've extracted width/height
  const cleanSrc = src.split("?")[0];

  const imageProps: ImageProps = {
    src: cleanSrc,
    alt: alt || "",
    height: heightFromSrc,
    width: widthFromSrc,
    loading: "lazy",
  };

  return <Image className="mx-auto" {...imageProps} />;
};
