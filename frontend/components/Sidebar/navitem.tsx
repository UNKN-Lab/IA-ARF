import Link from "next/link";
import React from "react";

export default function NavItem({
  icon,
  label,
  link = "#",
}: {
  icon: React.ReactNode;
  label: string;
  link?: string;
}) {
  return (
    <Link
      href={link}
      className="
        flex items-center gap-3 w-full px-3 py-2 rounded-md
        hover:bg-accent transition
      "
    >
      <span className="text-muted-foreground">{icon}</span>
      <span
        className="
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          whitespace-nowrap
        "
      >
        {label}
      </span>
    </Link>
  );
}
