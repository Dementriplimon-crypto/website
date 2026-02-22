import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import s from "./ScrollToTop.module.css";
import classNames from "classnames";

export default function ScrollToTopButton() {
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const setScrollToTopButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Show button when scrolled down more than 100px
      if (scrollTop > 100) {
        setShowScrollToTopButton(true);
      } else {
        setShowScrollToTopButton(false);
      }

      // Keep track if we're completely at the bottom of the page, as to lift
      // the scroll to top button as to not cover the footer.
      const isNotAtBottom = documentHeight - (scrollTop + windowHeight) > 50;
      if (isNotAtBottom) {
        setIsAtBottom(false);
      } else {
        setIsAtBottom(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    showScrollToTopButton && (
      <button
        type="button"
        ref={setScrollToTopButtonRef}
        className={classNames(s.scrollToTopButton, {
          [s.isAtBottom]: isAtBottom,
        })}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={16} />
      </button>
    )
  );
}
