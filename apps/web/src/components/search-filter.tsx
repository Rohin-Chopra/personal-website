import { Search, X } from "lucide-react";
import { useId, useState } from "react";

type Props = {
  label: string;
  placeholder: string;
  /**
   * Read once on mount. Pages remount this component after hydration (via
   * `key`) so the input picks up `?q=` without a hydration mismatch.
   */
  initialQuery: string;
  onQueryChange: (query: string) => void;
  tags: string[];
  selectedTag: string | undefined;
  onTagChange: (tag: string | undefined) => void;
  resultCount: number;
  noun: { singular: string; plural: string };
};

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
    active
      ? "border-accent bg-accent text-accent-ink"
      : "border-line text-muted hover:border-ink/30 hover:text-ink"
  }`;

export const SearchFilter = ({
  label,
  placeholder,
  initialQuery,
  onQueryChange,
  tags,
  selectedTag,
  onTagChange,
  resultCount,
  noun,
}: Props) => {
  const statusId = useId();
  // Local state keeps typing responsive; the URL is updated alongside.
  const [query, setQuery] = useState(initialQuery);
  const changeQuery = (next: string) => {
    setQuery(next);
    onQueryChange(next);
  };

  return (
    <div className="mb-10 space-y-4">
      <div className="relative max-w-xl">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          aria-label={label}
          aria-describedby={statusId}
          placeholder={placeholder}
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          className="w-full rounded-full border border-line bg-surface py-2.5 pr-10 pl-10 text-sm placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => changeQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-accent-soft hover:text-ink"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
          <button
            type="button"
            aria-pressed={selectedTag === undefined}
            onClick={() => onTagChange(undefined)}
            className={chip(selectedTag === undefined)}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={selectedTag === tag}
              onClick={() => onTagChange(selectedTag === tag ? undefined : tag)}
              className={chip(selectedTag === tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <p id={statusId} aria-live="polite" className="font-mono text-xs text-muted">
        {resultCount} {resultCount === 1 ? noun.singular : noun.plural} found
      </p>
    </div>
  );
};

/** Items matching the query (title/description/tags) and the selected tag. */
export const filterItems = <T,>(
  items: T[],
  {
    query,
    tag,
    getTags,
    getText,
  }: {
    query: string;
    tag: string | undefined;
    getTags: (item: T) => string[];
    getText: (item: T) => string[];
  },
) => {
  const needle = query.trim().toLowerCase();
  return items.filter((item) => {
    if (tag && !getTags(item).includes(tag)) return false;
    if (!needle) return true;
    return [...getText(item), ...getTags(item)].some((text) =>
      text.toLowerCase().includes(needle),
    );
  });
};
