import { promises as fs } from "node:fs";

/** Provides POSIX and path utilities for terminal file traversal. */
const nodePath = require("node:path");

/** Filesystem location for checked-in terminal snapshot data. */
const TERMINALS_DIRECTORY = "./terminals";

/** Extension used by terminal snapshot files. */
const TERMINAL_CONTENT_FILE_EXTENSION = ".txt";

export type TerminalsMap = { [k: string]: string[] };

/** Loads terminal text files and returns them keyed by slug path. */
export async function loadAllTerminalFiles(
  subdirectory?: string,
): Promise<TerminalsMap> {
  const allPaths = (
    await collectAllFilesRecursively(`${TERMINALS_DIRECTORY}${subdirectory}`)
  ).filter((path) => path.endsWith(TERMINAL_CONTENT_FILE_EXTENSION));

  const map: Map<string, Array<string>> = new Map<string, Array<string>>();
  for (const path of allPaths) {
    const slug = nodePath
      .relative(TERMINALS_DIRECTORY, path)
      .split(".")
      .slice(0, -1)
      .join(".");
    let content = (await fs.readFile(path, "utf8")).split(/\n/g);
    if (content[content.length - 1] === "") {
      content = content.slice(0, -1);
    }
    map.set(slug, content);
  }
  return Object.fromEntries(map);
}

/** Walks a directory recursively and returns full file paths. */
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
