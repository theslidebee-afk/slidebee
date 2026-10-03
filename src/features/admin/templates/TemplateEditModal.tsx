import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Edit3, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Save 
} from "lucide-react";
import {
  FormatSelectorField,
  PptxUploaderField,
  TemplatePreviewsField,
  TemplateFormInputs
} from "./fields";
import { useTemplateEdit } from "./hooks/useTemplateEdit";

interface TemplateEditModalProps {
  isOpen: boolean;
  template: any | null;
  categoriesList: string[];
  session: any;
  onClose: () => void;
  onSaveSuccess: (updatedTemplate: any) => void;
  onDelete: (id: string | number, title: string) => Promise<void>;
}

export const TemplateEditModal: React.FC<TemplateEditModalProps> = ({
  isOpen,
  template,
  categoriesList,
  session,
  onClose,
  onSaveSuccess,
  onDelete
}) => {
  if (!isOpen || !template) return null;

  const {
    editingTemplate,
    setEditingTemplate,
    isSavingEditTemplate,
    editTemplateSuccess,
    isUploadingEditPpt,
    isUploadingCover,
    isUploadingSlide,
    editTemplateWarning,
    handleEditCoverImageUpload,
    handleSlideImagesUpload,
    handleEditPptFileUpload,
    handleSaveEditTemplate
  } = useTemplateEdit(template, session, onSaveSuccess, onClose);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border-2 border-[#111111]/15 rounded-2xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#111111]/10">
            <div>
              <h3 className="text-xl font-heading font-extrabold text-[#111111] flex items-center gap-2">
                <Edit3 size={18} className="text-primary-amber" /> Edit Presentation Template
              </h3>
              <p className="text-xs text-[#726F6D]">
                Modify template title, pricing, previews, attached deliverable, and categories.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/20 text-[#111111] font-black text-[10px] px-3 py-1">
                SKU: {editingTemplate.code}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-[#111111] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {editTemplateSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
              <CheckCircle2 size={16} /> Template updated successfully in database!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PptxUploaderField
              downloadUrl={editingTemplate.download_url}
              pptFilename={editingTemplate.file_name}
              isUploadingPpt={isUploadingEditPpt}
              onPptFileUpload={handleEditPptFileUpload}
              onRemovePpt={() => setEditingTemplate({ ...editingTemplate, download_url: "", file_name: "" })}
            />

            <FormatSelectorField
              formats={Array.isArray(editingTemplate.formats) ? editingTemplate.formats : []}
              setFormats={(formats) => setEditingTemplate({ ...editingTemplate, formats })}
            />
          </div>

          <TemplatePreviewsField
            thumbnail={editingTemplate.thumbnail_url}
            setThumbnail={(url) => setEditingTemplate({ ...editingTemplate, thumbnail_url: url, image_url: url })}
            isUploadingCover={isUploadingCover}
            onCoverImageUpload={handleEditCoverImageUpload}
            slides={editingTemplate.slides || []}
            isUploadingSlide={isUploadingSlide}
            onSlideImageUpload={handleSlideImagesUpload}
            onMakeCover={(idx) => {
              const next = [...editingTemplate.slides];
              const [moved] = next.splice(idx, 1);
              next.unshift(moved);
              setEditingTemplate({
                ...editingTemplate,
                slides: next,
                thumbnail_url: moved,
                image_url: moved
              });
            }}
            onRemoveSlide={(idx) => {
              const next = editingTemplate.slides.filter((_: any, i: number) => i !== idx);
              setEditingTemplate({
                ...editingTemplate,
                slides: next,
                slide_count: next.length || 1,
                thumbnail_url: idx === 0 && next.length > 0 ? next[0] : editingTemplate.thumbnail_url
              });
            }}
          />

          <form onSubmit={handleSaveEditTemplate} className="space-y-3.5">
            <TemplateFormInputs
              title={editingTemplate.title}
              setTitle={(title) => setEditingTemplate({ ...editingTemplate, title })}
              code={editingTemplate.code}
              setCode={(code) => setEditingTemplate({ ...editingTemplate, code })}
              category={editingTemplate.category}
              setCategory={(category) => setEditingTemplate({ ...editingTemplate, category })}
              categoriesList={categoriesList}
              slideCount={editingTemplate.slide_count}
              setSlideCount={(slide_count) => setEditingTemplate({ ...editingTemplate, slide_count })}
              priceINR={editingTemplate.price_inr}
              setPriceINR={(price_inr) => setEditingTemplate({ ...editingTemplate, price_inr })}
              priceUSD={editingTemplate.price_usd}
              setPriceUSD={(price_usd) => setEditingTemplate({ ...editingTemplate, price_usd })}
              description={editingTemplate.description}
              setDescription={(description) => setEditingTemplate({ ...editingTemplate, description })}
              features={Array.isArray(editingTemplate.features) ? editingTemplate.features : []}
              setFeatures={(features) => setEditingTemplate({ ...editingTemplate, features })}
              isCreditEligible={editingTemplate.is_credit_eligible}
              setIsCreditEligible={(is_credit_eligible) => setEditingTemplate({ ...editingTemplate, is_credit_eligible })}
            />

            <div className="bg-[#FFF9E8] border border-primary/40 p-3 rounded-xl flex items-center justify-between shadow-xs text-left">
              <div>
                <span className="text-xs font-black text-[#111111] block">Storefront Marketplace Visibility</span>
                <span className="text-[10px] text-[#726F6D] font-medium">Show or hide this presentation deck on the public client catalog</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingTemplate({ ...editingTemplate, is_published: editingTemplate.is_published === false ? true : false })}
                className={`rounded-lg text-[10px] font-black px-3 py-1.5 transition-all flex items-center gap-1 cursor-pointer ${
                  editingTemplate.is_published !== false
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                {editingTemplate.is_published !== false ? (
                  <>
                    <Eye size={12} className="text-emerald-700" />
                    <span>Enabled on Storefront</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={12} className="text-gray-500" />
                    <span>Hidden (Draft)</span>
                  </>
                )}
              </button>
            </div>

            {editTemplateWarning && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                <span>{editTemplateWarning}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#111111]/10">
              <button
                type="button"
                onClick={() => onDelete(editingTemplate.id, editingTemplate.title)}
                className="rounded-lg px-4 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} /> Delete Template
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-xs font-extrabold text-[#726F6D] hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEditTemplate || isUploadingEditPpt}
                  className="rounded-lg bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  {isSavingEditTemplate ? "Saving Changes..." : "Save Template Changes"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TemplateEditModal;
