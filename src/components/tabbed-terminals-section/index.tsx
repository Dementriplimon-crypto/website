"use client";

import classNames from "classnames";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import SectionWrapper from "../section-wrapper";
import Terminal from "../terminal";
import { H1, H4, P } from "../text";
import s from "./TabbedTerminalsSection.module.css";

interface TerminalTab {
  title: string;
  description: string;
  lines: string[];
}

interface TabbedTerminalsSectionProps {
  className?: string;
  title: string;
  terminalTabs: TerminalTab[];
}

export default function TabbedTerminalsSection({
  className,
  title,
  terminalTabs,
}: TabbedTerminalsSectionProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <SectionWrapper className={classNames(s.tabbedTerminalsSection, className)}>
      <div className={s.content}>
        <div className={s.primary}>
          <H1>{title}</H1>
          <ul className={s.tabs}>
            {terminalTabs.map((tab, i) => {
              const isActiveTab = i === activeTabIndex;
              return (
                <li
                  key={tab.title}
                  className={classNames({
                    [s.active]: isActiveTab,
                  })}
                >
                  <button
                    type="button"
                    className={s.header}
                    onClick={() => setActiveTabIndex(i)}
                  >
                    <H4>{tab.title}</H4>
                    <ChevronDown size={16} />
                  </button>
                  {isActiveTab && (
                    <div className={s.tabContent}>
                      <Terminal
                        className={s.terminal}
                        fontSize="small"
                        columns={70}
                        rows={14}
                        title="~"
                        lines={terminalTabs[i].lines}
                      />
                      <P className={s.description}>{tab.description}</P>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className={s.spotlight}>
          <Terminal
            fontSize="medium"
            columns={60}
            rows={16}
            title="~"
            lines={terminalTabs[activeTabIndex].lines}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
