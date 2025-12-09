import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Rohin Chopra",
    template: "%s | Rohin Chopra",
  },
  description:
    "Rohin Chopra is a Software Engineer who excels in architecting, designing and developing robust and scalable solutions",
  openGraph: {
    title: "Rohin Chopra",
    description:
      "Rohin Chopra is a Software Engineer who excels in architecting, designing and developing robust and scalable solutions",
    url: "https://rohinchopra.com",
    siteName: "Rohin Chopra's personal site",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "Rohin Chopra",
    description:
      "Rohin Chopra is a Software Engineer who excels in architecting ,designing and developing robust and scalable solutions",
    images: [
      "https://www.rohinchopra.com/_next/image?url=%2Fhero.png&w=640&q=75",
    ],
    card: "summary_large_image",
  },
};

type Props = {
  children: JSX.Element;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className="dark ">
        <div className="dark:bg-dark">
          <Navbar />
          {children}
          <Toaster />
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
