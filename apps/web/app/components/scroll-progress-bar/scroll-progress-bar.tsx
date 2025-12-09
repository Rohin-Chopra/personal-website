"use client";

import { useEffect, useState } from "react";

export const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const { documentElement } = document;

      const height =
        documentElement.scrollHeight - documentElement.clientHeight;

      setProgress((documentElement.scrollTop / height) * 100);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="fixed left-0 top-24 z-40 mb-4 h-1 w-full rounded-none bg-slate-100 dark:bg-slate-800">
      <div
        className="z-50 h-full bg-dark dark:bg-primary"
        style={{
          width: `${progress}%`,
        }}
      ></div>
    </div>
  );
};


