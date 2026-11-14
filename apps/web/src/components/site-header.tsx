import { Link } from "@tanstack/react-router";

import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { to: "/blogs", label: "Writing" },
  { to: "/projects", label: "Projects" },
] as const;

export const SiteHeader = () => (
  <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-xl supports-[backdrop-filter]:bg-paper/65">
    <nav
      aria-label="Main"
      className="container-page flex h-16 items-center justify-between gap-4"
    >
      <Link
        to="/"
        className="group flex items-center gap-2.5 font-medium tracking-tight"
        aria-label="Rohin Chopra, home"
      >
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-lg bg-ink font-serif text-lg text-paper italic transition-colors group-hover:bg-accent group-hover:text-accent-ink"
        >
          rc
        </span>
        <span className="hidden sm:inline">Rohin Chopra</span>
      </Link>

      <div className="flex items-center gap-1 text-sm">
        {NAV.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="rounded-full px-3 py-1.5 text-muted transition-colors hover:text-ink data-[status=active]:bg-accent-soft data-[status=active]:text-ink"
          >
            {label}
          </Link>
        ))}
        <Link
          to="/"
          hash="contact"
          className="rounded-full px-3 py-1.5 text-muted transition-colors hover:text-ink"
        >
          Contact
        </Link>
        <span aria-hidden className="mx-1 h-5 w-px bg-line" />
        <ThemeToggle />
      </div>
    </nav>
  </header>
);
