import Blockquote from "@/components/blockquote";
import ButtonLinks from "@/components/button-links";
import Callout, {
  Caution,
  Important,
  Note,
  Tip,
  Warning,
} from "@/components/callout";
import CardLinks from "@/components/card-links";
import CodeBlock from "@/components/codeblock";
import s from "@/components/custom-mdx/CustomMDX.module.css";
import DonateCard from "@/components/donate-card";
import GitHub from "@/components/github";
import { processGitHubLinks } from "@/components/github/mdx";
import JumplinkHeader from "@/components/jumplink-header";
import Mermaid from "@/components/mermaid";
import SponsorCard from "@/components/sponsor-card";
import { BodyParagraph, LI } from "@/components/text";
import VTSequence from "@/components/vt-sequence";
import Video from "@/components/video";
import { isValidElement, type ReactElement } from "react";

type MermaidCodeElement = {
  className?: string;
  children?: string;
};

// isReactElement safely narrows unknown pre/code children into React elements.
function isReactElement(
  children: unknown,
): children is ReactElement<MermaidCodeElement> {
  return isValidElement(children);
}

// mdxComponents defines the React component map used by docs MDX compilation.
export const mdxComponents = {
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
    <JumplinkHeader {...props} as="h1" />
  ),
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <JumplinkHeader {...props} as="h2" />
  ),
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <JumplinkHeader {...props} as="h3" />
  ),
  h4: (props: React.ComponentPropsWithoutRef<"h4">) => (
    <JumplinkHeader {...props} as="h4" />
  ),
  h5: (props: React.ComponentPropsWithoutRef<"h5">) => (
    <JumplinkHeader {...props} as="h5" />
  ),
  h6: (props: React.ComponentPropsWithoutRef<"h6">) => (
    <JumplinkHeader {...props} as="h6" />
  ),
  li: (props: React.ComponentPropsWithoutRef<"li">) => {
    const processedChildren = processGitHubLinks(props.children);
    return <LI {...props}>{processedChildren}</LI>;
  },
  p: (props: React.ComponentPropsWithoutRef<"p">) => {
    const processedChildren = processGitHubLinks(props.children);
    return <BodyParagraph {...props}>{processedChildren}</BodyParagraph>;
  },
  code: (props: React.ComponentPropsWithoutRef<"code">) => {
    if (!props.className) {
      return <code {...props} />;
    }

    const language = props.className.replace("language-", "");
    if (language === "mermaid") {
      return (
        <Mermaid chart={props.children as string} className="mdx-mermaid" />
      );
    }

    return <code {...props} />;
  },
  pre: (props: React.ComponentPropsWithoutRef<"pre">) => {
    const { children } = props;
    if (isReactElement(children)) {
      const className = children.props?.className;
      const chart = children.props?.children;
      if (
        typeof chart === "string" &&
        (className === "language-mermaid" ||
          (typeof className === "string" &&
            className.includes("language-mermaid")))
      ) {
        return <Mermaid chart={chart} className="mdx-mermaid" />;
      }
    }

    return <CodeBlock {...props} />;
  },
  blockquote: Blockquote,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // biome-ignore lint/performance/noImgElement: Docs content deliberately uses plain img tags.
    <img className={s.image} src={props.src} alt={props.alt} />
  ),
  VTSequence,
  CardLinks,
  ButtonLinks,
  DonateCard,
  SponsorCard,
  GitHub,
  Video,
  Callout,
  Note,
  Tip,
  Important,
  Warning,
  Caution,
  "callout-title": () => null,
  Mermaid: (props: { chart: string; id?: string; className?: string }) => (
    <Mermaid {...props} />
  ),
};
