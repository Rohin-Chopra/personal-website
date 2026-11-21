import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const require = createRequire(import.meta.url);

const font = (pkg: string, file: string) =>
  readFile(require.resolve(`${pkg}/files/${file}`));

const fonts = Promise.all([
  font("@fontsource/instrument-sans", "instrument-sans-latin-400-normal.woff"),
  font("@fontsource/fraunces", "fraunces-latin-300-normal.woff"),
  font("@fontsource/fraunces", "fraunces-latin-400-italic.woff"),
  font("@fontsource/jetbrains-mono", "jetbrains-mono-latin-400-normal.woff"),
]).then(([sans, serif, serifItalic, mono]) => [
  {
    name: "Instrument Sans",
    data: sans,
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Fraunces",
    data: serif,
    weight: 300 as const,
    style: "normal" as const,
  },
  {
    name: "Fraunces",
    data: serifItalic,
    weight: 400 as const,
    style: "italic" as const,
  },
  {
    name: "JetBrains Mono",
    data: mono,
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

const PAPER = "#f4efe6";
const INK = "#2a241e";
const MUTED = "#7a6f63";
const ACCENT = "#d9481f";

export const renderOgImage = async ({ eyebrow, title, subtitle }: Options) => {
  const tree = el(
    "div",
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "64px 80px 56px",
      backgroundColor: PAPER,
      backgroundImage:
        "linear-gradient(rgba(42,36,30,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(42,36,30,0.06) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
      color: INK,
      fontFamily: "Instrument Sans",
    },
    [
      el(
        "div",
        {
          justifyContent: "space-between",
          borderTop: `4px solid ${INK}`,
          paddingTop: 16,
          fontFamily: "JetBrains Mono",
          fontSize: 20,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: MUTED,
        },
        [
          el("div", { color: ACCENT }, eyebrow),
          el("div", {}, "rohinchopra.com"),
        ],
      ),
      el("div", { flexDirection: "column" }, [
        el(
          "div",
          {
            fontFamily: "Fraunces",
            fontWeight: 300,
            fontSize: title.length > 60 ? 66 : 84,
            lineHeight: 1,
            letterSpacing: -2,
          },
          title,
        ),
        ...(subtitle
          ? [
              el(
                "div",
                {
                  marginTop: 28,
                  fontSize: 28,
                  lineHeight: 1.4,
                  color: MUTED,
                  maxWidth: 960,
                },
                subtitle,
              ),
            ]
          : []),
      ]),
      el(
        "div",
        { alignItems: "baseline", fontSize: 40, fontFamily: "Fraunces" },
        [
          el("div", { fontWeight: 300, marginRight: 12 }, "Rohin"),
          el("div", { fontStyle: "italic", color: ACCENT }, "Chopra"),
        ],
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
