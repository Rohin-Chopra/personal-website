import Link from "next/link";
import { MdChevronRight, MdHome } from "react-icons/md";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export const Breadcrumbs = ({ items }: Props) => {
  return (
    <nav
      className="mb-4 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        aria-label="Home"
        className="flex items-center hover:text-primary dark:hover:text-primary"
      >
        <MdHome className="size-4" aria-hidden />
      </Link>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center space-x-2">
          <MdChevronRight className="size-4" aria-hidden />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-primary dark:hover:text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white" aria-current="page">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
