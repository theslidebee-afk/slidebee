import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface StoreTemplate {
  id: string;
  code: string;
  title: string;
  category: string;
  price_inr: number;
  price_usd: number;
  original_price_inr: number;
  image_url: string;
  slides: string[];
  slides_count: number;
  rating: number;
  downloads: number;
  download_url?: string;
  file_name: string;
  file_size: string;
  description: string;
  features: string[];
  is_credit_eligible: boolean;
  is_featured: boolean;
  is_published: boolean;
  created_at?: string;
}

export interface StudioStoreOptions {
  category?: string;
  searchQuery?: string;
  onlyCreditEligible?: boolean;
}

/**
 * Deep Module: StudioStoreClient
 * 
 * Public Interface:
 * - templates: Active catalog items queried from v_storefront_catalog
 * - freeTemplates: Credit-eligible templates from v_free_credit_library
 * - showStars: Visibility toggle for star ratings from site_config
 * - showDownloads: Visibility toggle for download counts from site_config
 * - loading: Boolean catalog loading state
 * - refetch(): Re-executes catalog queries
 */
export function useStudioStore(options: StudioStoreOptions = {}) {
  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [freeTemplates, setFreeTemplates] = useState<StoreTemplate[]>([]);
  const [showStars, setShowStars] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch site_config metrics toggle
      const { data: configData } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "show_template_metrics")
        .maybeSingle();

      if (configData?.value) {
        setShowStars(Boolean(configData.value.show_stars));
        setShowDownloads(Boolean(configData.value.show_downloads));
      }

      // 2. Fetch full catalog from Deep Module view v_storefront_catalog
      const { data: catalogData, error: catErr } = await supabase
        .from("v_storefront_catalog")
        .select("*")
        .order("created_at", { ascending: false });

      if (catErr) throw catErr;

      const normalized: StoreTemplate[] = (catalogData || []).map((t: any) => ({
        id: t.id,
        code: t.code || `SLD-${t.id.slice(0, 4).toUpperCase()}`,
        title: t.title,
        category: t.category || "Business",
        price_inr: Number(t.price_inr) || 499,
        price_usd: Number(t.price_usd) || 9,
        original_price_inr: Number(t.original_price_inr) || 999,
        image_url: t.image_url || "/portfolio/case_study_a_1.png",
        slides: Array.isArray(t.slides) ? t.slides : [t.image_url],
        slides_count: Number(t.slides_count) || 30,
        rating: Number(t.rating) || 4.9,
        downloads: Number(t.downloads) || 120,
        download_url: t.download_url,
        file_name: t.file_name || "Master_Presentation.pptx",
        file_size: t.file_size || "4.5 MB",
        description: t.description || "Executive presentation deck tailored for high-stakes business meetings.",
        features: Array.isArray(t.features) ? t.features : ["30+ High-Impact Slides", "16:9 Widescreen Format", "Master PowerPoint (.pptx)"],
        is_credit_eligible: Boolean(t.is_credit_eligible),
        is_featured: Boolean(t.is_featured),
        is_published: Boolean(t.is_published),
        created_at: t.created_at
      }));

      setTemplates(normalized);
      setFreeTemplates(normalized.filter(t => t.is_credit_eligible));
    } catch (err: any) {
      console.warn("Studio Storefront fetch notice:", err.message);
      setError(err.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const filteredTemplates = templates.filter((t) => {
    if (options.onlyCreditEligible && !t.is_credit_eligible) return false;
    if (options.category && options.category !== "All" && t.category.toLowerCase() !== options.category.toLowerCase()) {
      return false;
    }
    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return {
    templates: filteredTemplates,
    allTemplates: templates,
    freeTemplates,
    showStars,
    showDownloads,
    loading,
    error,
    refetch: fetchCatalog
  };
}
