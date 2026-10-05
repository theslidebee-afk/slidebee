import { convertGoogleDriveUrl, R2_PUBLIC_BASE_URL } from "../../../../lib/r2";
import { d1 } from "../../../../lib/d1";

export interface CsvIssue {
  row: number;
  code: string;
  title: string;
  field: string;
  issue: string;
}

export function handleDownloadSampleCSV() {
  const sampleHeaders = "code,title,category,price_inr,price_usd,slide_count,thumbnail_url,slides_preview_urls,pptx_file_url,tier,is_credit_eligible,formats,description,features\n";
  const sampleRows = 
    `"SLD-101","Series A SaaS Pitch Deck Pro","Pitch Decks",999,19,20,"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-2.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-3.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-4.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/decks/accenture.pptx","pro","true","PowerPoint;Google Slides","High-converting 20-slide pitch deck layout with financial unit economics and investor traction metrics.","20+ Editable Vector Slides;16:9 Widescreen Layout;Dark & Light Mode;Free Google Fonts;Master Color Tokens"\n` +
    `"SLD-102","Executive Board Review 2026","Corporate",1499,29,45,"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-2.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-3.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-4.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/decks/cvs_health.pptx","pro","false","PowerPoint;Keynote","Minimalist corporate executive board presentation system with financial tables and governance frameworks.","45+ Governance & Financial Slides;Data-Dense Executive Layouts;Custom SVG Icons Included;Editable Master PPTX"\n` +
    `"SLD-103","Modern Brand Styleguide & Guidelines","Branding",0,0,25,"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-2.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-3.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-4.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/decks/nike.pptx","free","false","PowerPoint;Canva","Complete visual identity presentation system with color tokens, logo safe-zones, and editorial typography.","25 Modular Brand Guidelines Slides;Color Swatch Placeholders;Typography Scaling Hierarchy;Master PowerPoint (.pptx)"`;
  
  const blob = new Blob([sampleHeaders + sampleRows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "slidebee_templates_bulk_sample.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseAndValidateCsv(
  raw: string,
  templates: any[]
): {
  items: any[];
  errors: CsvIssue[];
  warnings: CsvIssue[];
} {
  const lines = raw.trim().split("\n");
  if (lines.length < 2) {
    return { items: [], errors: [], warnings: [] };
  }

  const rawHeaders = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  const hasHeaderCode = rawHeaders.includes("code") || rawHeaders.includes("sku");

  const getColIndex = (name: string, fallbackIdx: number): number => {
    const idx = rawHeaders.indexOf(name);
    return idx !== -1 ? idx : fallbackIdx;
  };

  const codeIdx = getColIndex("code", 0);
  const titleIdx = hasHeaderCode ? getColIndex("title", 1) : getColIndex("title", 0);
  const catIdx = hasHeaderCode ? getColIndex("category", 2) : getColIndex("category", 1);
  const inrIdx = hasHeaderCode ? getColIndex("price_inr", 3) : getColIndex("price_inr", 2);
  const usdIdx = hasHeaderCode ? getColIndex("price_usd", 4) : getColIndex("price_usd", 3);
  const slidesCountIdx = hasHeaderCode ? getColIndex("slide_count", 5) : getColIndex("slide_count", 4);
  const thumbIdx = hasHeaderCode ? getColIndex("thumbnail_url", 6) : getColIndex("thumbnail_url", 5);
  const previewUrlsIdx = getColIndex("slides_preview_urls", 7);
  const pptxIdx = getColIndex("pptx_file_url", -1) !== -1
    ? getColIndex("pptx_file_url", -1)
    : getColIndex("pptx_url", -1) !== -1
    ? getColIndex("pptx_url", -1)
    : getColIndex("download_url", 8);
  const tierIdx = getColIndex("tier", -1);
  const descIdx = hasHeaderCode ? getColIndex("description", 11) : getColIndex("description", 6);
  const featuresIdx = getColIndex("features", 12);
  const creditEligibleIdx = getColIndex("is_credit_eligible", -1);
  const formatsIdx = getColIndex("formats", -1);

  const items: any[] = [];
  const errors: CsvIssue[] = [];
  const warnings: CsvIssue[] = [];

  const seenCodesInCsv = new Map<string, number>();
  const seenTitlesInCsv = new Map<string, number>();

  const existingCodeMap = new Map<string, string>();
  const existingTitleMap = new Map<string, string>();
  templates.forEach((t) => {
    if (t.code && t.code.trim()) {
      existingCodeMap.set(t.code.trim().toUpperCase(), t.title || "Existing Store Item");
    }
    if (t.title && t.title.trim()) {
      existingTitleMap.set(t.title.trim().toLowerCase(), t.code || t.id || "Store Item");
    }
  });

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = parseCSVLine(line);
    const rowNum = i + 1;

    const rawCode = (parts[codeIdx] || "").trim();
    const rawTitle = (parts[titleIdx] || "").trim();
    const rawCategory = (parts[catIdx] || "").trim();
    const rawInr = (parts[inrIdx] || "").trim();
    const rawUsd = (parts[usdIdx] || "").trim();
    const rawThumb = (parts[thumbIdx] || "").trim();
    const rawDownload = (parts[pptxIdx] || "").trim();

    if (!rawCode) {
      errors.push({
        row: rowNum,
        code: "MISSING",
        title: rawTitle || "Untitled",
        field: "code",
        issue: "SKU / Code is required for every template (e.g. SLD-101)",
      });
    } else {
      const normalizedCode = rawCode.toUpperCase();
      if (seenCodesInCsv.has(normalizedCode)) {
        errors.push({
          row: rowNum,
          code: rawCode,
          title: rawTitle,
          field: "code",
          issue: `Duplicate SKU "${rawCode}" detected in CSV (first appeared at row ${seenCodesInCsv.get(normalizedCode)})`,
        });
      } else {
        seenCodesInCsv.set(normalizedCode, rowNum);
      }

      if (existingCodeMap.has(normalizedCode)) {
        errors.push({
          row: rowNum,
          code: rawCode,
          title: rawTitle,
          field: "code",
          issue: `SKU "${rawCode}" is already taken by existing store template "${existingCodeMap.get(normalizedCode)}"`,
        });
      }
    }

    if (!rawTitle || rawTitle.length < 3) {
      errors.push({
        row: rowNum,
        code: rawCode || "—",
        title: rawTitle || "EMPTY",
        field: "title",
        issue: "Title is missing or too short (minimum 3 characters required)",
      });
    } else {
      const normalizedTitle = rawTitle.toLowerCase();
      if (seenTitlesInCsv.has(normalizedTitle)) {
        warnings.push({
          row: rowNum,
          code: rawCode || "—",
          title: rawTitle,
          field: "title",
          issue: `Duplicate title "${rawTitle}" repeated in this CSV (first at row ${seenTitlesInCsv.get(normalizedTitle)})`,
        });
      } else {
        seenTitlesInCsv.set(normalizedTitle, rowNum);
      }

      if (existingTitleMap.has(normalizedTitle)) {
        warnings.push({
          row: rowNum,
          code: rawCode || "—",
          title: rawTitle,
          field: "title",
          issue: `A template titled "${rawTitle}" already exists in your store (SKU: ${existingTitleMap.get(normalizedTitle)})`,
        });
      }
    }

    const rawTier = tierIdx !== -1 ? (parts[tierIdx] || "").trim().toLowerCase() : "";
    const isFreeTier = rawTier === "free" || rawInr === "0" || parts[getColIndex("is_free", -1)] === "true";

    const price_inr = isFreeTier ? 0 : Number(rawInr);
    const price_usd = isFreeTier ? 0 : Number(rawUsd);
    if (!isFreeTier) {
      if (isNaN(price_inr) || price_inr <= 0) {
        errors.push({
          row: rowNum,
          code: rawCode || "—",
          title: rawTitle,
          field: "price_inr",
          issue: `Price INR must be greater than 0 ("${rawInr}" given). For 100% Free tier decks, set tier to "free".`,
        });
      }
      if (isNaN(price_usd) || price_usd <= 0) {
        errors.push({
          row: rowNum,
          code: rawCode || "—",
          title: rawTitle,
          field: "price_usd",
          issue: `Price USD must be greater than 0 ("${rawUsd}" given). For 100% Free tier decks, set tier to "free".`,
        });
      }
    }

    if (!rawThumb) {
      errors.push({
        row: rowNum,
        code: rawCode || "—",
        title: rawTitle,
        field: "thumbnail_url",
        issue: "Cover thumbnail image URL is missing",
      });
    } else if (!rawThumb.startsWith("http://") && !rawThumb.startsWith("https://") && !rawThumb.startsWith("/")) {
      errors.push({
        row: rowNum,
        code: rawCode || "—",
        title: rawTitle,
        field: "thumbnail_url",
        issue: `Malformed thumbnail URL: "${rawThumb}". Must be a valid URL starting with https:// or /`,
      });
    }

    let slides: string[] = [];
    if (parts[previewUrlsIdx]) {
      slides = parts[previewUrlsIdx].split(/[;|]/).map(s => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
    }
    if (slides.length === 0) {
      slides = [rawThumb || "/portfolio/case_study_a_1.png"];
      warnings.push({
        row: rowNum,
        code: rawCode || "—",
        title: rawTitle,
        field: "slides_preview_urls",
        issue: "No multi-slide preview URLs provided; using cover thumbnail only",
      });
    }

    const title = rawTitle || `Executive Template ${i}`;
    const code = rawCode || `SLD-${Math.floor(100 + Math.random() * 900)}`;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${code.toLowerCase()}`;
    const thumbnail_url = convertGoogleDriveUrl(rawThumb, true) || "/portfolio/case_study_a_1.png";
    const convertedSlides = slides.map(s => convertGoogleDriveUrl(s, true));
    const slide_count = Number(parts[slidesCountIdx]) || convertedSlides.length || 25;

    let features: string[] = [
      `${slide_count}+ High-Impact Slides`,
      "16:9 Widescreen Layout",
      "Fully Editable Vector Elements"
    ];
    if (parts[featuresIdx]) {
      const parsedFeats = parts[featuresIdx].split(/[;|]/).map(f => f.trim().replace(/^"|"$/g, "")).filter(Boolean);
      if (parsedFeats.length > 0) features = parsedFeats;
    }

    if (!rawDownload) {
      errors.push({
        row: rowNum,
        code: rawCode || "—",
        title: rawTitle,
        field: "pptx_file_url",
        issue: "Master PowerPoint file (.pptx) URL is missing. Every template requires an attached PPTX deck.",
      });
    } else if (rawDownload.endsWith(".jpg") || rawDownload.endsWith(".jpeg") || rawDownload.endsWith(".png") || rawDownload.endsWith(".webp")) {
      errors.push({
        row: rowNum,
        code: rawCode || "—",
        title: rawTitle,
        field: "pptx_file_url",
        issue: `Cannot use a preview image ("${rawDownload}") as the Master PPTX deliverable. Must be a .pptx file.`,
      });
    }

    const download_url = rawDownload
      ? convertGoogleDriveUrl(rawDownload, false)
      : `${R2_PUBLIC_BASE_URL}/templates/decks/${code.toLowerCase()}.pptx`;
    const is_credit_eligible = creditEligibleIdx !== -1
      ? (parts[creditEligibleIdx]?.toLowerCase() === "true" || parts[creditEligibleIdx] === "1")
      : false;

    const parsedFormats = formatsIdx !== -1 && parts[formatsIdx]
      ? parts[formatsIdx].split(/[;|]/).map(f => f.trim()).filter(Boolean)
      : ["PowerPoint"];

    items.push({
      code,
      title,
      slug,
      category: rawCategory || "Pitch Decks",
      price_inr: isFreeTier ? 0 : (isNaN(price_inr) ? 499 : price_inr),
      price_usd: isFreeTier ? 0 : (isNaN(price_usd) ? 9 : price_usd),
      slide_count,
      thumbnail_url,
      slides: convertedSlides,
      download_url,
      is_credit_eligible,
      formats: parsedFormats,
      description: parts[descIdx] || "Executive master presentation deck with clean typography and corporate hierarchy.",
      features,
      is_premium: isFreeTier ? 0 : 1,
      is_published: 1,
      is_featured: false,
      is_hero: false,
      downloads_count: 0
    });
  }

  return { items, errors, warnings };
}

export async function executeBulkImport(
  templatesToInsert: any[],
  shouldMirrorAssets: boolean,
  setIngestStatus: (status: string | null) => void
): Promise<{ success: boolean; insertedCount: number; error?: string }> {
  try {
    let finalPayload = [...templatesToInsert];

    if (shouldMirrorAssets) {
      setIngestStatus("Scanning and mirroring assets to Cloudflare R2...");
      try {
        const mirrorRes = await fetch("/api/mirror-assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templates: finalPayload }),
        });
        if (mirrorRes.ok) {
          const mirrorData = await mirrorRes.json();
          if (mirrorData.templates && Array.isArray(mirrorData.templates)) {
            finalPayload = mirrorData.templates;
          }
        }
      } catch (mirrorErr) {
        console.warn("Asset mirroring warning:", mirrorErr);
      }
    }

    setIngestStatus("Writing templates to Cloudflare D1 database...");
    const { data: inserted, error } = await d1
      .from("templates")
      .insert(finalPayload)
      .select();

    if (error) {
      throw error;
    }

    return { success: true, insertedCount: inserted ? inserted.length : finalPayload.length };
  } catch (err: any) {
    return { success: false, insertedCount: 0, error: err.message || String(err) };
  } finally {
    setIngestStatus(null);
  }
}
