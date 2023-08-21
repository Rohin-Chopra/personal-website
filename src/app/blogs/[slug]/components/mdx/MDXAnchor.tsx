import Link, { type LinkProps } from "next/link";
import { AnchorHTMLAttributes, DetailedHTMLProps } from "react";

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
      className="text-blue-400 transition-colors hover:text-blue-300"
    >
      {children}
    </Link>
  );
};