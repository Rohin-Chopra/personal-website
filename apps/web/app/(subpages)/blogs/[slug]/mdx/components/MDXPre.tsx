"use client";

import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { useRef, useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa";

export const MDXPre = ({
  children,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
  raw?: string;
}) => {
  const ref = useRef<HTMLPreElement>(null);
  const [isActive, setIsActive] = useState(false);

  const handleClick = async () => {
    if (!navigator.clipboard) {
      console.warn("Clipboard not supported");
      return;
    }

    const codeElement = ref.current?.querySelector("code");

    if (!codeElement) return;

    await navigator.clipboard.writeText(codeElement.innerText);

    setIsActive(true);

    setTimeout(() => {
      setIsActive(false);
    }, 300);
  };

  return (
    <pre className="relative bg-dracula" {...props} ref={ref}>
      <div className="relative">
        <div
          className="absolute right-0 pr-4 pl-2 text-xl transition-all duration-300"
          onClick={handleClick}
        >
          <div>
            {isActive ? (
              <FaCheck className="cursor-pointer text-green-400" />
            ) : (
              <FaCopy className="cursor-pointer text-slate-600 hover:text-slate-400 dark:text-white" />
            )}
          </div>
        </div>
        {children}
      </div>
    </pre>
  );
};
