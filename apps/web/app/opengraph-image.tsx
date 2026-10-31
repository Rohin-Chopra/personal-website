import { ogImageSize, renderOgImage } from "@/lib/ogImage";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Senior Software Engineer",
    title: "I'm Rohin Chopra.",
    subtitle:
      "Architecting, designing and developing robust and scalable solutions.",
  });
}
