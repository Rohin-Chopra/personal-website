"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";

export type Theme = "dark" | "light" | "system";

export const THEME_STORAGE_KEY = "theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const isTheme = (value: unknown): value is Theme =>
  value === "dark" || value === "light" || value === "system";

const applyTheme = (theme: Theme) => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
};

/**
 * Runs before first paint (see layout) so the correct theme is applied
 * without a flash of the wrong colour scheme.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

const THEME_CHANGE_EVENT = "theme-change";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
};

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : "system";
};

// The server cannot know the stored preference, so it always renders "system".
const getServerTheme = (): Theme => "system";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const theme = useSyncExternalStore(subscribe, getStoredTheme, getServerTheme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
