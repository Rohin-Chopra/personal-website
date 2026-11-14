import Link from "next/link";
import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

import { SITE_URL } from "@/lib/site";

type Props = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

const LINK_CLASS_NAME =
  "text-blue-600 transition-colors hover:text-blue-300 dark:text-blue-400";

const isExternal = (href: string) =>
  /^(https?:)?\/\//i.test(href) &&
  new URL(href, SITE_URL).origin !== new URL(SITE_URL).origin;

/**
 * External links open in a new tab, internal links use client-side
 * navigation and hash/mailto links stay plain anchors.
 */
export const MDXAnchor = ({
  href = "",
  children,
  className = LINK_CLASS_NAME,
  ...props
}: Props) => {
  if (isExternal(href)) {
    return (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
        <FaExternalLinkAlt
          aria-hidden
          className="ml-1 inline size-3 align-baseline"
        />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  if (!href.startsWith("/") && !/^https?:/i.test(href)) {
    return (
      <a {...props} href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link {...props} href={href} className={className}>
      {children}
    </Link>
  );
};
