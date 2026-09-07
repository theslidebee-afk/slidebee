import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface MetricsConfig {
  show_stars: boolean;
  show_downloads: boolean;
}

/**
 * Deep Module: useStorefrontMetrics
 * 
 * Public Interface:
 * - metrics: Current config { show_stars, show_downloads }
 * - loading: Loading state boolean
 * - saving: Saving state boolean
 * - updateMetrics(partial): Saves toggle changes to Supabase site_config
 */
export function useStorefrontMetrics() {
  const [metrics, setMetrics] = useState<MetricsConfig>({
    show_stars: false,
    show_downloads: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "show_template_metrics")
        .maybeSingle();

      if (data?.value) {
        setMetrics({
          show_stars: Boolean(data.value.show_stars),
          show_downloads: Boolean(data.value.show_downloads)
        });
      }
    } catch (e) {
      console.warn("Metrics config load notice:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const updateMetrics = async (newMetrics: Partial<MetricsConfig>) => {
    setSaving(true);
    const updated: MetricsConfig = { ...metrics, ...newMetrics };
    try {
      const { error } = await supabase
        .from("site_config")
        .upsert(
          [
            {
              key: "show_template_metrics",
              value: updated,
              updated_at: new Date().toISOString()
            }
          ],
          { onConflict: "key" }
        );

      if (error) throw error;
      setMetrics(updated);
    } catch (err: any) {
      console.error("Failed to update template metrics config:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    metrics,
    loading,
    saving,
    updateMetrics,
    refetch: fetchMetrics
  };
}
