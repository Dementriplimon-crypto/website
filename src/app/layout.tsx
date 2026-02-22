import RootLayout from "@/layouts/root-layout";
import "@/styles/globals.css";
import type { Metadata } from "next";

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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
