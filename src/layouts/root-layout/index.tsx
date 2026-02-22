import { jetbrainsMono, pretendardStdVariable } from "@/components/text";
import PreviewBanner from "@/components/preview-banner";
import classNames from "classnames";
import s from "./RootLayout.module.css";

export interface RootLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export default function RootLayout({ className, children }: RootLayoutProps) {
  return (
    <div
      className={classNames(
        s.rootLayout,
        pretendardStdVariable.variable,
        jetbrainsMono.variable,
        className,
      )}
    >
      <PreviewBanner />
      {children}
    </div>
  );
}
