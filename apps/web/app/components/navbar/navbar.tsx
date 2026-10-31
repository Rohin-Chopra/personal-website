"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MdMenu } from "react-icons/md";

import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = () => {
    setIsOpen(false);
  };

  return (
    <header>
      <nav aria-label="Main">
        <div
          className={clsx({
            "flex h-24 w-full items-center justify-between bg-primary px-8 py-2 md:grid md:grid-cols-3 md:items-stretch md:p-0 dark:bg-dark": true,
            "fixed  top-0 left-0 z-50": pathname.includes("/blogs/"),
          })}
        >
          <Link
            className={clsx({
              "py-8 font-josefin text-xl font-bold text-white md:pl-8 dark:text-white": true,
              "md:bg-white md:text-black dark:bg-dark": pathname === "/",
            })}
            href="/"
            passHref
          >
            ROHIN CHOPRA
          </Link>
          <div
            className={clsx({
              "flex items-center bg-primary text-white md:col-span-2 md:justify-end md:pr-16 dark:bg-dark": true,
              "md:border-l-2 md:border-l-white md:dark:border-l-primary md:dark:bg-darkGray":
                pathname === "/",
            })}
          >
            <div className="mr-4 md:hidden">
              <ThemeSwitcher />
            </div>
            <div className="hidden md:static md:flex md:h-full md:flex-row md:items-center md:justify-end md:pt-0 md:text-base">
              <div className="md:mx-4">
                <ThemeSwitcher />
              </div>
              <div className="md:mx-4">
                <Link
                  href="/projects"
                  aria-current={pathname === "/projects" ? "page" : undefined}
                >
                  Projects
                </Link>
              </div>
              <div className="md:mx-4 md:dark:flex md:dark:h-full md:dark:items-center dark:md:bg-primary md:dark:px-4 md:dark:py-2">
                <Link
                  href="/blogs"
                  aria-current={
                    pathname.startsWith("/blogs") ? "page" : undefined
                  }
                >
                  Blogs
                </Link>
              </div>
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger aria-label="Menu">
                <MdMenu className="z-50 cursor-pointer text-3xl md:hidden" />
              </SheetTrigger>
              <SheetContent
                className="flex flex-col items-center dark:text-white"
                aria-describedby={undefined}
              >
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <div className="mt-24 mb-1">
                  <Link onClick={close} href="/">
                    About
                  </Link>
                </div>
                <div className="my-1">
                  <Link onClick={close} href="/projects">
                    Projects
                  </Link>
                </div>
                <div className="my-1">
                  <Link onClick={close} href="/blogs">
                    Blogs
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};

export { Navbar };
