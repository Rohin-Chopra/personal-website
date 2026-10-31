import { act, render, screen } from "@testing-library/react";

import { useTheme } from "@/hooks/useTheme";
import { ThemeProvider, THEME_STORAGE_KEY } from "../ThemeContext";

const mockMatchMedia = (prefersDark: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: prefersDark,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

const ThemeConsumer = ({ id }: { id: string }) => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid={id}>{theme}</span>
      <button onClick={() => setTheme("light")}>light-{id}</button>
    </div>
  );
};

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    mockMatchMedia(true);
  });

  it("follows the system preference by default", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer id="a" />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("a")).toHaveTextContent("system");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("restores the stored preference", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    render(
      <ThemeProvider>
        <ThemeConsumer id="a" />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("a")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("shares and persists changes across all consumers", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer id="a" />
        <ThemeConsumer id="b" />
      </ThemeProvider>,
    );

    act(() => screen.getByText("light-a").click());

    expect(screen.getByTestId("a")).toHaveTextContent("light");
    expect(screen.getByTestId("b")).toHaveTextContent("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
