import { Link } from "@tanstack/react-router";

import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { to: "/blogs", label: "Writing", n: "01" },
  { to: "/projects", label: "Projects", n: "02" },
] as const;

const navLink =
  "group relative inline-flex items-baseline gap-1.5 px-1.5 py-2 text-[13px] font-medium text-muted transition-colors hover:text-ink data-[status=active]:text-ink sm:px-3";

const Num = ({ n }: { n: string }) => (
  <span
    aria-hidden
    className="hidden font-mono text-[10px] text-accent sm:inline"
  >
    {n}
  </span>
);

export const SiteHeader = () => (
  <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
    <nav
      aria-label="Main"
      className="container-page flex h-16 items-center justify-between gap-4"
    >
      <Link
        to="/"
        className="group flex shrink-0 items-baseline gap-1 text-lg sm:text-xl"
        aria-label="Rohin Chopra, home"
      >
        <span className="font-display">Rohin</span>
        <span className="font-display font-wonk text-accent transition-transform duration-300 group-hover:-rotate-6">
          Chopra
        </span>
        <span
          aria-hidden
          className="ml-0.5 size-1.5 self-center rounded-full bg-accent transition-transform duration-300 group-hover:scale-150"
        />
      </Link>

      <div className="flex items-center">
        {NAV.map(({ to, label, n }) => (
          <Link key={to} to={to} className={navLink}>
            <Num n={n} />
            {label}
            <span
              aria-hidden
              className="absolute inset-x-1.5 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100 group-data-[status=active]:scale-x-100 sm:inset-x-3"
            />
          </Link>
        ))}
        <Link to="/" hash="contact" className={navLink}>
          <Num n="03" />
          Contact
        </Link>
        <span aria-hidden className="mx-1 h-5 w-px bg-line sm:mx-2" />
        <ThemeToggle />
      </div>
    </nav>
  </header>
);
