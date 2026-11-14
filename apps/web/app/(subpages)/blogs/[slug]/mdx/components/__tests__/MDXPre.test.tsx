import { act, fireEvent, render, screen } from "@testing-library/react";

import { MDXPre } from "../MDXPre";

describe("MDXPre", () => {
  const writeText = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.useFakeTimers();
    Object.assign(navigator, { clipboard: { writeText } });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("copies the code with an accessible button and announces it", async () => {
    render(
      <MDXPre>
        <code>echo hello</code>
      </MDXPre>,
    );

    const button = screen.getByRole("button", { name: "Copy code" });
    expect(button).toHaveAttribute("type", "button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeText).toHaveBeenCalledWith("echo hello");
    expect(screen.getByText("Copied")).toHaveAttribute("aria-live", "polite");

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
  });
});
