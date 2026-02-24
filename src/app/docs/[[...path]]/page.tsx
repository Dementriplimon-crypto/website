import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Breadcrumb } from "@/components/breadcrumbs";
import type { NavTreeNode } from "@/components/nav-tree";
import { DOCS_DIRECTORY, DOCS_PAGES_ROOT_PATH } from "@/lib/docs/config";
import {
  type DocsPageData,
  loadAllDocsPageSlugs,
  loadDocsPage,
} from "@/lib/docs/page";
import {
  docsMetadataTitle,
  loadDocsNavTreeData,
  navTreeToBreadcrumbs,
} from "@/lib/docs/navigation";
import DocsPageContent from "../DocsPageContent";

interface DocsRouteProps {
  params: Promise<{ path?: string[] }>;
}

// Disable runtime fallback routing so unknown docs paths become 404s.
export const dynamicParams = false;

// normalizePathSegments converts an optional catch-all param into a concrete array.
function normalizePathSegments(path: string[] | undefined): string[] {
  return path ?? [];
}

// toActivePageSlug maps an optional catch-all route to the docs slug used by loaders.
function toActivePageSlug(path: string[]): string {
  return path.length === 0 ? "index" : path.join("/");
}

// isErrorWithCode narrows unknown errors so filesystem codes can be checked safely.
function isErrorWithCode(err: unknown): err is Error & { code: unknown } {
  return err instanceof Error && typeof err === "object" && "code" in err;
}

// loadDocsRouteData loads all data needed to render a docs page and its metadata.
async function loadDocsRouteData(path: string[]): Promise<{
  navTreeData: NavTreeNode[];
  docsPageData: DocsPageData;
  breadcrumbs: Breadcrumb[];
}> {
  const activePageSlug = toActivePageSlug(path);
  const [navTreeData, docsPageData] = await Promise.all([
    loadDocsNavTreeData(DOCS_DIRECTORY, activePageSlug),
    loadDocsPage(DOCS_DIRECTORY, activePageSlug).catch((err: unknown) => {
      if (isErrorWithCode(err) && err.code === "ENOENT") {
        notFound();
      }
      throw err;
    }),
  ]);

  const breadcrumbs = navTreeToBreadcrumbs(
    "Ghostty Docs",
    DOCS_PAGES_ROOT_PATH,
    navTreeData,
    activePageSlug,
  );

  return { navTreeData, docsPageData, breadcrumbs };
}

// generateStaticParams pre-renders the docs index and every nested docs slug.
export async function generateStaticParams(): Promise<
  Array<{ path: string[] }>
> {
  const docsPageSlugs = await loadAllDocsPageSlugs(DOCS_DIRECTORY);
  const docsPagePaths = docsPageSlugs
    .filter((slug) => slug !== "index")
    .map((slug) => ({ path: slug.split("/") }));

  return [{ path: [] }, ...docsPagePaths];
}

// generateMetadata builds SEO metadata from the resolved docs page and breadcrumbs.
export async function generateMetadata({
  params,
}: DocsRouteProps): Promise<Metadata> {
  const { path } = await params;
  const { docsPageData, breadcrumbs } = await loadDocsRouteData(
    normalizePathSegments(path),
  );

  return {
    title: docsMetadataTitle(breadcrumbs),
    description: docsPageData.description,
  };
}

// DocsPage renders both /docs and /docs/* routes via a single optional catch-all route.
export default async function DocsPage({ params }: DocsRouteProps) {
  const { path } = await params;
  const { navTreeData, docsPageData, breadcrumbs } = await loadDocsRouteData(
    normalizePathSegments(path),
  );

  return (
    <DocsPageContent
      navTreeData={navTreeData}
      docsPageData={docsPageData}
      breadcrumbs={breadcrumbs}
    />
  );
}
