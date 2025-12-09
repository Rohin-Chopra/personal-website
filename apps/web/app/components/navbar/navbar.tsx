"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MdMenu } from "react-icons/md";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = () => {
    setIsOpen(false);
  };

  return (
    <header>
      <div
        className={clsx({
          "flex h-24 w-full items-center justify-between bg-primary px-8 py-2 dark:bg-dark md:grid md:grid-cols-3 md:items-stretch md:p-0":
            true,
          "fixed  left-0 top-0 z-50": pathname.includes("/blogs/"),
        })}
      >
        <Link
          className={clsx({
            "py-8 text-xl font-bold text-white dark:text-white md:pl-8 font-josefin":
              true,
            "md:bg-white dark:bg-dark md:text-black": pathname === "/",
          })}
          href="/"
          passHref
        >
          ROHIN CHOPRA
        </Link>
        <div
          className={clsx({
            "text-white md:col-span-2 md:pr-16 flex md:justify-end items-center bg-primary dark:bg-dark":
              true,
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
              <Link href="/projects">Projects</Link>
            </div>
            <div className="md:mx-4 md:dark:flex md:dark:h-full md:dark:items-center dark:md:bg-primary md:dark:px-4 md:dark:py-2">
              <Link href="/blogs">Blogs</Link>
            </div>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger aria-label="Menu">
              <MdMenu className="z-50 cursor-pointer text-3xl md:hidden" />
            </SheetTrigger>
            <SheetContent className="flex flex-col items-center dark:text-white">
              <div className="mb-1 mt-24">
                <Link onClick={close} href="/">
                  About
                </Link>
              </div>
              <div className="my-1">
                <Link onClick={close} href="/#projects">
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
    </header>
  );
};

export { Navbar };
