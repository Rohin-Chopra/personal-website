import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitcher } from "../theme-switcher";

// Mock the useTheme hook
jest.mock("@/hooks/useTheme", () => ({
  useTheme: jest.fn(() => ({
    theme: "dark",
    setTheme: jest.fn(),
  })),
}));

describe("ThemeSwitcher", () => {
  it("renders theme switcher button", () => {
    render(<ThemeSwitcher />);

    const button = screen.getByRole("button", { name: /change theme/i });
    expect(button).toBeInTheDocument();
  });

  it("calls setTheme when theme option is clicked", async () => {
    const user = userEvent.setup();
    const { useTheme } = require("@/hooks/useTheme");
    const mockSetTheme = jest.fn();
    
    useTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitcher />);

    const button = screen.getByRole("button", { name: /change theme/i });
    await user.click(button);

    // Menu should be visible after click
    const lightOption = screen.getByText(/light/i);
    await user.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});

