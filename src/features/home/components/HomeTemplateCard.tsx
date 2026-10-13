import { useNavigate } from "react-router-dom";
import { Eye, Heart } from "lucide-react";
import { useCurrency } from "../../../context/CurrencyContext";
import { useWishlist, WishlistAuthModal } from "../../wishlist";

interface HomeTemplateCardProps {
  template: any;
}

export function HomeTemplateCard({ template }: HomeTemplateCardProps) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { isWishlisted, toggleWishlist, showAuthModal, setShowAuthModal } = useWishlist();
  const wishlisted = isWishlisted(template.id);
  const coverImg = template.image_url || template.thumbnail_url || "/portfolio/case_study_a_1.png";

  return (
    <>
      <div
        onClick={() => navigate(`/template/${template.id}`)}
        data-bee-state="card"
        className="group relative bg-white hover:bg-white border border-[#111111]/10 hover:border-[#FCBF14] rounded-2xl p-2.5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full cursor-pointer overflow-hidden"
      >
        {/* Wishlist Heart Button - Top Right Corner */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(template.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
            wishlisted
              ? "bg-red-500 text-white scale-105"
              : "bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 hover:scale-105"
          }`}
        >
          <Heart size={13} className={wishlisted ? "fill-white" : ""} />
        </button>

        {/* Free Swallowtail Ribbon Tag - Top Left Corner */}
        {!template.is_premium && (
          <div
            style={{
              clipPath: "polygon(0 0, 100% 0, 84% 50%, 100% 100%, 0 100%)",
            }}
            className="absolute top-2.5 left-0 bg-[#FCBF14] text-[#111111] text-[9px] sm:text-[10px] font-black uppercase pl-2.5 pr-4 py-0.5 sm:py-1 shadow-sm z-20 tracking-wider select-none font-heading"
          >
            Free
          </div>
        )}

        {/* Top: Single High-Res Cover Slide Preview */}
        <div>
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-white border border-[#111111]/6 shadow-2xs">
            <img
              src={coverImg}
              alt={template.title}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />

            {/* Subtle Hover Lens Overlay */}
            <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="bg-[#111111]/90 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 scale-95 group-hover:scale-100 transition-transform">
                <Eye size={12} className="text-[#FCBF14]" /> View Deck
              </span>
            </div>
          </div>

          {/* Title Inside Card */}
          <h3 className="font-heading font-black text-xs sm:text-[13px] text-[#111111] group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug mt-2.5 mb-1.5">
            {template.title}
          </h3>
        </div>

        {/* Bottom: Clean Price Only */}
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          {!template.is_premium ? (
            <span className="text-xs sm:text-sm font-heading font-black text-[#111111]">
              Free
            </span>
          ) : (
            <>
              <span className="text-xs sm:text-sm font-heading font-black text-[#111111]">
                {formatPrice(template.price_inr, template.price_usd)}
              </span>
              {Number(template.original_price_inr) > Number(template.price_inr) && (
                <span className="text-[11px] text-[#726F6D] line-through font-medium">
                  {formatPrice(template.original_price_inr, template.original_price_usd)}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <WishlistAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
