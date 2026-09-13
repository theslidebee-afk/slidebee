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

  // Handle same-page quick link clicks
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Extract path from hash router URLs (e.g., "#/services" or "#/pricing")
      const currentHash = window.location.hash.replace(/^#/, "");
      const [currentRoute] = currentHash.split("?");

      let targetRoute = href;
      if (targetRoute.startsWith("#/")) {
        targetRoute = targetRoute.slice(1);
      } else if (targetRoute.startsWith("#") && targetRoute.length > 1) {
        // In-page anchor hash
        return;
      }

      const [targetCleanRoute] = targetRoute.split("?");

      // Normalize root paths
      const normalizedCurrent = currentRoute === "" || currentRoute === "/home" ? "/" : currentRoute;
      const normalizedTarget = targetCleanRoute === "" || targetCleanRoute === "/home" ? "/" : targetCleanRoute;

      if (normalizedCurrent === normalizedTarget && !href.includes("#services-grid") && !href.includes("#marketplace")) {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        document.body.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  return null;
}
