import { ButtonLink, type ButtonTheme } from "../link";
import s from "./ButtonLinks.module.css";

interface ButtonLinks {
  text: string;
  href: string;
  theme?: ButtonTheme;
}

interface ButtonLinkProps {
  links: ButtonLinks[];
  columns?: number;
  columnsWhenSmall?: number;
}

export default function ButtonLinks({
  links,
  columns = links.length,
  columnsWhenSmall = columns,
}: ButtonLinkProps) {
  return (
    <div
      className={s.buttonLinks}
      style={
        {
          "--large-size-columns": columns,
          "--small-size-columns": columnsWhenSmall,
        } as React.CSSProperties
      }
    >
      <ul>
        {links.map(({ href, text, theme = "brand" }) => {
          return (
            <li key={text + href}>
              <ButtonLink href={href} text={text} theme={theme} size="large" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
