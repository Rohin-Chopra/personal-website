"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type Options<T> = {
  items: T[];
  getTags: (item: T) => string[] | undefined;
  getSearchText: (item: T) => (string | undefined)[];
  /** Query string key for the selected tag, e.g. `tag` or `tech`. */
  tagParam: string;
};

/**
 * Search + single-tag filter whose state lives in the URL (`?q=...&tag=...`)
 * so filtered views survive a refresh and can be shared.
 */
export function useSearchFilter<T>({
  items,
  getTags,
  getSearchText,
  tagParam,
}: Options<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQueryState] = useState(() => searchParams.get("q") ?? "");

  const tags = useMemo(
    () =>
      Array.from(new Set(items.flatMap((item) => getTags(item) ?? []))).sort(),
    [items, getTags],
  );

  const tagFromUrl = searchParams.get(tagParam);
  const selectedTag =
    tagFromUrl && tags.includes(tagFromUrl) ? tagFromUrl : null;

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);
      updateParam("q", value.trim() ? value : null);
    },
    [updateParam],
  );

  const setSelectedTag = useCallback(
    (tag: string | null) => updateParam(tagParam, tag),
    [tagParam, updateParam],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedTag && !getTags(item)?.includes(selectedTag)) return false;
      if (!needle) return true;
      return [...getSearchText(item), ...(getTags(item) ?? [])].some((text) =>
        text?.toLowerCase().includes(needle),
      );
    });
  }, [items, query, selectedTag, getTags, getSearchText]);

  return { query, setQuery, tags, selectedTag, setSelectedTag, filtered };
}
