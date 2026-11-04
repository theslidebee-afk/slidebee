import React, { useState } from "react";
import { X, Sliders, Plus } from "lucide-react";
import { d1 } from "../../../lib/d1";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoriesList: string[];
  setCategoriesList: React.Dispatch<React.SetStateAction<string[]>>;
  templates: any[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoriesList,
  setCategoriesList,
  templates
}) => {
  const [newCategoryInput, setNewCategoryInput] = useState("");

  if (!isOpen) return null;

  const handleAddNewCategory = async () => {
    const clean = newCategoryInput.trim();
    if (!clean) return;
    if (categoriesList.some(c => c.toLowerCase() === clean.toLowerCase())) {
      alert(`Category "${clean}" already exists.`);
      return;
    }
    const updated = [...categoriesList, clean];
    setCategoriesList(updated);
    setNewCategoryInput("");
    try {
      await d1.from("site_config").upsert({
        key: "template_categories",
        value: updated,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
    } catch (err: any) {
      console.error("Failed to add category:", err);
      alert(`Failed to add category: ${err?.message || err}`);
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (!confirm(`Are you sure you want to remove category "${catToDelete}"?`)) return;
    const updated = categoriesList.filter(c => c.toLowerCase() !== catToDelete.toLowerCase());
    setCategoriesList(updated);
    try {
      await d1.from("site_config").upsert({
        key: "template_categories",
        value: updated,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      alert(`Failed to delete category: ${err?.message || err}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-primary/40 space-y-5 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary-amber">
              <Sliders size={16} />
            </div>
            <div>
              <h4 className="font-heading font-black text-base text-[#111111]">
                Manage Store Categories
              </h4>
              <p className="text-xs text-[#726F6D]">
                Add or remove presentation categories across the catalog
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#111111] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add New Category Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111] block">Add New Category</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Executive Strategy, Product Hunt..."
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddNewCategory();
                }
              }}
              className="flex-1 bg-[#FFF9E8] border border-[#111111]/15 rounded-xl px-3.5 py-2 text-xs text-[#111111] font-bold focus:border-primary outline-none"
            />
            <button
              type="button"
              onClick={handleAddNewCategory}
              className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>

        {/* Active Categories List */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#726F6D] block">
            Active Categories ({categoriesList.length})
          </label>
          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
            {categoriesList.map((cat) => {
              const deckCount = templates.filter(t => t.category?.toLowerCase() === cat.toLowerCase()).length;
              return (
                <div
                  key={cat}
                  className="bg-[#FFF9E8] border border-primary/30 rounded-xl px-3 py-1.5 text-xs font-bold text-[#111111] flex items-center gap-2 shadow-2xs"
                >
                  <span>{cat}</span>
                  <span className="text-[10px] font-mono text-[#726F6D] bg-white px-1.5 py-0.5 rounded-full border border-[#111111]/10">
                    {deckCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-gray-400 hover:text-red-600 transition-colors ml-1 cursor-pointer"
                    title={`Remove "${cat}" category`}
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="hex-pill bg-[#111111] hover:bg-black text-[#FCBF14] text-xs font-black px-6 py-2.5 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
export default CategoryModal;
