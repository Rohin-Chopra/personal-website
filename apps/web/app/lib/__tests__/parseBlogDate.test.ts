import { parseBlogDate } from "../parseBlogDate";

describe("parseBlogDate", () => {
  it.each([
    ["August 20th, 2023", "2023-08-20"],
    ["August 5th, 2023", "2023-08-05"],
    ["March 1st, 2024", "2024-03-01"],
    ["May 2nd, 2024", "2024-05-02"],
    ["June 3rd, 2024", "2024-06-03"],
    ["April 12, 2024", "2024-04-12"],
  ])("parses %s", (input, expected) => {
    const date = parseBlogDate(input);
    expect(Number.isNaN(date.getTime())).toBe(false);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    expect(iso).toBe(expected);
  });
});
