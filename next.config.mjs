import createMDX from "@next/mdx";
import { createRequire } from "node:module";

// require resolves plugin module paths for the MDX loader in ESM config files.
const require = createRequire(import.meta.url);

// gfmAlertsAsCalloutsPlugin points at the local remark plugin that maps GFM alerts to Callout nodes.
const gfmAlertsAsCalloutsPlugin = require.resolve(
  "./src/lib/docs/remark-gfm-alerts-as-callouts.mjs",
);

// headingIdsPlugin points at the local remark plugin that applies stable heading IDs.
const headingIdsPlugin = require.resolve(
  "./src/lib/docs/remark-heading-ids.mjs",
);

// syntaxHighlightingPlugin points at the local rehype plugin that enables code highlighting.
const syntaxHighlightingPlugin = require.resolve(
  "./src/lib/docs/rehype-highlight-all.mjs",
);

// withMDX configures the Next.js MDX pipeline for docs rendering.
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      "remark-frontmatter",
      "remark-gfm",
      gfmAlertsAsCalloutsPlugin,
      headingIdsPlugin,
    ],
    rehypePlugins: [syntaxHighlightingPlugin],
  },
});

// nextConfig contains shared website framework and header behavior.
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: true,
  experimental: {
    // The homepage animation and docs reference pages intentionally ship
    // larger static payloads than Next.js defaults for page-data warnings.
    largePageDataBytes: 2 * 1024 * 1024,
  },
  env: {
    GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || "",
  },

  async headers() {
    const headers = [];
    if (process.env.VERCEL_ENV !== "production") {
      headers.push({
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
        source: "/:path*",
      });
    }

    return headers;
  },
};

export default withMDX(nextConfig);
