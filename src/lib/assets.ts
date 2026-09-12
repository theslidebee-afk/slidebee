import { supabase } from "./supabase";

export interface MediaAsset {
  id: string;
  key: string;
  title: string;
  category: string;
  url: string;
  alt_text: string;
  metadata?: Record<string, any>;
}

// In-memory fallback / cache (optimized WebP)
const defaultAssets: Record<string, string> = {
  case_study_1: "/portfolio/case_study_a_1.webp",
  case_study_2: "/portfolio/case_study_a_2.webp",
  case_study_8: "/portfolio/case_study_a_8.webp",
  case_study_14: "/portfolio/case_study_a_14.webp",
  nike_cvs_1: "/portfolio/nike_hsbc_cvs_1.webp",
  nike_cvs_2: "/portfolio/nike_hsbc_cvs_2.webp",
  nike_cvs_8: "/portfolio/nike_hsbc_cvs_8.webp",
  nike_cvs_10: "/portfolio/nike_hsbc_cvs_10.webp",
  global_brands_1: "/portfolio/global_brands_1.webp",
  levis_1: "/portfolio/levis_yuengling_1.webp",
  levis_6: "/portfolio/levis_yuengling_6.webp",
  levis_7: "/portfolio/levis_yuengling_7.webp"
};

let cachedAssets: Record<string, string> = { ...defaultAssets };

export async function loadAssetsFromDatabase(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.from("assets").select("key, url");
    if (!error && data) {
      data.forEach((item: { key: string; url: string }) => {
        cachedAssets[item.key] = item.url;
      });
    }
  } catch (err) {
    console.warn("Could not fetch dynamic assets, using fallback:", err);
  }
  return cachedAssets;
}

export function getAssetUrl(key: string): string {
  return cachedAssets[key] || defaultAssets[key] || "/portfolio/case_study_a_1.webp";
}
