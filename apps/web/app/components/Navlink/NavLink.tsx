import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  href: string;
  className?: string;
  activeClassName?: string;
};

const NavLink = ({
  href,
  children,
  className = "",
  activeClassName = "",
  ...rest
}: PropsWithChildren<Props>) => {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={clsx({
        [className]: true,
        [activeClassName]: pathname === href,
      })}
      {...rest}
    >
      {children}
    </Link>
  );
};

export { NavLink };
