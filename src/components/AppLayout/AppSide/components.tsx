"use client";

import { classNames } from "@/utils/uiUtils";

import { usePathname } from "next/navigation";
import { Link } from "nextjs13-progress";

export function ListItem({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        prefetch={true}
        href={href}
        className={classNames(
          "flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group",
          isActive && "bg-gray-100 dark:bg-gray-700",
        )}
      >
        {icon}
        <span className="ml-3">{title}</span>
      </Link>
    </li>
  );
}

export function MiniAction({ children }: React.PropsWithChildren) {
  return (
    <Link
      href="/"
      type="button"
      data-dropdown-toggle="language-dropdown"
      className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:hover:text-white dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
    >
      {children}
    </Link>
  );
}
