import { all } from "lowlight";
import rehypeHighlight from "rehype-highlight";

// rehypeHighlightAll enables syntax highlighting with the full lowlight language set.
export default function rehypeHighlightAll() {
  return rehypeHighlight({
    detect: false,
    languages: all,
  });
}
