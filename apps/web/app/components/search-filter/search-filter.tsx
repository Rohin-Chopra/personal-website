"use client";

import { MdSearch } from "react-icons/md";

type Props = {
  label: string;
  placeholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  tags: string[];
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  resultCount: number;
  noun: { singular: string; plural: string };
};

const chipClass = (active: boolean) =>
  `rounded-full px-4 py-1 text-sm font-medium transition-colors ${
    active
      ? "bg-primary text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
  }`;

export const SearchFilter = ({
  label,
  placeholder,
  query,
  onQueryChange,
  tags,
  selectedTag,
  onTagChange,
  resultCount,
  noun,
}: Props) => (
  <div className="mb-8 space-y-4">
    <div className="relative">
      <MdSearch
        aria-hidden
        className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary focus:outline-hidden dark:border-gray-600 dark:bg-darkGray dark:text-white"
      />
    </div>

    {tags.length > 0 && (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={selectedTag === null}
          onClick={() => onTagChange(null)}
          className={chipClass(selectedTag === null)}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={selectedTag === tag}
            onClick={() => onTagChange(tag)}
            className={chipClass(selectedTag === tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    )}

    <p aria-live="polite" className="text-sm text-gray-600 dark:text-gray-400">
      {resultCount} {resultCount === 1 ? noun.singular : noun.plural} found
    </p>
  </div>
);
