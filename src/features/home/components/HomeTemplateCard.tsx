import { useNavigate } from "react-router-dom";
import { Eye, Heart } from "lucide-react";
import { useWishlist, WishlistAuthModal } from "../../wishlist";

interface HomeTemplateCardProps {
  template: any;
}

// Helper to extract inner preview slide thumbnails for SlideEgg-style showcase cards
// Only returns real uploaded slides — never pads with portfolio placeholders
function getPreviewSlides(template: any, count = 6): string[] {
  const rawSlides = Array.isArray(template?.slides) ? template.slides.filter(Boolean) : [];
  if (rawSlides.length > 0) {
    return rawSlides.slice(0, count);
  }
  const cover = template?.image_url || template?.thumbnail_url;
  if (cover) return [cover];
  return [];
}

// Determine dynamic mini-slide counts (0, 3, 6, 9) for magnet masonry variation
function getMiniSlideCount(template: any): number {
  const category = (template?.category || "").toLowerCase();
  const title = (template?.title || "").toLowerCase();
  if (
    category.includes("infographic") ||
    title.includes("infographic") ||
    category.includes("diagram") ||
    title.includes("diagram")
  ) {
    const idSeed = String(template?.id || "").charCodeAt(0) || 0;
    return idSeed % 2 === 0 ? 0 : 3;
  }
  const idSeed = String(template?.id || template?.title || "deck")
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mod = idSeed % 3;
  if (mod === 0) return 9;
  if (mod === 1) return 6;
  return 6;
}

export function HomeTemplateCard({ template }: HomeTemplateCardProps) {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist, showAuthModal, setShowAuthModal } = useWishlist();
  const wishlisted = isWishlisted(template.id);
  const miniCount = getMiniSlideCount(template);
  const previewSlides = miniCount > 0 ? getPreviewSlides(template, miniCount) : [];

  return (
    <>
      <div
        onClick={() => navigate(`/template/${template.id}`)}
        data-bee-state="card"
        className="group flex flex-col cursor-pointer transition-all duration-300"
      >
        {/* Main Card Canvas with Subtle Border & Soft Shadow */}
        <div className="relative bg-[#FAFAFA] group-hover:bg-white border border-[#111111]/10 group-hover:border-[#FCBF14] rounded-2xl p-2 sm:p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-xl transition-all duration-300 overflow-hidden">
          
          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(template.id);
            }}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
              wishlisted
                ? "bg-red-500 text-white scale-105"
                : "bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 hover:scale-105"
            }`}
          >
            <Heart size={13} className={wishlisted ? "fill-white" : ""} />
          </button>

          {/* Swallowtail Ribbon Tag: Free badge for free community decks */}
          {!template.is_premium && (
            <div
              style={{
                clipPath: "polygon(0 0, 100% 0, 84% 50%, 100% 100%, 0 100%)",
              }}
              className="absolute top-2 left-0 bg-[#FCBF14] text-[#111111] text-[9px] sm:text-[10px] font-black uppercase pl-2.5 pr-4 py-0.5 sm:py-1 shadow-sm z-20 tracking-wider select-none font-heading"
            >
              Free
            </div>
          )}

          {/* Main Top Slide Cover Preview */}
          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-white border border-[#111111]/6 shadow-xs">
            <img
              src={template.image_url || template.thumbnail_url || previewSlides[0] || "/portfolio/case_study_a_1.png"}
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

        {/* Multi-Slide Grid Mini Previews (Matching SlideEgg 3-column subgrid) */}
        {miniCount > 0 && previewSlides.length > 0 && (
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mt-1.5">
            {previewSlides.map((slideUrl: string, idx: number) => (
              <div
                key={idx}
                className="relative aspect-video rounded-[5px] overflow-hidden bg-white border border-[#111111]/6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <img
                  src={slideUrl}
                  alt={`${template.title} slide ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Minimalist Title Below Card */}
      <div className="mt-2 px-1">
        <h3 className="font-heading font-extrabold text-xs sm:text-[13px] text-[#111111] group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
          {template.title}
        </h3>
      </div>

      </div>

      <WishlistAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
