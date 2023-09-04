"use client";

import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export const ProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const { documentElement } = document;

      const height =
        documentElement.scrollHeight - documentElement.clientHeight;

      setProgress((documentElement.scrollTop / height) * 100);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Progress
      value={progress}
      className="fixed left-0 top-24 z-50 mb-4 h-1 w-full rounded-none bg-transparent"
    />
  );
};
