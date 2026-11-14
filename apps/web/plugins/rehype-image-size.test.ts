// @vitest-environment node
import { rehypeImageSize } from "./rehype-image-size.ts";

// public/blogs/sentimental-analysis/result.png is 800×313.
const SRC = "/blogs/sentimental-analysis/result.png";

const run = async (src: string) => {
  const img = { type: "element", tagName: "img", properties: { src } };
  await rehypeImageSize()({
    type: "root",
    children: [{ type: "element", tagName: "p", children: [img] }],
  });
  return img.properties;
};

describe("rehypeImageSize", () => {
  it("adds the intrinsic size of local images", async () => {
    expect(await run(SRC)).toEqual({ src: SRC, width: 800, height: 313 });
  });

  it("lets ?w= override the width and keeps the aspect ratio", async () => {
    expect(await run(`${SRC}?w=400`)).toEqual({
      src: SRC,
      width: 400,
      height: 157,
    });
  });

  it("uses both ?width= and ?height= when given", async () => {
    expect(await run(`${SRC}?width=700&height=270`)).toEqual({
      src: SRC,
      width: 700,
      height: 270,
    });
  });

  it("leaves external images alone", async () => {
    expect(await run("https://example.com/a.png")).toEqual({
      src: "https://example.com/a.png",
    });
  });
});
