import type { RefObject } from "react";
import { useEffect, useRef } from "react";

type Callback = (event?: MouseEvent) => void;

export const useOnClickOutside = (
  ref: RefObject<HTMLDivElement>,
  callback: Callback
): void => {
  const callbackRef = useRef(callback);

  // Update the ref whenever callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      callbackRef.current(event);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref]);
};
