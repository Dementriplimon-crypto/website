import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Breadcrumb } from "@/components/breadcrumbs";
import type { NavTreeNode } from "@/components/nav-tree";
import { DOCS_DIRECTORY, DOCS_PAGES_ROOT_PATH } from "@/lib/docs-config";
import {
  type DocsPageData,
  loadAllDocsPageSlugs,
  loadDocsPage,
} from "@/lib/fetch-docs";
import { docsMetadataTitle } from "@/lib/docs-metadata-title";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import { navTreeToBreadcrumbs } from "@/lib/nav-tree-to-breadcrumbs";
import DocsPageContent from "../docs-page-content";

export const dynamic = "force-static";
export const dynamicParams = false;

interface DocsRouteProps {
  params: Promise<{ path: string[] }>;
}

async function loadDocsRouteData(path: string[]): Promise<{
  navTreeData: NavTreeNode[];
  docsPageData: DocsPageData;
  breadcrumbs: Breadcrumb[];
}> {
  const activePageSlug = path.join("/");
  const navTreeData = await loadDocsNavTreeData(DOCS_DIRECTORY, activePageSlug);

  let docsPageData: DocsPageData;
  try {
    docsPageData = await loadDocsPage(DOCS_DIRECTORY, activePageSlug);
  } catch {
    notFound();
  }

  const breadcrumbs = navTreeToBreadcrumbs(
    "Ghostty Docs",
    DOCS_PAGES_ROOT_PATH,
    navTreeData,
    activePageSlug,
  );
  return { navTreeData, docsPageData, breadcrumbs };
}

export async function generateStaticParams(): Promise<
  Array<{ path: string[] }>
> {
  const docsPageSlugs = await loadAllDocsPageSlugs(DOCS_DIRECTORY);
  return docsPageSlugs
    .filter((slug) => slug !== "index")
    .map((slug) => ({ path: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: DocsRouteProps): Promise<Metadata> {
  const { path } = await params;
  const { docsPageData, breadcrumbs } = await loadDocsRouteData(path);

  return {
    title: docsMetadataTitle(breadcrumbs),
    description: docsPageData.description,
  };
}

export default async function DocsPage({ params }: DocsRouteProps) {
  const { path } = await params;
  const { navTreeData, docsPageData, breadcrumbs } =
    await loadDocsRouteData(path);

  return (
    <DocsPageContent
      navTreeData={navTreeData}
      docsPageData={docsPageData}
      breadcrumbs={breadcrumbs}
    />
  );
}
