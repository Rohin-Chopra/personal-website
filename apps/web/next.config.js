const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const isDev = process.env.NODE_ENV === "development";

// `'unsafe-inline'` stays in script-src: statically rendered App Router pages
// stream the RSC payload through per-page inline scripts, which a hash can't
// cover, and nonces would force every page to render dynamically.
// `'unsafe-eval'` is only needed by the dev server (React Refresh).

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // ESM-only; listing it also makes next/jest transform it for tests.
  transpilePackages: ["github-slugger"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://vercel.live https://va.vercel-scripts.com https://challenges.cloudflare.com`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "frame-src 'self' https://challenges.cloudflare.com https://vercel.live",
              "connect-src 'self' https://*.vercel-scripts.com https://*.vercel-insights.com https://api.rohinchopra.com",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      // Cache static assets
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache Next.js static files
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache API routes with shorter TTL
      {
        source: "/feed.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
