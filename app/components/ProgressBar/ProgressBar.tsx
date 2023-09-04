"use client";

import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export const ProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      // This will calculate how many pixels the page is vertically
      const winScroll = document.documentElement.scrollTop;
      // This is responsible for subtracticing the total height of the page - where the users page is scrolled to
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      // This will calculate the final total of the percentage of how much the user has scrolled.
      const scrolled = (winScroll / height) * 100;

      console.log(scrolled);
      setProgress(scrolled);
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
