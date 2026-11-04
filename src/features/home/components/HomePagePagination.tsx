import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HomePagePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const HomePagePagination: React.FC<HomePagePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handlePageSelect = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    const target = document.getElementById("templates");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Build page numbers array with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav 
      aria-label="Template catalog pagination"
      className="flex flex-wrap items-center justify-center gap-2 pt-10 sm:pt-14 pb-4"
    >
      {/* Previous Button */}
      <button
        onClick={() => handlePageSelect(currentPage - 1)}
        disabled={currentPage === 1}
        className={`hex-pill px-4 py-2.5 text-xs font-heading font-black flex items-center gap-1.5 transition-all ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
            : "bg-white hover:bg-[#FCBF14] text-[#111111] border-2 border-[#111111]/15 hover:border-[#111111] cursor-pointer shadow-sm hover:scale-102"
        }`}
      >
        <ChevronLeft size={16} />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5 mx-1">
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[#726F6D] select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => handlePageSelect(pageNum)}
              aria-current={isActive ? "page" : undefined}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-heading font-black transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? "bg-[#111111] text-[#FCBF14] border-2 border-[#FCBF14] shadow-md scale-105"
                  : "bg-white hover:bg-[#FFF9E8] text-[#111111] border border-[#111111]/15 hover:border-[#FCBF14] shadow-xs"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageSelect(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`hex-pill px-4 py-2.5 text-xs font-heading font-black flex items-center gap-1.5 transition-all ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
            : "bg-white hover:bg-[#FCBF14] text-[#111111] border-2 border-[#111111]/15 hover:border-[#111111] cursor-pointer shadow-sm hover:scale-102"
        }`}
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};
