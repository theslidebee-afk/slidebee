import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { useStudioStore, type StoreTemplate } from "../modules/StudioStoreClient";
import { usePageSEO } from "../hooks/usePageSEO";
import { d1 } from "../lib/d1";
import { TemplatesFilterBar } from "../features/templates/marketplace/TemplatesFilterBar";
import { TemplateCard } from "../features/templates/marketplace/TemplateCard";

export type { StoreTemplate as TemplateItem };

export default function Templates() {
  usePageSEO({
    title: "Premium PowerPoint Templates & Slide Decks | SlideBee",
    description: "Browse 100% editable corporate PowerPoint templates, pitch decks, keynote presentations, and master systems. Free templates with 3 daily downloads, and premium templates for Monthly, Yearly, and Lifetime members.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialTier = (searchParams.get("tier") as "all" | "free" | "premium") || (searchParams.get("freeCredits") === "true" ? "free" : "all");

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "premium">(initialTier);
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [userTier, setUserTier] = useState<string>("free");

  useEffect(() => {
    const checkProStatus = async () => {
      let email = "";
      const local = localStorage.getItem("slidebee_client_user");
      if (local) {
        try {
          const u = JSON.parse(local);
          if (u?.email) email = u.email;
          if (u?.tier) {
            setUserTier(u.tier);
            if (["monthly", "yearly", "lifetime"].includes(u.tier)) {
              setIsProUser(true);
              return;
            }
          }
        } catch (e) {}
      }
      if (!email) {
        const { data } = await d1.auth.getUser();
        if (data?.user?.email) email = data.user.email;
      }
      if (email) {
        const { data: profile } = await d1
          .from("profiles")
          .select("tier")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();

        if (profile?.tier) {
          setUserTier(profile.tier);
          if (["monthly", "yearly", "lifetime"].includes(profile.tier)) {
            setIsProUser(true);
            return;
          }
        }

        const { data: sub } = await d1
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_email", email.toLowerCase().trim())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (
          sub &&
          sub.status === "active" &&
          (!sub.current_period_end || new Date(sub.current_period_end) > new Date())
        ) {
          setIsProUser(true);
        }
      }
    };
    checkProStatus();
  }, []);

  const { templates: allTemplates, loading, showStars, showDownloads } = useStudioStore();

  const categories = ["All", ...Array.from(new Set(allTemplates.map(t => t.category)))];

  const filteredTemplates = allTemplates.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "all" || (tierFilter === "free" && !item.is_premium) || (tierFilter === "premium" && item.is_premium);
    return matchesCategory && matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">

        <TemplatesFilterBar
          allTemplates={allTemplates}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          tierFilter={tierFilter}
          setTierFilter={setTierFilter}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          userTier={userTier}
        />

        {/* Templates Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-extrabold text-[#726F6D] uppercase tracking-wider">
              Loading Executive Catalog...
            </p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="hex-card bg-white border border-[#111111]/8 p-12 text-center max-w-lg mx-auto shadow-sm">
            <FileText size={40} className="mx-auto text-primary-amber mb-3" />
            <h3 className="text-xl font-heading font-extrabold text-[#111111] mb-2">
              No Templates Matching Your Query
            </h3>
            <p className="text-xs text-[#726F6D] mb-6 font-medium">
              We couldn't find any templates matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setTierFilter("all");
                setSearchParams({});
              }}
              className="hex-pill bg-primary text-[#111111] font-extrabold px-6 py-2.5 text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((item) => (
              <TemplateCard
                key={item.id}
                item={item}
                isProUser={isProUser}
                showStars={showStars}
                showDownloads={showDownloads}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
