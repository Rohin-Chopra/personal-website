import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const require = createRequire(import.meta.url);

const font = (pkg: string, file: string) =>
  readFile(require.resolve(`${pkg}/files/${file}`));

const fonts = Promise.all([
  font("@fontsource/geist", "geist-latin-400-normal.woff"),
  font("@fontsource/geist", "geist-latin-600-normal.woff"),
  font(
    "@fontsource/instrument-serif",
    "instrument-serif-latin-400-normal.woff",
  ),
]).then(([regular, semibold, serif]) => [
  {
    name: "Geist",
    data: regular,
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Geist",
    data: semibold,
    weight: 600 as const,
    style: "normal" as const,
  },
  {
    name: "Instrument Serif",
    data: serif,
    weight: 400 as const,
    style: "normal" as const,
  },
]);

const WIDTH = 1200;
const HEIGHT = 630;

type Options = { eyebrow: string; title: string; subtitle?: string };

// Satori takes a React-element-shaped tree; plain objects avoid needing JSX here.
const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
) => ({
  type,
  props: { style: { display: "flex", ...style }, children },
});

export const renderOgImage = async ({ eyebrow, title, subtitle }: Options) => {
  const tree = el(
    "div",
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px 80px",
      backgroundColor: "#141218",
      backgroundImage:
        "radial-gradient(circle at 92% 0%, rgba(124, 98, 255, 0.45), transparent 55%), radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
      backgroundSize: "100% 100%, 26px 26px",
      color: "#ecebf0",
      fontFamily: "Geist",
    },
    [
      el("div", { alignItems: "center", gap: 18 }, [
        el(
          "div",
          {
            width: 52,
            height: 52,
            borderRadius: 12,
            backgroundColor: "#ecebf0",
            color: "#141218",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Instrument Serif",
            fontSize: 30,
          },
          "rc",
        ),
        el(
          "div",
          {
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#a99cff",
          },
          eyebrow,
        ),
      ]),
      el("div", { flexDirection: "column" }, [
        el(
          "div",
          {
            fontFamily: "Instrument Serif",
            fontSize: title.length > 60 ? 64 : 80,
            lineHeight: 1.02,
            letterSpacing: -1,
          },
          title,
        ),
        ...(subtitle
          ? [
              el(
                "div",
                {
                  marginTop: 26,
                  fontSize: 30,
                  lineHeight: 1.35,
                  color: "#a6a3b3",
                  maxWidth: 980,
                },
                subtitle,
              ),
            ]
          : []),
      ]),
      el(
        "div",
        { justifyContent: "space-between", fontSize: 24, color: "#8b879a" },
        [el("div", {}, "Rohin Chopra"), el("div", {}, "rohinchopra.com")],
      ),
    ],
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: await fonts,
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    .render()
    .asPng();
};
