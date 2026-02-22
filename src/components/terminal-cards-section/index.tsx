import classNames from "classnames";
import SectionWrapper from "../section-wrapper";
import Terminal from "../terminal";
import { H1, H3, P } from "../text";
import s from "./TerminalCardsSection.module.css";

interface TerminalCardsSectionProps {
  className?: string;
  title: string;
  description?: string;
  cards: TerminalCard[];
}

interface TerminalCard {
  title: string;
  description: string;
  terminal: TerminalState;
}

interface TerminalState {
  title: string;
  lines: string[];
}

export default function TerminalCardsSection({
  className,
  title,
  description,
  cards,
}: TerminalCardsSectionProps) {
  return (
    <SectionWrapper className={classNames(s.terminalCardsSection, className)}>
      <div className={s.header}>
        <H1 className={s.title}>{title}</H1>
        <P className={s.description}>{description}</P>
      </div>
      <ul className={s.cards}>
        {cards.map((card) => {
          return (
            <li key={card.title}>
              <div className={s.terminalWrapper}>
                <Terminal
                  className={s.terminal}
                  fontSize="small"
                  rows={14}
                  columns={50}
                  lines={card.terminal.lines}
                  title={card.terminal.title}
                />
              </div>
              <H3 className={s.title}>{card.title}</H3>
              <P className={s.description}>{card.description}</P>
            </li>
          );
        })}
      </ul>
    </SectionWrapper>
  );
}
