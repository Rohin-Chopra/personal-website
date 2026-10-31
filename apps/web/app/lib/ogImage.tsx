import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export const renderOgImage = ({ eyebrow, title, subtitle }: Props) =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "white",
          background:
            "linear-gradient(135deg, #000000 0%, #181823 55%, #5221E6 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#c4b5fd",
          }}
        >
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 50 ? 60 : 76,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 32,
                color: "#d4d4d8",
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>
          rohinchopra.com
        </div>
      </div>
    ),
    ogImageSize,
  );
