import { promises as fs } from "node:fs";
import recurse, { type Item } from "klaw-sync";
const nodePath = require("node:path");

const TERMINALS_DIRECTORY = "./terminals";
const TERMINAL_CONTENT_FILE_EXTENSION = ".txt";

export type TerminalsMap = { [k: string]: string[] };

export async function loadAllTerminalFiles(
  subdirectory?: string,
): Promise<TerminalsMap> {
  const allPaths = recurse(`${TERMINALS_DIRECTORY}${subdirectory}`, {
    nodir: true,
    filter: (file: Item): boolean => {
      return file.path.endsWith(TERMINAL_CONTENT_FILE_EXTENSION);
    },
    traverseAll: true,
  }).map((item: recurse.Item) => {
    return item.path;
  });

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
