import Breadcrumbs, { type Breadcrumb } from "@/components/breadcrumbs";
import NavTree, { type NavTreeNode } from "@/components/nav-tree";
import ScrollToTopButton from "@/components/scroll-to-top";
import Sidecar from "@/components/sidecar";
import { H1, P } from "@/components/text";
import NavFooterLayout from "@/layouts/nav-footer-layout";
import type { DocsPageData } from "@/lib/fetch-docs";
import { DOCS_PAGES_ROOT_PATH, GITHUB_REPO_URL } from "@/lib/docs-config";
import { Pencil } from "lucide-react";
import s from "./DocsPage.module.css";
import customMdxStyles from "@/components/custom-mdx/CustomMDX.module.css";

interface DocsPageContentProps {
  navTreeData: NavTreeNode[];
  docsPageData: DocsPageData;
  breadcrumbs: Breadcrumb[];
}

export default function DocsPageContent({
  navTreeData,
  docsPageData: {
    title,
    description,
    editOnGithubLink,
    content,
    relativeFilePath,
    pageHeaders,
    hideSidecar,
  },
  breadcrumbs,
}: DocsPageContentProps) {
  // Calculate the "Edit in Github" link. If it's not provided
  // in the frontmatter, point to the website repo mdx file.
  const resolvedEditOnGithubLink = editOnGithubLink
    ? editOnGithubLink
    : `${GITHUB_REPO_URL}/edit/main/${relativeFilePath}`;

  return (
    <NavFooterLayout docsNavTree={navTreeData}>
      <div className={s.docsPage}>
        <div className={s.sidebar}>
          <div className={s.sidebarContentWrapper}>
            <NavTree
              nodeGroups={[
                {
                  rootPath: DOCS_PAGES_ROOT_PATH,
                  nodes: navTreeData,
                },
              ]}
              className={s.sidebarNavTree}
            />
          </div>
        </div>

        <main className={s.contentWrapper}>
          <ScrollToTopButton />

          <div className={s.docsContentWrapper}>
            <div className={s.breadcrumbsBar}>
              <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className={s.heading}>
              <H1>{title}</H1>
              <P className={s.description} weight="regular">
                {description}
              </P>
            </div>
            <div className={customMdxStyles.customMDX}>{content}</div>
            <br />
            <div className={s.editOnGithub}>
              <a href={resolvedEditOnGithubLink}>
                Edit on GitHub <Pencil size={14} />
              </a>
            </div>
          </div>

          <Sidecar
            hidden={hideSidecar}
            className={s.sidecar}
            items={pageHeaders}
          />
        </main>
      </div>
    </NavFooterLayout>
  );
}
