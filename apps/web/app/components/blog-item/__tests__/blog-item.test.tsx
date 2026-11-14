import { render, screen } from "@testing-library/react";
import { BlogItem } from "../blog-item";
import type { BlogSummary } from "@/types";

const mockBlog: BlogSummary = {
  slug: "test-blog",
  title: "Test Blog Post",
  description: "This is a test blog post description",
  createdAt: "2024-01-01",
};

describe("BlogItem", () => {
  it("renders blog title and description", () => {
    render(<BlogItem blog={mockBlog} />);

    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test blog post description"),
    ).toBeInTheDocument();
    expect(screen.getByText("January 1, 2024")).toBeInTheDocument();
  });

  it("renders link with correct href", () => {
    render(<BlogItem blog={mockBlog} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blogs/test-blog");
  });
});
