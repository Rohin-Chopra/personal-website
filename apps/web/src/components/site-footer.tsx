import { Link } from "@tanstack/react-router";
import { Rss } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

import { SITE_NAME, SOCIAL_LINKS } from "@/lib/site";

export const SocialLinks = ({ className = "" }: { className?: string }) => (
  <ul className={`flex items-center gap-1 ${className}`}>
    <li>
      <a
        href={SOCIAL_LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub (opens in a new tab)"
        className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink"
      >
        <FaGithub aria-hidden className="size-[18px]" />
      </a>
    </li>
    <li>
      <a
        href={SOCIAL_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn (opens in a new tab)"
        className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink"
      >
        <FaLinkedin aria-hidden className="size-[18px]" />
      </a>
    </li>
    <li>
      <a
        href="/feed.xml"
        aria-label="RSS feed"
        className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink"
      >
        <Rss aria-hidden className="size-[18px]" strokeWidth={1.75} />
      </a>
    </li>
  </ul>
);

export const SiteFooter = () => (
  <footer className="mt-24 border-t border-line">
    <div className="container-page flex flex-col gap-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="font-serif text-2xl text-ink italic">{SITE_NAME}</p>
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> ·
          Built with TanStack Start, served from AWS.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <nav aria-label="Footer" className="flex gap-4">
          <Link to="/blogs" className="hover:text-ink">
            Writing
          </Link>
          <Link to="/projects" className="hover:text-ink">
            Projects
          </Link>
        </nav>
        <SocialLinks />
      </div>
    </div>
  </footer>
);
