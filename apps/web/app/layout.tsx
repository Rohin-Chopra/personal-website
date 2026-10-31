import type { Metadata, Viewport } from "next";
import { Josefin_Sans, Roboto } from "next/font/google";
import type { ReactNode } from "react";

import { ErrorBoundary } from "@/components/error-boundary/error-boundary";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { WebVitals } from "@/components/web-vitals";
import { ThemeProvider, themeInitScript } from "@/context/ThemeContext";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-josefin",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "Rohin Chopra's personal site",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5221E6" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html
      lang="en"
      className={`dark ${josefin.variable} ${roboto.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <ErrorBoundary>
            <div className="dark:bg-dark">
              <Navbar />
              <div id="main-content">{children}</div>
              <Toaster />
              <Footer />
            </div>
            <Analytics />
            <WebVitals />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
