import { Item } from "@radix-ui/react-dropdown-menu";
import { forwardRef } from "react";
import {
  MdComputer,
  MdDarkMode,
  MdLightMode,
  MdOutlineDarkMode,
} from "react-icons/md";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

const ThemeSwitcherMenuItem = forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item> & {
    inset?: boolean;
  }
>(({ ...props }, ref) => (
  <DropdownMenuItem
    ref={ref}
    className="flex cursor-pointer justify-between px-3"
    {...props}
  />
));
ThemeSwitcherMenuItem.displayName = Item.displayName;

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const setThemeToDark = () => {
    setTheme("dark");
  };

  const setThemeToLight = () => {
    setTheme("light");
  };

  const setThemeToSystem = () => {
    setTheme("system");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="align-middle text-3xl md:text-2xl"
        aria-label="Change Theme"
      >
        {theme === "dark" && <MdDarkMode />}

        {theme === "light" && <MdLightMode />}

        {theme === "system" && <MdOutlineDarkMode />}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ThemeSwitcherMenuItem onClick={setThemeToDark}>
          Dark <MdDarkMode className="text-lg" />
        </ThemeSwitcherMenuItem>
        <ThemeSwitcherMenuItem onClick={setThemeToLight}>
          Light <MdLightMode className="text-lg" />
        </ThemeSwitcherMenuItem>
        <ThemeSwitcherMenuItem onClick={setThemeToSystem}>
          System <MdComputer className="text-lg" />
        </ThemeSwitcherMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};



