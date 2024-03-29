import type { LinkProps } from "next/link";
import Link from "next/link";
import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";

export const MDXAnchor = ({
  children,
  ...props
}: DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>) => {
  return (
    <Link
      {...(props as LinkProps)}
      target="_blank"
      rel="noopener noreferrer"
      href={props.href || ""}
      className="text-blue-600 transition-colors hover:text-blue-300 dark:text-blue-400"
    >
      {children}
    </Link>
  );
};
