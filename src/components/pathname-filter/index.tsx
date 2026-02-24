"use client";

import { usePathname } from "next/navigation";

interface PathnameFilterProps {
  children?: React.ReactNode;
  paths: string[];
  mode?: "include" | "exclude";
}

/**
 * Conditionally renders children by matching the current route pathname.
 *
 * `mode="include"` renders only when `pathname` is in `paths`.
 * `mode="exclude"` renders only when `pathname` is not in `paths`.
 */
export default function PathnameFilter({
  children,
  paths,
  mode = "include",
}: PathnameFilterProps) {
  const pathname = usePathname();
  const hasMatch = !!pathname && paths.includes(pathname);

  if (mode === "include") {
    return hasMatch ? children : null;
  }

  return hasMatch ? null : children;
}
