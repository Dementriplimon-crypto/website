import classNames from "classnames";
import type { ReactNode } from "react";
import SectionWrapper from "../section-wrapper";
import { H1, H3, P } from "../text";
import s from "./InfoCards.module.css";

interface InfoCardsSectionProps {
  className?: string;
  title: string;
  infoCards: InfoCard[];
}

interface InfoCard {
  title: string;
  description: string;
  icon: ReactNode;
}

export default function InfoCardsSection({
  className,
  title,
  infoCards,
}: InfoCardsSectionProps) {
  return (
    <SectionWrapper className={classNames(s.infoCardsSection, className)}>
      <H1 className={s.sectionTitle}>{title}</H1>
      <ul className={s.infoCards}>
        {infoCards.map((infoCard) => {
          return (
            <li key={infoCard.title}>
              <div className={s.iconContainer}>{infoCard.icon}</div>
              <H3>{infoCard.title}</H3>
              <P>{infoCard.description}</P>
            </li>
          );
        })}
      </ul>
    </SectionWrapper>
  );
}
