import classNames from "classnames";
import GridContainer, { NavAndFooterGridConfig } from "../grid-container";
import Link, { type SimpleLink } from "../link";
import { P } from "../text";
import s from "./Footer.module.css";

interface FooterProps {
  className?: string;
  links?: SimpleLink[];
  copyright: string;
}

export default function Footer({ className, links, copyright }: FooterProps) {
  return (
    <footer className={classNames(s.footer, className)}>
      <GridContainer
        className={s.gridContainer}
        gridConfig={NavAndFooterGridConfig}
      >
        {links && (
          <ul className={s.linkList}>
            {links.map((link) => {
              return (
                <li key={link.text}>
                  <Link {...link} />
                </li>
              );
            })}
          </ul>
        )}
        <P className={s.copyright}>{copyright}</P>
      </GridContainer>
    </footer>
  );
}
