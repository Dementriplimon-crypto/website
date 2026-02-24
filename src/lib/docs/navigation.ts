import type { Breadcrumb } from "@/components/breadcrumbs";
import type {
  BreakNode,
  FolderNode,
  LinkNode,
  NavTreeNode,
} from "@/components/nav-tree";
import { promises as fs } from "node:fs";

// The format that is stored inside of the nav.json file slightly differs
// from what is required from the nav-tree. Specifically, there is no concept
// of "open" (for folders) or "active" (for links), as the nav.json does not
// concern itself with the context page in which you are viewing the nav from.
type NavFileFolderNode = Omit<Omit<FolderNode, "open">, "children"> & {
  children: NavFileFolderNode[];
};
type NavFileLinkNode = Omit<LinkNode, "active">;
type NavFileBreakNode = BreakNode;
type NavFileNavTreeNode =
  | NavFileFolderNode
  | NavFileLinkNode
  | NavFileBreakNode;
type NavFile = {
  items: NavFileNavTreeNode[];
};

// loadDocsNavTreeData loads nav.json and contextualizes open/active nodes for a slug.
export async function loadDocsNavTreeData(
  docsDirectory: string,
  activePageSlug: string,
): Promise<NavTreeNode[]> {
  const docsFilePath = `${docsDirectory}/nav.json`;
  try {
    const data = await fs.readFile(docsFilePath, "utf8");
    const jsonData: NavFile = JSON.parse(data);
    return contextualizeNavFile(jsonData, activePageSlug);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `Failed to parse ${docsFilePath}:

${err.message}}`,
        { cause: err },
      );
    }
    throw err;
  }
}

// docsMetadataTitle creates a compact metadata title from breadcrumbs.
export function docsMetadataTitle(breadcrumbs: Breadcrumb[]): string {
  if (breadcrumbs.length === 0) {
    return "Ghostty Docs";
  }

  return breadcrumbs.length > 1
    ? breadcrumbs
        .slice(1)
        .reverse()
        .slice(0, 2)
        .map((breadcrumb) => breadcrumb.text)
        .join(" - ")
    : breadcrumbs[0].text;
}

// navTreeToBreadcrumbs converts nav context and active slug into breadcrumb links.
export function navTreeToBreadcrumbs(
  firstBreadcrumbTitle: string,
  docsRootPath: string,
  navTree: NavTreeNode[],
  activePageSlug: string,
): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [];
  let accumulatedPath = "";
  let currentNavTree = navTree;
  const segments = activePageSlug.split("/");

  breadcrumbs.push({
    text: firstBreadcrumbTitle,
    href: docsRootPath,
  });

  // If we're on the root docs page, we can just exit early
  if (segments[0] === "index") {
    return breadcrumbs;
  }

  // Go through each URL segment & determine the breadcrumb to push to our array
  while (segments.length) {
    // Find the Node which represents the URL segment we're on
    const nextNode: FolderNode | LinkNode | undefined = currentNavTree.find(
      (node) => {
        if (node.type === "folder" || node.type === "link") {
          if (node.path === `/${segments[0]}`) {
            return true;
          }
        }
        return false;
      },
    ) as FolderNode | LinkNode | undefined;

    if (typeof nextNode === "undefined") {
      segments.forEach((name) => {
        accumulatedPath += `/${name}`; // Accumulate the path with the current segment
        breadcrumbs.push({
          text: name, // Use segment (file name) as the breadcrumb title
          href: docsRootPath + accumulatedPath, // Link to the full slug path
        });
      });

      break;
    }

    if (nextNode.type === "folder") {
      // Set the currentNavTree Node to its children for the next iteration
      currentNavTree = nextNode.children;

      // if folder has a children with path of `/`, that's an overview page,
      // so we'll link to that.
      const hasOverviewPage = currentNavTree.some(
        (e) => e.type === "link" && e.path === "/",
      );

      breadcrumbs.push({
        text: nextNode.title,
        href: hasOverviewPage
          ? docsRootPath + accumulatedPath + nextNode.path
          : null,
      });
    } else {
      // It's a link
      breadcrumbs.push({
        text: nextNode.title,
        href: docsRootPath + accumulatedPath + nextNode.path,
      });
    }

    // Accumulate the current paths, and shift the array so the next iteration
    // picks up the next segment in the URL
    accumulatedPath += nextNode.path;
    segments.shift();
  }

  return breadcrumbs;
}

// contextualizeNavFile adds root docs link and contextual active/open flags.
function contextualizeNavFile(
  navFile: NavFile,
  activePageSlug: string,
): Array<NavTreeNode> {
  return [
    {
      type: "link",
      path: "",
      title: "Ghostty Docs",
      active: activePageSlug === "index",
    },
    ...navFile.items.map(contextualizeNavTreeNode(activePageSlug, "")),
  ];
}

// contextualizeNavTreeNode recursively marks folder open/link active state.
function contextualizeNavTreeNode(
  activePageSlug: string,
  accumulatedSlug: string,
): (a: NavFileNavTreeNode) => NavTreeNode {
  return (t: NavFileNavTreeNode): NavTreeNode => {
    switch (t.type) {
      case "break":
        return t;
      case "folder": {
        const nextAccSlug = `${accumulatedSlug}${t.path.substring(1)}/`;
        return {
          type: "folder",
          title: t.title,
          path: t.path,
          open: activePageSlug.startsWith(nextAccSlug.slice(0, -1)),
          children: t.children.map(
            contextualizeNavTreeNode(activePageSlug, nextAccSlug),
          ),
        } as FolderNode;
      }
      case "link": {
        let fullSlug = `${accumulatedSlug}${t.path.substring(1)}`;
        // The value of `fullSlug` for index pages end up having
        // a trailing slash. Remove that so we can compare against
        // the activePageSlug (which will never have a trailing
        // slash due to our redirect rules).
        fullSlug =
          fullSlug.slice(-1) === "/" ? fullSlug.slice(0, -1) : fullSlug;
        return {
          type: "link",
          title: t.title,
          path: t.path,
          active: activePageSlug === fullSlug,
        } as LinkNode;
      }
      default:
        throw new Error(
          `There is an unexpected item in the 'nav.json' file:
${JSON.stringify(t, null, 2)}`,
        );
    }
  };
}
