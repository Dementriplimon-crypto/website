import remarkCallout from "@r4ai/remark-callout";

// calloutTransform maps GFM alerts to the custom MDX callout elements used by docs pages.
const calloutTransform = remarkCallout({
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
});

// remarkGfmAlertsAsCallouts exposes the callout transform as a remark plugin.
export default function remarkGfmAlertsAsCallouts() {
  return calloutTransform;
}
