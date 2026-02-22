import type { Breadcrumb } from "@/components/breadcrumbs";

export function docsMetadataTitle(breadcrumbs: Breadcrumb[]): string {
  if (breadcrumbs.length === 0) {
    return "Ghostty Docs";
  }

  return breadcrumbs.length > 1
    ? breadcrumbs
        .slice(1)
        .reverse()
        .slice(0, 2)
        .map((breadcrumb) => breadcrumb.text)
        .join(" - ")
    : breadcrumbs[0].text;
}
