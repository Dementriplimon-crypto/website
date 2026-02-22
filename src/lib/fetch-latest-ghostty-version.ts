import { parseStringPromise } from "xml2js";

export async function fetchLatestGhosttyVersion(): Promise<string> {
  // Use the same appcast we use for Sparkle updates to get the
  // latest version of the app.
  const appcastUrl = "https://release.files.ghostty.org/appcast.xml";
  const response = await fetch(appcastUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch XML: ${response.statusText}`);
  }

  const xmlContent = await response.text();
  const parsedXml = await parseStringPromise(xmlContent, {
    explicitArray: false,
  });

  // Extract items
  const items = parsedXml.rss.channel.item;

  // Convert items to an array if it's not already
  const itemsArray = Array.isArray(items) ? items : [items];

  // Find the item with the highest version
  const latestItem = itemsArray.reduce((maxItem, currentItem) => {
    const currentVersion = Number.parseInt(currentItem["sparkle:version"], 10);
    const maxVersion = Number.parseInt(maxItem["sparkle:version"], 10);
    return currentVersion > maxVersion ? currentItem : maxItem;
  });

  return latestItem["sparkle:shortVersionString"];
}
