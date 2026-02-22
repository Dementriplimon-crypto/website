import remarkCallout, {
  type Options as RemarkCalloutOptions,
} from "@r4ai/remark-callout";
import { promises as fs } from "node:fs";
import matter from "gray-matter";
import type { Root } from "mdast";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeHighlight, {
  type Options as RehypeHighlightOptions,
} from "rehype-highlight";
import { all } from "lowlight";
import remarkGfm from "remark-gfm";
import slugify from "slugify";
import type { Plugin } from "unified";
import type { Node } from "unist";
import { visit } from "unist-util-visit";
const nodePath = require("node:path");

const MDX_EXTENSION = ".mdx";

export type PageHeader = {
  id: string;
  title: string;
  depth: number;
};

export interface DocsPageData {
  slug: string;
  title: string;
  description: string;
  // There are scenarios in which the GitHub link should
  // not be the website source MDX file, due to the MDX being
  // generated from some upstream source. This is an optional
  // frontmatter that can override the link.
  editOnGithubLink: string | null;
  hideSidecar: boolean;
  content: MDXRemoteSerializeResult;
  relativeFilePath: string;
  pageHeaders: PageHeader[];
}

export async function loadDocsPage(
  docsDirectory: string,
  slug: string,
): Promise<DocsPageData> {
  // A file with a given slug can be located in one of two places.
  // First we attempt to load the file from the non-index path first.
  // e.g. `/docs/foo.mdx` will be tried before `/docs/foo/index.mdx`.
  try {
    return await loadDocsPageFromRelativeFilePath(
      nodePath.join(docsDirectory, slug + MDX_EXTENSION),
    );
  } catch (err) {
    // If we run into an error because the file didn't exist catch this error
    // because we're going to check the other possible location.
    if (!isErrorWithCode(err) || err.code !== "ENOENT") {
      // Some other unexpected error occurred
      throw err;
    }
  }
  // Now we'll attempt to load the index file path.
  return await loadDocsPageFromRelativeFilePath(
    nodePath.join(docsDirectory, slug, `index${MDX_EXTENSION}`),
  );
}

async function loadDocsPageFromRelativeFilePath(
  relativeFilePath: string,
): Promise<DocsPageData> {
  const mdxFileContent = matter.read(relativeFilePath);
  const slug = slugFromRelativeFilePath(relativeFilePath);

  const pageHeaders: PageHeader[] = [];

  const content: MDXRemoteSerializeResult = await serialize(
    mdxFileContent.content,
    {
      // next-mdx-remote v6 blocks JS expressions by default. Our docs use
      // trusted MDX expressions, so keep JS enabled while retaining the
      // dangerous-global protections introduced in v6.
      blockJS: false,
      blockDangerousJS: true,
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          gfmAlertsAsCallouts(),
          parseAnchorLinks({ pageHeaders }),
        ],
        rehypePlugins: [
          [
            rehypeHighlight,
            {
              detect: false,
              languages: all,
            } satisfies RehypeHighlightOptions,
          ],
        ],
      },
    },
  );
  return {
    slug,
    relativeFilePath,
    title: mdxFileContent.data.title,
    description: mdxFileContent.data.description,
    editOnGithubLink: mdxFileContent.data.editOnGithubLink
      ? mdxFileContent.data.editOnGithubLink
      : null,
    hideSidecar: Object.hasOwn(mdxFileContent.data, "hideSidecar")
      ? mdxFileContent.data.hideSidecar
      : false,
    content,
    pageHeaders,
  };
}

// Parse out GFM Style Alerts (e.g. [!NOTE]) & render them as Callouts
// https://github.com/orgs/community/discussions/16925
function gfmAlertsAsCallouts(): [
  Plugin<[RemarkCalloutOptions], Root>,
  RemarkCalloutOptions,
] {
  return [
    remarkCallout,
    {
      root: (callout) => ({
        tagName: "Callout",
        properties: {
          type: callout.type.toLowerCase(),
          isFoldable: String(callout.isFoldable),
        },
      }),
      // We won't use title, just type.
      title: () => ({
        tagName: "callout-title",
        properties: {},
      }),
    } satisfies RemarkCalloutOptions,
  ];
}

