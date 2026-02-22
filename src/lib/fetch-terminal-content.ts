import { promises as fs } from "node:fs";
const nodePath = require("node:path");

const TERMINALS_DIRECTORY = "./terminals";
const TERMINAL_CONTENT_FILE_EXTENSION = ".txt";

export type TerminalsMap = { [k: string]: string[] };

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
