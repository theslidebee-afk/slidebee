import { useEffect } from "react";

export interface PageSEOProps {
  title: string;
  description: string;
  keywords?: string[] | string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: "summary" | "summary_large_image";
  twitterImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export function usePageSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = "website",
  ogImage,
  ogUrl,
  twitterCard = "summary_large_image",
  twitterImage,
  jsonLd,
}: PageSEOProps) {
  useEffect(() => {
    // 1. Format Document Title
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

    // 3. Clean keywords string
    const keywordsStr = Array.isArray(keywords)
      ? keywords.filter(Boolean).join(", ")
      : typeof keywords === "string"
      ? keywords
      : "";

    // 4. Resolve absolute image URL for Open Graph & Twitter
    const defaultImage = "https://theslidebee.com/slidebee_logo_light.png";
    let resolvedImage = ogImage || twitterImage || defaultImage;
    if (resolvedImage && resolvedImage.startsWith("/")) {
      resolvedImage = `https://theslidebee.com${resolvedImage}`;
    }

    // 5. Resolve active canonical and OG URL
    const activeUrl = canonicalUrl || ogUrl || (typeof window !== "undefined" ? window.location.href : "https://theslidebee.com/");

    // 6. Set Core Metadata
    setMetaTag("name", "title", formattedTitle);
    setMetaTag("name", "description", description);
    if (keywordsStr) {
      setMetaTag("name", "keywords", keywordsStr);
    }

    // 7. Open Graph Metadata
    setMetaTag("property", "og:title", formattedTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:image", resolvedImage);
    setMetaTag("property", "og:url", activeUrl);
    setMetaTag("property", "og:site_name", "SlideBee");

    // 8. Twitter / X Cards
    setMetaTag("name", "twitter:card", twitterCard);
    setMetaTag("property", "twitter:card", twitterCard);
    setMetaTag("name", "twitter:title", formattedTitle);
    setMetaTag("property", "twitter:title", formattedTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("property", "twitter:description", description);
    setMetaTag("name", "twitter:image", resolvedImage);
    setMetaTag("property", "twitter:image", resolvedImage);

    // 9. Update Canonical Link
    const targetCanonical = canonicalUrl || (typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "https://theslidebee.com/");
    let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkElement) {
      linkElement = document.createElement("link");
      linkElement.setAttribute("rel", "canonical");
      document.head.appendChild(linkElement);
    }
    linkElement.setAttribute("href", targetCanonical);

    // 10. Dynamic JSON-LD Structured Data
    if (jsonLd) {
      let scriptTag = document.getElementById("page-dynamic-jsonld") as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "page-dynamic-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      // Clean up dynamic JSON-LD tag on page unmount
      const scriptTag = document.getElementById("page-dynamic-jsonld");
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, ogUrl, twitterCard, twitterImage, jsonLd]);
}

export default usePageSEO;
