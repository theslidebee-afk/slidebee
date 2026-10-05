import { useState, useEffect, useCallback } from "react";
import { d1 } from "../../../lib/d1";
import { normalizeR2Url } from "../../../lib/r2";
import type { StoreTemplate } from "../../../modules/StudioStoreClient";

export interface ClientInfo {
  email: string;
  name: string;
  tier?: string;
}

export function getClientInfo(): ClientInfo | null {
  const local = localStorage.getItem("slidebee_client_user");
  if (local) {
    try {
      const u = JSON.parse(local);
      return {
        email: u.email,
        name: u.user_metadata?.full_name || u.name || u.full_name || u.email.split("@")[0],
        tier: u.tier,
      };
    } catch (e) {}
  }
  return null;
}

export function useTemplateData(id?: string) {
  const [template, setTemplate] = useState<StoreTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarTemplates, setSimilarTemplates] = useState<StoreTemplate[]>([]);
  const [showStars, setShowStars] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [clientSub, setClientSub] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [clientPurchases, setClientPurchases] = useState<any[]>([]);
  const [freeDownloadsToday, setFreeDownloadsToday] = useState(0);

  const client = getClientInfo();

  const refreshClientData = useCallback(() => {
    if (client?.email) {
      d1.from("subscriptions")
        .select("*")
        .eq("user_email", client.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setClientSub(data);
        });

      d1.from("profiles")
        .select("purchased_items, downloads_today, last_download_date, tier, downloads_this_month")
        .eq("email", client.email)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setUserProfile(data);
            if (Array.isArray(data.purchased_items)) {
              setClientPurchases(data.purchased_items);
            }
            const today = new Date().toISOString().split("T")[0];
            const usedToday = data.last_download_date === today ? Number(data.downloads_today) || 0 : 0;
            setFreeDownloadsToday(usedToday);
          }
        });
    }
  }, [client?.email]);

  useEffect(() => {
    refreshClientData();
  }, [refreshClientData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);

    d1.from("site_config")
      .select("value")
      .eq("key", "show_template_metrics")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setShowStars(Boolean(data.value.show_stars));
          setShowDownloads(Boolean(data.value.show_downloads));
        }
      });

    const loadTemplate = async () => {
      try {
        let matched: any = null;

        const { data, error } = await d1
          .from("templates")
          .select("*")
          .or(`id.eq.${id},code.eq.${id},slug.eq.${id}`)
          .maybeSingle();

        if (data && !error) {
          matched = data;
        } else {
          const { data: vData } = await d1
            .from("v_storefront_catalog")
            .select("*")
            .or(`id.eq.${id},code.eq.${id},slug.eq.${id}`)
            .maybeSingle();
          if (vData) matched = vData;
        }

        if (matched) {
          const coverImg = normalizeR2Url(matched.thumbnail_url || matched.image_url, "slides");
          const slideUrls =
            Array.isArray(matched.slides) && matched.slides.length > 0
              ? matched.slides.map((s: string) => normalizeR2Url(s, "slides"))
              : [coverImg];
          const pptxUrl = matched.download_url
            ? normalizeR2Url(matched.download_url, "decks")
            : matched.file_name && matched.file_name.endsWith(".pptx")
            ? normalizeR2Url(matched.file_name, "decks")
            : undefined;

          const isPrem = matched.is_premium !== undefined
            ? Number(matched.is_premium) === 1
            : (matched.price_inr !== undefined && Number(matched.price_inr) > 0);

          const priceInr = isPrem ? (matched.price_inr !== undefined && matched.price_inr !== null ? Number(matched.price_inr) : 499) : 0;
          const priceUsd = isPrem ? (matched.price_usd !== undefined && matched.price_usd !== null ? Number(matched.price_usd) : 9) : 0;
          const originalPriceInr = isPrem ? (Number(matched.original_price_inr) || (priceInr * 2)) : 0;

          setTemplate({
            id: matched.id,
            code: matched.code || `SLD-${matched.id.slice(0, 4).toUpperCase()}`,
            title: matched.title,
            category: matched.category || "Business",
            price_inr: priceInr,
            price_usd: priceUsd,
            original_price_inr: originalPriceInr,
            image_url: coverImg,
            slides: slideUrls,
            slides_count: Number(matched.slides_count || matched.slide_count) || slideUrls.length || 30,
            rating: matched.rating ? Number(matched.rating) : undefined,
            downloads: matched.downloads ? Number(matched.downloads) : undefined,
            download_url: pptxUrl,
            file_name:
              matched.file_name ||
              (pptxUrl ? pptxUrl.split("/").pop() || "Master_Deck.pptx" : "Master_Deck.pptx"),
            file_size: matched.file_size || "4.5 MB",
            description:
              matched.description || "Executive presentation deck tailored for high-stakes business meetings.",
            features:
              Array.isArray(matched.features) && matched.features.length > 0
                ? matched.features
                : [
                    `${matched.slides_count || 30}+ High-Impact Master Slides`,
                    "16:9 Ultra-Wide Presentation Format",
                    "100% Fully Editable Vector Elements",
                    "Commercial Royalty-Free License",
                  ],
            formats:
              Array.isArray(matched.formats) && matched.formats.length > 0
                ? matched.formats
                : ["PowerPoint"],
            is_premium: isPrem,
            is_credit_eligible: isPrem && Boolean(matched.is_credit_eligible),
            is_featured: Boolean(matched.is_featured),
            is_published: matched.is_published !== 0,
            created_at: matched.created_at,
          });
        }
      } catch (err) {
        console.error("Error loading template details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

  useEffect(() => {
    if (!template?.id) return;
    d1.from("v_storefront_catalog")
      .select("*")
      .neq("id", template.id)
      .limit(4)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped: StoreTemplate[] = data.map((t: any) => {
            const coverImg = normalizeR2Url(t.thumbnail_url || t.image_url, "slides");
            const slideUrls =
              Array.isArray(t.slides) && t.slides.length > 0
                ? t.slides.map((s: string) => normalizeR2Url(s, "slides"))
                : [coverImg];
            const pptxUrl = t.download_url ? normalizeR2Url(t.download_url, "decks") : undefined;

            return {
              id: t.id,
              code: t.code || `SLD-${t.id.slice(0, 4).toUpperCase()}`,
              title: t.title,
              category: t.category || "Business",
              price_inr: Number(t.price_inr) || 499,
              price_usd: Number(t.price_usd) || 9,
              original_price_inr: Number(t.original_price_inr) || 999,
              image_url: coverImg,
              slides: slideUrls,
              slides_count: Number(t.slides_count || t.slide_count) || slideUrls.length || 30,
              rating: Number(t.rating) || 4.9,
              downloads: Number(t.downloads) || 120,
              download_url: pptxUrl,
              file_name:
                t.file_name || (pptxUrl ? pptxUrl.split("/").pop() || "Master_Deck.pptx" : "Master_Deck.pptx"),
              file_size: t.file_size || "4.5 MB",
              description: t.description || "Executive presentation deck layout.",
              features: Array.isArray(t.features) ? t.features : ["30+ High-Impact Slides"],
              formats: Array.isArray(t.formats) && t.formats.length > 0 ? t.formats : ["PowerPoint"],
              is_premium:
                t.is_premium !== undefined ? Number(t.is_premium) === 1 : Number(t.price_inr) > 0,
              is_credit_eligible: Boolean(t.is_credit_eligible),
              is_featured: Boolean(t.is_featured),
              is_published: true,
            };
          });
          setSimilarTemplates(mapped);
        }
      });
  }, [template?.id]);

  return {
    template,
    loading,
    similarTemplates,
    showStars,
    showDownloads,
    client,
    clientSub,
    setClientSub,
    userProfile,
    setUserProfile,
    clientPurchases,
    setClientPurchases,
    freeDownloadsToday,
    setFreeDownloadsToday,
    refreshClientData,
  };
}
