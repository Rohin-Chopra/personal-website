"use client";

import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa";

import { cn } from "@/lib/utils";

const COPIED_DURATION_MS = 1500;

export const MDXPre = ({
  children,
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>) => {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    const text = (ref.current?.querySelector("code") ?? ref.current)
      ?.textContent;
    if (!text || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.warn("Couldn't copy code", error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-2 right-2 z-10 rounded-sm bg-dracula p-2 text-lg text-white/70 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-blue-400"
      >
        {copied ? (
          <FaCheck aria-hidden className="text-green-400" />
        ) : (
          <FaCopy aria-hidden />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
      <pre ref={ref} className={cn("bg-dracula pr-14", className)} {...props}>
        {children}
      </pre>
    </div>
  );
};
