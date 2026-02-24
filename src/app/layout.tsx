import Footer from "@/components/footer";
import PathnameFilter from "@/components/pathname-filter";
import type { SimpleLink } from "@/components/link";
import Navbar from "@/components/navbar";
import PreviewBanner from "@/components/preview-banner";
import { jetbrainsMono, pretendardStdVariable } from "@/components/text";
import { DOCS_DIRECTORY } from "@/lib/docs-config";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import "@/styles/globals.css";
import classNames from "classnames";
import type { Metadata } from "next";
import s from "./layout.module.css";

// Navigation links for our nav bars. This currently applies to both
// the sidebar and footer links equally.
const navLinks: Array<SimpleLink> = [
  {
    text: "Docs",
    href: "/docs",
  },
  {
    text: "Discord",
    href: "https://discord.gg/ghostty",
  },
  {
    text: "GitHub",
    href: "https://github.com/ghostty-org/ghostty",
  },
];

// The paths that don't have the navbar/footer "chrome".
const NO_CHROME_PATHS = ["/"];

export const metadata: Metadata = {
  metadataBase: new URL("https://ghostty.org"),
  title: "Ghostty",
  description:
    "Ghostty is a fast, feature-rich, and cross-platform terminal emulator that uses platform-native UI and GPU acceleration.",
  openGraph: {
    type: "website",
    siteName: "Ghostty",
    url: "https://ghostty.org",
    images: [
      {
        url: "/social-share-card.jpg",
        width: 1800,
        height: 3200,
      },
    ],
  },
  twitter: {
    images: ["https://ghostty.org/social-share-card.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  other: {
    "darkreader-lock": "",
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load the docs tree once at the root so navbar/mobile docs navigation
  // can be rendered across the site.
  const docsNavTree = await loadDocsNavTreeData(DOCS_DIRECTORY, "");
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en">
      <body
        className={classNames(
          s.rootLayout,
          pretendardStdVariable.variable,
          jetbrainsMono.variable,
        )}
      >
        <PreviewBanner />
        <PathnameFilter paths={NO_CHROME_PATHS} mode="exclude">
          <Navbar
            links={navLinks}
            docsNavTree={docsNavTree}
            cta={{
              href: "/download",
              text: "Download",
            }}
          />
        </PathnameFilter>
        {children}
        <PathnameFilter paths={NO_CHROME_PATHS} mode="exclude">
          <Footer
            links={[
              ...navLinks,
              {
                text: "Download",
                href: "/download",
              },
            ]}
            copyright={`© ${currentYear} Ghostty`}
          />
        </PathnameFilter>
      </body>
    </html>
  );
}
