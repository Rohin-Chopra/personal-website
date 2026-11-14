import { join } from "node:path";
import { cwd } from "node:process";
import sharp from "sharp";

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const collectImages = (node: HastNode, images: HastNode[] = []) => {
  if (node.type === "element" && node.tagName === "img") images.push(node);
  node.children?.forEach((child) => collectImages(child, images));
  return images;
};

const readSize = async (src: string) => {
  const { width, height } = await sharp(
    join(cwd(), "public", decodeURIComponent(src)),
  ).metadata();
  if (!width || !height) throw new Error(`Couldn't read the size of ${src}`);
  return { width, height };
};

/**
 * Adds the intrinsic `width` and `height` of local images (served from
 * `public/`) so `next/image` reserves the right aspect ratio. A `?w=`/`?h=`
 * query on the src overrides them; with only one given, the other keeps the
 * image's aspect ratio.
 */
export const rehypeImageSize = () => async (tree: HastNode) => {
  await Promise.all(
    collectImages(tree).map(async (node) => {
      const properties = (node.properties ??= {});
      const src = properties.src;
      if (typeof src !== "string" || !src.startsWith("/")) return;

      const url = new URL(src, "http://localhost");
      const size = await readSize(url.pathname);
      const widthParam = Number(
        url.searchParams.get("w") ?? url.searchParams.get("width"),
      );
      const heightParam = Number(
        url.searchParams.get("h") ?? url.searchParams.get("height"),
      );

      let { width, height } = size;
      if (widthParam && heightParam) {
        [width, height] = [widthParam, heightParam];
      } else if (widthParam) {
        [width, height] = [
          widthParam,
          Math.round((widthParam * size.height) / size.width),
        ];
      } else if (heightParam) {
        [width, height] = [
          Math.round((heightParam * size.width) / size.height),
          heightParam,
        ];
      }

      properties.src = url.pathname;
      properties.width = width;
      properties.height = height;
    }),
  );
};
