import { Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Info } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import {
  type ComponentProps,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

import { SITE_URL } from "@/lib/site";

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
  ...props
}: ComponentProps<"a">) => {
  if (isExternal(href)) {
    return (
      <a {...props} href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <ExternalLink
          aria-hidden
          className="ml-0.5 inline size-3.5 -translate-y-px align-baseline"
        />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link {...props} to={href}>
        {children}
      </Link>
    );
  }

  return (
    <a {...props} href={href}>
      {children}
    </a>
  );
};

const COPIED_MS = 1500;

export const MDXPre = ({ children, ...props }: ComponentProps<"pre">) => {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    const text = (ref.current?.querySelector("code") ?? ref.current)
      ?.textContent;
    if (!text || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard permission denied; nothing useful to do.
    }
  };

  return (
    <div className="group/code relative my-7">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-2.5 right-2.5 z-10 grid size-8 place-items-center rounded-sm border border-line bg-surface text-muted opacity-0 transition-all group-hover/code:opacity-100 hover:text-ink focus-visible:opacity-100"
      >
        {copied ? (
          <Check aria-hidden className="size-4 text-success" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
      <pre ref={ref} {...props} className={`${props.className ?? ""} pr-14`}>
        {children}
      </pre>
    </div>
  );
};

/** Images are sized at build time by the rehype-image-size plugin. */
export const MDXImage = ({
  src,
  alt = "",
  width,
  height,
}: ComponentProps<"img">) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    loading="lazy"
    decoding="async"
    className="h-auto max-w-full"
  />
);

export const BlogAlert = ({ children }: PropsWithChildren) => (
  <aside className="not-prose my-8 flex gap-3 border-l-2 border-accent bg-accent-soft py-4 pr-5 pl-4">
    <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
    <div className="space-y-1">{children}</div>
  </aside>
);

export const AlertTitle = ({ children }: PropsWithChildren) => (
  <p className="font-semibold">{children}</p>
);

export const BlogAlertDescription = ({ children }: PropsWithChildren) => (
  <div className="text-sm leading-relaxed text-muted [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2">
    {children}
  </div>
);

export const mdxComponents: MDXComponents = {
  a: MDXAnchor,
  pre: MDXPre,
  img: MDXImage,
  BlogAlert,
  AlertTitle,
  BlogAlertDescription,
};
