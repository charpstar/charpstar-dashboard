"use client";

import { usePathname } from "next/navigation";
import { Link } from "nextjs13-progress";
import { cn } from "@/lib/utils";

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
    <Link
      prefetch={true}
      href={href}
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        "transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      <span className="flex items-center">{icon}</span>
      <span className="ml-3">{title}</span>
    </Link>
  );
}