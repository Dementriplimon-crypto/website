import Footer from "@/components/footer";
import type { SimpleLink } from "@/components/link";
import type { NavTreeNode } from "@/components/nav-tree";
import Navbar from "@/components/navbar";
import RootLayout from "../root-layout";

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

type NavFooterLayoutProps = {
  children?: React.ReactNode;
  docsNavTree: NavTreeNode[];
};

export default function NavFooterLayout(props: NavFooterLayoutProps) {
  const currentYear = new Date().getFullYear();

  const { children, docsNavTree } = props;
  return (
    <RootLayout>
      <Navbar
        links={navLinks}
        docsNavTree={docsNavTree}
        cta={{
          href: "/download",
          text: "Download",
        }}
      />
      {children}
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
    </RootLayout>
  );
}
