import type { Metadata } from "next";
import { type DocsPageData, loadDocsPage } from "@/lib/fetch-docs";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import { navTreeToBreadcrumbs } from "@/lib/nav-tree-to-breadcrumbs";
import { docsMetadataTitle } from "@/lib/docs-metadata-title";
import { DOCS_DIRECTORY, DOCS_PAGES_ROOT_PATH } from "@/lib/docs-config";
import DocsPageContent from "./docs-page-content";
import type { NavTreeNode } from "@/components/nav-tree";
import type { Breadcrumb } from "@/components/breadcrumbs";

export const dynamic = "force-static";

async function loadDocsRouteData(activePageSlug: string): Promise<{
  navTreeData: NavTreeNode[];
  docsPageData: DocsPageData;
  breadcrumbs: Breadcrumb[];
}> {
  const navTreeData = await loadDocsNavTreeData(DOCS_DIRECTORY, activePageSlug);
  const docsPageData = await loadDocsPage(DOCS_DIRECTORY, activePageSlug);
  const breadcrumbs = navTreeToBreadcrumbs(
    "Ghostty Docs",
    DOCS_PAGES_ROOT_PATH,
    navTreeData,
    activePageSlug,
  );

  return { navTreeData, docsPageData, breadcrumbs };
}

export async function generateMetadata(): Promise<Metadata> {
  const { docsPageData, breadcrumbs } = await loadDocsRouteData("index");
  return {
    title: docsMetadataTitle(breadcrumbs),
    description: docsPageData.description,
  };
}

export default async function DocsIndexPage() {
  const { navTreeData, docsPageData, breadcrumbs } =
    await loadDocsRouteData("index");
  return (
    <DocsPageContent
      navTreeData={navTreeData}
      docsPageData={docsPageData}
      breadcrumbs={breadcrumbs}
    />
  );
}
