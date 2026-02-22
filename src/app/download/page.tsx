import type { Metadata } from "next";
import Image from "next/image";
import type { NavTreeNode } from "@/components/nav-tree";
import SectionWrapper from "@/components/section-wrapper";
import { H1, P } from "@/components/text";
import NavFooterLayout from "@/layouts/nav-footer-layout";
import { fetchLatestGhosttyVersion } from "@/lib/fetch-latest-ghostty-version";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import { DOCS_DIRECTORY } from "@/lib/docs-config";
import SVGIMG from "../../../public/ghostty-logo.svg";
import ReleaseDownloadPage from "./release-download-page";
import TipDownloadPage from "./tip-download-page";
import s from "./DownloadPage.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Download Ghostty",
  description:
    "Ghostty is a fast, feature-rich, and cross-platform terminal emulator that uses platform-native UI and GPU acceleration.",
};

async function loadPageData(): Promise<{
  latestVersion: string;
  docsNavTree: NavTreeNode[];
}> {
  return {
    latestVersion: await fetchLatestGhosttyVersion(),
    docsNavTree: await loadDocsNavTreeData(DOCS_DIRECTORY, ""),
  };
}

export default async function DownloadPage() {
  const { latestVersion, docsNavTree } = await loadPageData();
  const isTip = process.env.GIT_COMMIT_REF === "tip";

  return (
    <NavFooterLayout docsNavTree={docsNavTree}>
      <main className={s.downloadPage}>
        <SectionWrapper>
          <div className={s.header}>
            <Image src={SVGIMG} alt={""} />
            <H1 className={s.pageTitle}>Download Ghostty</H1>
            {!isTip && (
              <P weight="regular" className={s.versionInfo}>
                Version {latestVersion} -{" "}
                <a
                  href={`/docs/install/release-notes/${latestVersion.replace(/\./g, "-")}`}
                >
                  Release Notes
                </a>
              </P>
            )}
          </div>
          {isTip ? (
            <TipDownloadPage />
          ) : (
            <ReleaseDownloadPage latestVersion={latestVersion} />
          )}
        </SectionWrapper>
      </main>
    </NavFooterLayout>
  );
}
