import { normalizeR2Url, R2_PUBLIC_BASE_URL } from "./r2";

/**
 * Validates whether a given URL points to a legitimate presentation deliverable (.pptx, .ppt, .zip).
 * Rejects image files (.jpg, .jpeg, .png, .webp, .svg, .gif) to prevent image-download corruption.
 */
export function isValidPptxUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.trim().toLowerCase();
  if (clean.length === 0) return false;

  // Explicitly reject preview images
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif"];
  for (const ext of imageExtensions) {
    if (clean.endsWith(ext) || clean.includes(`${ext}?`)) {
      return false;
    }
  }

  // Check valid presentation extensions
  return (
    clean.endsWith(".pptx") ||
    clean.endsWith(".ppt") ||
    clean.endsWith(".zip") ||
    clean.includes(".pptx?") ||
    clean.includes(".ppt?") ||
    clean.includes(".zip?") ||
    clean.includes("/templates/decks/")
  );
}

export function getTemplateSecureDownloadUrl(template?: any | null): string | null {
  if (!template) return null;
  const idOrCode = template.id || template.code;
  if (!idOrCode) return null;
  return `/api/download?id=${encodeURIComponent(idOrCode)}`;
}

/**
 * Resolves the genuine presentation deliverable URL for a template.
 * ZERO SILENT FALLBACK TO IMAGES: Returns null if no valid PPTX file is present.
 */
export function getTemplateDeliverableUrl(template?: any | null): string | null {
  if (!template) return null;

  // 1. Direct download_url check
  if (template.download_url && isValidPptxUrl(template.download_url)) {
    return normalizeR2Url(template.download_url, "decks");
  }

  // 2. pptx_file_url alias check
  if (template.pptx_file_url && isValidPptxUrl(template.pptx_file_url)) {
    return normalizeR2Url(template.pptx_file_url, "decks");
  }

  // 3. Direct file_name check (if uploaded with genuine .pptx filename)
  if (template.file_name && isValidPptxUrl(template.file_name)) {
    return normalizeR2Url(template.file_name, "decks");
  }

  // 4. Formats array check
  if (Array.isArray(template.formats)) {
    for (const f of template.formats) {
      if (typeof f === "string" && isValidPptxUrl(f)) {
        return normalizeR2Url(f, "decks");
      }
    }
  }

  // 3. Check code-based or slug-based deck in R2 if explicitly mapped
  const code = (template.code || "").toUpperCase().trim();
  const knownDecks: Record<string, string> = {
    "SLD-101": `${R2_PUBLIC_BASE_URL}/templates/decks/accenture.pptx`,
    "SLD-102": `${R2_PUBLIC_BASE_URL}/templates/decks/nike.pptx`,
    "SLD-104": `${R2_PUBLIC_BASE_URL}/templates/decks/intel.pptx`,
    "SLD-105": `${R2_PUBLIC_BASE_URL}/templates/decks/hsbc.pptx`,
    "SLD-106": `${R2_PUBLIC_BASE_URL}/templates/decks/cvs_health.pptx`,
    "SLD-107": `${R2_PUBLIC_BASE_URL}/templates/decks/accenture.pptx`,
    "SLD-108": `${R2_PUBLIC_BASE_URL}/templates/decks/nike.pptx`,
    "SLD-109": `${R2_PUBLIC_BASE_URL}/templates/decks/volvo.pptx`,
    "SLD-301": `${R2_PUBLIC_BASE_URL}/templates/decks/accenture.pptx`,
    "SLD-1234": `${R2_PUBLIC_BASE_URL}/templates/decks/accenture.pptx`,
    "SLD-1235": `${R2_PUBLIC_BASE_URL}/templates/decks/cvs_health.pptx`,
    "SLD-113": `${R2_PUBLIC_BASE_URL}/templates/decks/accenture.pptx`,
    "SLD-180": `${R2_PUBLIC_BASE_URL}/templates/decks/construction_infographic_light_1791181825938.pptx`
  };

  if (code && knownDecks[code]) {
    return knownDecks[code];
  }

  // No valid PPTX deliverable found
  return null;
}

/**
 * Triggers a native browser file download for a verified PPTX presentation.
 */
export function triggerPptxDownload(deliverableUrl: string, fallbackFileName = "slidebee-presentation.pptx"): void {
  const link = document.createElement("a");
  link.href = deliverableUrl;
  link.download = fallbackFileName.endsWith(".pptx") ? fallbackFileName : `${fallbackFileName}.pptx`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
