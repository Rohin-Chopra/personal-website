import { Monitor, Moon, Sun } from "lucide-react";

import { type Theme, useTheme } from "@/lib/theme";

const NEXT: Record<Theme, Theme> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

/** Cycles system -> light -> dark. */
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const Icon = ICONS[theme];
  const next = NEXT[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink"
      aria-label={`Theme: ${theme}. Switch to ${next}`}
      title={`Theme: ${theme}`}
    >
      <Icon aria-hidden className="size-[18px]" strokeWidth={1.75} />
    </button>
  );
};
