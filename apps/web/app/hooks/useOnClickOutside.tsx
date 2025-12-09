import type { RefObject } from "react";
import { useEffect, useCallback } from "react";

type Callback = (event?: MouseEvent) => void;

export const useOnClickOutside = (
  ref: RefObject<HTMLDivElement>,
  callback: Callback
): void => {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      memoizedCallback(event);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref, memoizedCallback]);
};
