import { Link } from "@tanstack/react-router";
import { Rss } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

import { SOCIAL_LINKS } from "@/lib/site";

const social =
  "inline-flex size-9 items-center justify-center rounded-full border border-transparent text-muted transition-colors hover:border-line hover:text-accent";

export const SocialLinks = ({ className = "" }: { className?: string }) => (
  <ul className={`flex items-center gap-1 ${className}`}>
    <li>
      <a
        href={SOCIAL_LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub (opens in a new tab)"
        className={social}
      >
        <FaGithub aria-hidden className="size-[17px]" />
      </a>
    </li>
    <li>
      <a
        href={SOCIAL_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn (opens in a new tab)"
        className={social}
      >
        <FaLinkedin aria-hidden className="size-[17px]" />
      </a>
    </li>
    <li>
      <a href="/feed.xml" aria-label="RSS feed" className={social}>
        <Rss aria-hidden className="size-[17px]" strokeWidth={1.75} />
      </a>
    </li>
  </ul>
);

export const SiteFooter = () => (
  <footer className="mt-32 overflow-hidden border-t-2 border-ink">
    <div className="container-page grid gap-10 pt-10 text-sm text-muted sm:grid-cols-[1fr_auto_auto] sm:gap-16">
      <div className="max-w-sm space-y-2">
        <p className="label text-ink">Colophon</p>
        <p className="leading-relaxed">
          Set in Fraunces, Instrument Sans and JetBrains Mono. Built with
          TanStack Start, prerendered, and served from S3 through CloudFront.
        </p>
        <p className="font-mono text-xs">
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          Rohin Chopra
        </p>
      </div>
      <nav aria-label="Footer" className="space-y-2">
        <p className="label text-ink">Index</p>
        <ul className="space-y-1">
          <li>
            <Link to="/blogs" className="hover:text-accent">
              Writing
            </Link>
          </li>
          <li>
            <Link to="/projects" className="hover:text-accent">
              Projects
            </Link>
          </li>
          <li>
            <Link to="/" hash="contact" className="hover:text-accent">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
      <div className="space-y-2">
        <p className="label text-ink">Elsewhere</p>
        <SocialLinks className="-ml-2.5" />
      </div>
    </div>
    <p
      aria-hidden
      className="container-page mt-12 -mb-[0.12em] font-display text-[clamp(3rem,15vw,15rem)] leading-[0.8] tracking-[-0.045em] whitespace-nowrap select-none"
    >
      Rohin <span className="font-wonk text-accent">Chopra</span>
    </p>
  </footer>
);
