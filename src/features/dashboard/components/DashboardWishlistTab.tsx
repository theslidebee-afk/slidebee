import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Eye } from "lucide-react";
import { useWishlist } from "../../wishlist";
import { useStudioStore } from "../../../modules/StudioStoreClient";
import { useCurrency } from "../../../context/CurrencyContext";

interface DashboardWishlistTabProps {
  isProUser?: boolean;
}

export function DashboardWishlistTab({ isProUser: _isProUser = false }: DashboardWishlistTabProps) {
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { templates, loading } = useStudioStore();
  const { formatPrice } = useCurrency();

  const wishlistedTemplates = templates.filter((t) =>
    wishlistIds.includes(String(t.id)) || (t.code && wishlistIds.includes(String(t.code)))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-heading font-black text-[#111111]">
              My Saved Wishlist
            </h2>
            {wishlistedTemplates.length > 0 && (
              <span className="text-xs font-mono font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                {wishlistedTemplates.length} Saved
              </span>
            )}
          </div>
          <p className="text-xs text-[#726F6D]">
            Executive presentation decks saved to your personal showcase
          </p>
        </div>
        <Link
          to="/#templates"
          className="hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black px-4 py-2 flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          Browse Store Catalog <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-[#726F6D] uppercase tracking-wider">
            Loading Wishlist...
          </p>
        </div>
      ) : wishlistedTemplates.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-3xl bg-white/50">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3 text-red-400">
            <Heart size={28} />
          </div>
          <p className="text-sm font-bold text-[#111111]">Your wishlist is currently empty</p>
          <p className="text-xs text-[#726F6D] mt-1 max-w-sm mx-auto">
            Explore our curated catalog of master presentation decks and click the heart icon on any template to add it to your showcase.
          </p>
          <Link
            to="/#templates"
            className="hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black px-5 py-2.5 inline-flex items-center gap-2 shadow-xs mt-4"
          >
            Explore Catalog <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlistedTemplates.map((template) => {
            const isFree = !template.is_premium;
            const coverImg = template.image_url || "/portfolio/case_study_a_1.png";

            return (
              <div
                key={template.id}
                onClick={() => navigate(`/template/${template.id}`)}
                className="group relative bg-white border border-[#111111]/10 hover:border-[#FCBF14] rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Remove from Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(template.id);
                  }}
                  title="Remove from wishlist"
                  aria-label="Remove from wishlist"
                  className="absolute top-4 right-4 z-20 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <Heart size={13} className="fill-white" />
                </button>

                {/* Free Swallowtail Ribbon Tag */}
                {isFree && (
                  <div
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 84% 50%, 100% 100%, 0 100%)",
                    }}
                    className="absolute top-4 left-0 bg-[#FCBF14] text-[#111111] text-[9px] font-black uppercase pl-2.5 pr-4 py-0.5 shadow-sm z-20 tracking-wider select-none font-heading"
                  >
                    Free
                  </div>
                )}

                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#F3F4F6] border border-[#111111]/6">
                    <img
                      src={coverImg}
                      alt={template.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-[#111111]/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Eye size={11} className="text-[#FCBF14]" /> View Deck
                      </span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="mt-2.5 mb-2">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      {template.category} • {template.slides_count} Slides
                    </span>
                    <h3 className="font-heading font-black text-xs text-[#111111] group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug mt-0.5">
                      {template.title}
                    </h3>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-2 border-t border-[#111111]/8 flex items-center justify-between gap-2 mt-auto">
                  <div>
                    {isFree ? (
                      <span className="text-xs font-heading font-black text-emerald-700">
                        100% Free
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-heading font-black text-[#111111]">
                          {formatPrice(template.price_inr, template.price_usd)}
                        </span>
                        {Number(template.original_price_inr) > Number(template.price_inr) && (
                          <span className="text-[10px] text-[#726F6D] line-through font-medium">
                            {formatPrice(template.original_price_inr, template.original_price_usd)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="hex-pill-sm bg-[#FFF9E8] group-hover:bg-[#FCBF14] border border-[#FCBF14]/40 text-[#111111] font-black text-[10px] px-2.5 py-1 transition-colors flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
