import { useEffect } from "react";

interface PageSEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: string;
}

export function usePageSEO({ title, description, canonicalUrl, ogType = "website" }: PageSEOProps) {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title.includes("SlideBee") ? title : `${title} | SlideBee`;
    document.title = formattedTitle;

    // 2. Helper to set or create meta tag
    const setMetaTag = (attribute: "name" | "property", key: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 3. Set Standard & Open Graph Meta Tags
    setMetaTag("name", "title", formattedTitle);
    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", formattedTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "twitter:title", formattedTitle);
    setMetaTag("property", "twitter:description", description);

    // 4. Update Canonical Link
    if (canonicalUrl) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!linkElement) {
        linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "canonical");
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute("href", canonicalUrl);
    }
  }, [title, description, canonicalUrl, ogType]);
}

export default usePageSEO;
