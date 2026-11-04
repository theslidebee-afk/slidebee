import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component
 * Ensures that every page transition resets the window scroll position to (0, 0).
 * Handles:
 * 1. Standard route transitions (resets scroll to top immediately).
 * 2. Hash anchor navigation (scrolls to element if present).
 * 3. Same-route link clicks (smoothly scrolls back to top).
 * 4. Browser history popstate (sets manual scroll restoration).
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Disable default browser scroll restoration to prevent popstate scroll retention
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (hash) {
      // Allow DOM to settle before resolving element ID
      const elementId = hash.replace(/^#/, "");
      const timer = setTimeout(() => {
        const target = document.getElementById(elementId) || document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 60);
      return () => clearTimeout(timer);
    }

    // Reset window and document scroll immediately
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Redundant check in the next animation frame to counteract dynamic layout shifts
    const frameId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(frameId);
  }, [pathname, search, hash]);

  return null;
}
