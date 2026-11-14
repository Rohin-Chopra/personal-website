import { act, renderHook } from "@testing-library/react";

import { useSearchFilter } from "../use-search-filter";

const replace = jest.fn();
let searchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/blogs",
  useSearchParams: () => searchParams,
}));

type Item = { title: string; tags: string[] };
const items: Item[] = [
  { title: "ECS autoscaling", tags: ["AWS", "ECS"] },
  { title: "Image optimization", tags: ["AWS", "Lambda"] },
];
const getTags = (item: Item) => item.tags;
const getSearchText = (item: Item) => [item.title];

const setup = () =>
  renderHook(() =>
    useSearchFilter({ items, getTags, getSearchText, tagParam: "tag" }),
  );

describe("useSearchFilter", () => {
  beforeEach(() => {
    replace.mockClear();
    searchParams = new URLSearchParams();
  });

  it("reads the initial query and tag from the URL", () => {
    searchParams = new URLSearchParams("q=image&tag=AWS");
    const { result } = setup();

    expect(result.current.query).toBe("image");
    expect(result.current.selectedTag).toBe("AWS");
    expect(result.current.filtered.map((i) => i.title)).toEqual([
      "Image optimization",
    ]);
  });

  it("ignores a tag that no item has", () => {
    searchParams = new URLSearchParams("tag=Nope");
    const { result } = setup();

    expect(result.current.selectedTag).toBeNull();
    expect(result.current.filtered).toHaveLength(2);
  });

  it("writes the query to the URL and drops it when cleared", () => {
    searchParams = new URLSearchParams("tag=AWS");
    const { result } = setup();

    act(() => result.current.setQuery("ecs"));
    expect(replace).toHaveBeenLastCalledWith("/blogs?tag=AWS&q=ecs", {
      scroll: false,
    });
    expect(result.current.filtered.map((i) => i.title)).toEqual([
      "ECS autoscaling",
    ]);

    act(() => result.current.setQuery("  "));
    expect(replace).toHaveBeenLastCalledWith("/blogs?tag=AWS", {
      scroll: false,
    });
  });

  it("writes the selected tag to the URL", () => {
    const { result } = setup();

    act(() => result.current.setSelectedTag("Lambda"));
    expect(replace).toHaveBeenLastCalledWith("/blogs?tag=Lambda", {
      scroll: false,
    });

    act(() => result.current.setSelectedTag(null));
    expect(replace).toHaveBeenLastCalledWith("/blogs", { scroll: false });
  });

  it("matches the search query against tags", () => {
    const { result } = setup();
    act(() => result.current.setQuery("lambda"));
    expect(result.current.filtered.map((i) => i.title)).toEqual([
      "Image optimization",
    ]);
  });
});
