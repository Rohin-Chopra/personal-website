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
  `label border px-2.5 py-1.5 transition-colors ${
    active
      ? "border-ink bg-ink text-paper"
      : "border-line text-muted hover:border-accent hover:text-accent"
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
    <div className="mb-12 grid gap-5 lg:grid-cols-[22rem_1fr] lg:items-start lg:gap-10">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          aria-label={label}
          aria-describedby={statusId}
          placeholder={placeholder}
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          className="w-full border-b border-ink bg-transparent py-2.5 pr-10 pl-7 text-base placeholder:text-muted focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => changeQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-0 grid size-7 -translate-y-1/2 place-items-center text-muted hover:text-accent"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by tag"
        >
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

      <p
        id={statusId}
        aria-live="polite"
        className="label text-muted lg:col-span-2"
      >
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
