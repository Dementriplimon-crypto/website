import { loadAllTerminalFiles } from "@/lib/fetch-terminal-content";
import type { Metadata } from "next";
import HomeClient from "./home-client";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Ghostty",
  description:
    "Ghostty is a fast, feature-rich, and cross-platform terminal emulator that uses platform-native UI and GPU acceleration.",
};

export default async function HomePage() {
  const terminalData = await loadAllTerminalFiles("/home");
  return <HomeClient terminalData={terminalData} />;
}