// parseAnchorLinks is a remark plugin which will fill the pageHeaders array
// with headers as they are encountered
function parseAnchorLinks({
  pageHeaders,
}: {
  pageHeaders: PageHeader[];
}): () => (node: Node) => void {
  type HeadingNode = {
    type: "heading";
    depth: number;
    children: {
      type: string;
      value: string;
    }[];
    data?: {
      hProperties?: Record<string, unknown>;
    };
  };

  return () => {
    // We need to keep track of how many times that we have encountered a
    // given header ID, as to ensure that we don't run into any conflicts.
    // If there is a conflict, the sidecar will run into issues, and only
    // the first header will be able to be deep-linked to.
    //
    // In the event that we encounter a duplicate Header ID, we'll simply
    // add a suffix to the ID to make it unique. e.g. if there are two headers
    // with the same name "Foo", the first ID will be "foo", while the second
    // will be "foo-2".
    const encounteredIDs = new Map<string, number>();

    return (node: Node) => {
      visit(node, "heading", (node: Node) => {
        if (node.type === "heading") {
          const headingNode = node as HeadingNode;
          if (headingNode.children.length > 0) {
            const text = headingNode.children.map((v) => v.value).join("");
            const baseId = slugify(text.toLowerCase());

            // If this is not the first occurrence, add a data-index attribute
            const encounteredCount = (encounteredIDs.get(baseId) || 0) + 1;
            encounteredIDs.set(baseId, encounteredCount);
            if (encounteredCount >= 2) {
              if (!headingNode.data) {
                headingNode.data = {};
              }
              headingNode.data.hProperties = {
                ...headingNode.data.hProperties,
                "data-index": encounteredCount.toString(),
              };
            }
            const resolvedID =
              encounteredCount >= 2 ? `${baseId}-${encounteredCount}` : baseId;

            pageHeaders.push({
              depth: headingNode.depth,
              id: resolvedID,
              title: text,
            });
          }
        }
      });
    };
  };
}

export async function loadAllDocsPageSlugs(
  docsDirectory: string,
): Promise<Array<string>> {
  const allPaths = (await collectAllFilesRecursively(docsDirectory)).filter(
    (path) => path.endsWith(MDX_EXTENSION),
  );
  const docsPageSlugs: Set<string> = new Set();
  for (let i = 0; i < allPaths.length; i++) {
    const path = allPaths[i];
    const relativeFilePath = nodePath.relative(docsDirectory, path);
    const slug = slugFromRelativeFilePath(relativeFilePath);
    if (docsPageSlugs.has(slug)) {
      throw new Error(
        `There is a conflict in generating the ${docsDirectory}/${slug} page.

It is likely that both of these files exist:
  - ${docsDirectory}/${slug}.mdx
  - ${docsDirectory}/${slug}/index.mdx
Both of these files resolve to the same URL, and will cause an issue.

To fix this error, delete one of these files.`,
      );
    }
    docsPageSlugs.add(slug);
  }
  return Array.from(docsPageSlugs);
}

const isErrorWithCode = (err: unknown): err is Error & { code: unknown } => {
  return err instanceof Error && typeof err === "object" && "code" in err;
};

function slugFromRelativeFilePath(relativeFilePath: string): string {
  return (
    relativeFilePath
      // Strip the `.mdx` extension from the filename
      .replaceAll(MDX_EXTENSION, "")
      // Include support for index files (`/docs/topic/index.mdx` -> `topic`)
      .replaceAll(/\/index$/gi, "")
  );
}

async function collectAllFilesRecursively(root: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = nodePath.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectAllFilesRecursively(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}
