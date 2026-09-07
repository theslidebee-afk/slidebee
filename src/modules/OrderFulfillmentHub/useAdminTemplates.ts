import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export interface NewTemplatePayload {
  title: string;
  category: string;
  code?: string;
  price_inr: number;
  price_usd: number;
  original_price_inr?: number;
  slide_count: number;
  description: string;
  thumbnail_url: string;
  slides: string[];
  download_url: string;
  file_name?: string;
  file_size?: string;
  is_credit_eligible?: boolean;
  features?: string[];
  is_published?: boolean;
}

/**
 * Deep Module: OrderFulfillmentHub (Admin Template Operations)
 * 
 * Public Interface:
 * - templates: Live array of templates from public.templates
 * - loading: Loading status boolean
 * - error: Any error message
 * - createSingleTemplate(payload): Creates single template in database
 * - bulkImportTemplates(templatesArray): Inserts array of parsed templates
 * - deleteTemplate(id): Deletes template from database
 * - toggleCreditEligibility(id, isEligible): Toggles free starter credit library membership
 * - refetch(): Re-reads templates from Supabase
 */
export function useAdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setTemplates(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createSingleTemplate = async (payload: NewTemplatePayload) => {
    const slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const code = payload.code || `SLD-${Math.floor(100 + Math.random() * 900)}`;
    const effectiveSlides = payload.slides.length > 0 ? payload.slides : [payload.thumbnail_url];

    const dbRecord = {
      title: payload.title,
      slug,
      code,
      category: payload.category || "Business",
      price_inr: payload.price_inr || 499,
      price_usd: payload.price_usd || 9,
      original_price_inr: payload.original_price_inr || (payload.price_inr * 2),
      slide_count: payload.slide_count || effectiveSlides.length,
      slides_count: payload.slide_count || effectiveSlides.length,
      thumbnail_url: payload.thumbnail_url,
      image_url: payload.thumbnail_url,
      slides: effectiveSlides,
      download_url: payload.download_url || payload.thumbnail_url,
      file_name: payload.file_name || "Master_Deck.pptx",
      file_size: payload.file_size || "4.5 MB",
      formats: ["Master PowerPoint (.pptx)"],
      description: payload.description || "Executive presentation deck layout.",
      features: payload.features || [
        `${payload.slide_count || 30}+ High-Impact Slides`,
        "16:9 Widescreen Format",
        "Master PowerPoint (.pptx)"
      ],
      is_credit_eligible: Boolean(payload.is_credit_eligible),
      is_published: payload.is_published ?? true
    };

    const { data, error: insertErr } = await supabase
      .from("templates")
      .insert([dbRecord])
      .select();

    if (insertErr) throw insertErr;
    if (data && data[0]) {
      setTemplates(prev => [data[0], ...prev]);
      return data[0];
    }
    return dbRecord;
  };

  const bulkImportTemplates = async (items: any[]) => {
    const formatted = items.map(item => ({
      ...item,
      formats: ["Master PowerPoint (.pptx)"],
      is_credit_eligible: Boolean(item.is_credit_eligible)
    }));

    const { data, error: bulkErr } = await supabase
      .from("templates")
      .insert(formatted)
      .select();

    if (bulkErr) throw bulkErr;
    if (data) {
      setTemplates(prev => [...data, ...prev]);
      return data;
    }
    return formatted;
  };

  const deleteTemplate = async (id: string) => {
    const { error: delErr } = await supabase
      .from("templates")
      .delete()
      .eq("id", id);

    if (delErr) throw delErr;
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const toggleCreditEligibility = async (id: string, isEligible: boolean) => {
    const { error: updErr } = await supabase
      .from("templates")
      .update({ is_credit_eligible: isEligible })
      .eq("id", id);

    if (updErr) throw updErr;
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, is_credit_eligible: isEligible } : t));
  };

  return {
    templates,
    loading,
    error,
    createSingleTemplate,
    bulkImportTemplates,
    deleteTemplate,
    toggleCreditEligibility,
    refetch: fetchTemplates
  };
}
