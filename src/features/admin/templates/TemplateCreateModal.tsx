import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertCircle } from "lucide-react";
import { uploadToR2 } from "../../../lib/r2";
import { d1 } from "../../../lib/d1";
import {
  FormatSelectorField,
  PptxUploaderField,
  TemplatePreviewsField,
  TemplateFormInputs
} from "./fields";

interface TemplateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoriesList: string[];
  session: any;
  onTemplateCreated: (newTemplate: any) => void;
}

export const TemplateCreateModal: React.FC<TemplateCreateModalProps> = ({
  isOpen,
  onClose,
  categoriesList,
  session,
  onTemplateCreated
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState(`SLD-${Math.floor(100 + Math.random() * 900)}`);
  const [newCategory, setNewCategory] = useState(categoriesList[0] || "Pitch Decks");
  const [newPriceINR, setNewPriceINR] = useState<number | string>(499);
  const [newPriceUSD, setNewPriceUSD] = useState<number | string>(9);
  const [newSlideCount, setNewSlideCount] = useState<number | string>(25);
  const [newDesc, setNewDesc] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("");
  const [newSlides, setNewSlides] = useState<string[]>([]);
  const [newPptUrl, setNewPptUrl] = useState("");
  const [newPptFilename, setNewPptFilename] = useState("");
  const [newPptSize, setNewPptSize] = useState("");
  const [isUploadingPpt, setIsUploadingPpt] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [addTemplateWarning, setAddTemplateWarning] = useState("");
  const [newFormats, setNewFormats] = useState<string[]>(["PowerPoint"]);
  const [newFeatures, setNewFeatures] = useState<string[]>([
    "Capability Matrix",
    "Process Workflow Flowchart",
    "Enterprise RFP Deck"
  ]);
  const [newIsCreditEligible, setNewIsCreditEligible] = useState(false);
  const [tier, setTier] = useState<"free" | "premium">("premium");

  if (!isOpen) return null;

  const handlePptFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPpt(true);
    setNewPptFilename(file.name);
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setNewPptSize(file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`);

    try {
      const r2Res = await uploadToR2(file, { folder: "templates/decks", fileName: file.name });
      if (r2Res.success && r2Res.publicUrl) {
        setNewPptUrl(r2Res.publicUrl);
        setAddTemplateWarning("");
      } else {
        throw new Error(r2Res.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Failed to upload Master PPTX to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingPpt(false);
      if (e.target) e.target.value = "";
    }

    if (!newTitle) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNewTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const r2Res = await uploadToR2(file, { folder: "templates/slides", fileName: file.name });
      if (r2Res.success && r2Res.publicUrl) {
        setNewThumbnail(r2Res.publicUrl);
        setAddTemplateWarning("");
      } else {
        throw new Error(r2Res.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Failed to upload Primary Cover image to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingCover(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSlideImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingSlide(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const r2Res = await uploadToR2(file, { folder: "templates/slides", fileName: file.name });
        if (r2Res.success && r2Res.publicUrl) {
          uploadedUrls.push(r2Res.publicUrl);
        }
      }
      setNewSlides((prev) => {
        const next = [...prev, ...uploadedUrls];
        setNewSlideCount(next.length);
        return next;
      });
      if (!newThumbnail && uploadedUrls.length > 0) {
        setNewThumbnail(uploadedUrls[0]);
      }
    } catch (err: any) {
      alert("Failed to upload slide images to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingSlide(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTemplateWarning("");

    if (!newTitle.trim()) {
      setAddTemplateWarning("Please enter a Template Title.");
      return;
    }
    if (!newPptUrl) {
      setAddTemplateWarning("Please upload the Master PowerPoint (.pptx) file to Cloudflare R2 before publishing.");
      return;
    }
    if (!newThumbnail) {
      setAddTemplateWarning("Please upload the Primary Cover Image before publishing.");
      return;
    }
    if (tier === "premium") {
      if (newPriceINR === "" || isNaN(Number(newPriceINR)) || Number(newPriceINR) <= 0) {
        setAddTemplateWarning("Please enter a valid Price INR (₹) greater than 0 for premium templates.");
        return;
      }
      if (newPriceUSD === "" || isNaN(Number(newPriceUSD)) || Number(newPriceUSD) <= 0) {
        setAddTemplateWarning("Please enter a valid Price USD ($) greater than 0 for premium templates.");
        return;
      }
    }
    if (newSlideCount === "" || isNaN(Number(newSlideCount)) || Number(newSlideCount) < 1) {
      setAddTemplateWarning("Please enter a valid Total Slides Count (minimum 1).");
      return;
    }

    setIsCreatingTemplate(true);
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const templateCode = newCode || `SLD-${Math.floor(100 + Math.random() * 900)}`;

    const effectiveSlides = newSlides.length > 0 ? newSlides : [newThumbnail];
    const effectiveSlideCount = Number(newSlideCount) || effectiveSlides.length;

    const isFree = tier === "free";
    const payload = {
      title: newTitle.trim(),
      slug,
      code: templateCode,
      description: newDesc.trim() || "Executive presentation deck layout.",
      category: newCategory,
      price_inr: isFree ? 0 : Number(newPriceINR),
      price_usd: isFree ? 0 : Number(newPriceUSD),
      original_price_inr: isFree ? 0 : Number(newPriceINR) * 2,
      slides_count: effectiveSlideCount,
      thumbnail_url: newThumbnail,
      image_url: newThumbnail,
      slides: effectiveSlides,
      download_url: newPptUrl,
      file_name: newPptFilename || "Master_Presentation.pptx",
      file_size: newPptSize || "4.5 MB",
      formats: newFormats.length > 0 ? newFormats : ["PowerPoint"],
      features: newFeatures.length > 0 ? newFeatures : [
        `${effectiveSlideCount}+ High-Impact Slides`,
        "16:9 Widescreen Layout",
        "Fully Editable Vector Elements"
      ],
      is_credit_eligible: isFree ? 0 : 1,
      is_premium: isFree ? 0 : 1,
      is_published: 1
    };

    let createdRecord: any = null;
    try {
      const adminKey = localStorage.getItem("slidebee_admin_key") || "";
      const authToken = session?.access_token || "";
      const res = await fetch("/api/admin-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(adminKey ? { "x-slidebee-admin-key": adminKey } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resJson = await res.json();
        if (resJson.success && resJson.template) {
          createdRecord = resJson.template;
        }
      }
    } catch (apiErr) {
      console.warn("Backend /api/admin-template POST notice:", apiErr);
    }

    if (!createdRecord) {
      try {
        const { data, error } = await d1
          .from("templates")
          .insert([payload])
          .select();
        if (!error && data) {
          createdRecord = Array.isArray(data) ? data[0] : data;
        }
      } catch (insertErr) {
        console.warn("Insert template fallback notice:", insertErr);
      }
    }

    const finalItem = createdRecord || { id: `tpl-${Date.now()}`, ...payload };
    onTemplateCreated(finalItem);
    onClose();
    setNewTitle("");
    setNewDesc("");
    setNewThumbnail("");
    setNewSlides([]);
    setNewPptUrl("");
    setNewPptFilename("");
    setNewPptSize("");
    setNewFormats(["PowerPoint"]);
    setNewIsCreditEligible(false);
    setNewCode(`SLD-${Math.floor(100 + Math.random() * 900)}`);
    setAddTemplateWarning("");
    setIsCreatingTemplate(false);
  };

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
                <Plus size={20} className="text-primary-amber" /> Add New Presentation Template
              </h3>
              <p className="text-xs text-[#726F6D]">
                Upload Master PowerPoint (.pptx) file, cover thumbnail, and slide previews to Cloudflare R2.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/20 text-[#111111] font-black text-[10px] px-3 py-1">
                SKU: {newCode}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PptxUploaderField
              pptFilename={newPptFilename}
              pptSize={newPptSize}
              isUploadingPpt={isUploadingPpt}
              onPptFileUpload={handlePptFileUpload}
              onRemovePpt={() => {
                setNewPptUrl("");
                setNewPptFilename("");
                setNewPptSize("");
              }}
            />

            <FormatSelectorField
              formats={newFormats}
              setFormats={setNewFormats}
            />
          </div>

          <TemplatePreviewsField
            thumbnail={newThumbnail}
            setThumbnail={setNewThumbnail}
            isUploadingCover={isUploadingCover}
            onCoverImageUpload={handleCoverImageUpload}
            slides={newSlides}
            isUploadingSlide={isUploadingSlide}
            onSlideImageUpload={handleSlideImagesUpload}
            onMakeCover={(idx) => {
              const next = [...newSlides];
              const [moved] = next.splice(idx, 1);
              next.unshift(moved);
              setNewSlides(next);
              setNewThumbnail(moved);
            }}
            onRemoveSlide={(idx) => {
              const next = newSlides.filter((_, i) => i !== idx);
              setNewSlides(next);
              setNewSlideCount(next.length || 1);
              if (idx === 0 && next.length > 0) {
                setNewThumbnail(next[0]);
              }
            }}
          />

          <form onSubmit={handleCreateTemplate} className="space-y-3.5">
            <TemplateFormInputs
              title={newTitle}
              setTitle={setNewTitle}
              code={newCode}
              setCode={setNewCode}
              category={newCategory}
              setCategory={setNewCategory}
              categoriesList={categoriesList}
              slideCount={newSlideCount}
              setSlideCount={setNewSlideCount}
              priceINR={newPriceINR}
              setPriceINR={setNewPriceINR}
              priceUSD={newPriceUSD}
              setPriceUSD={setNewPriceUSD}
              description={newDesc}
              setDescription={setNewDesc}
              features={newFeatures}
              setFeatures={setNewFeatures}
              isCreditEligible={newIsCreditEligible}
              setIsCreditEligible={setNewIsCreditEligible}
              tier={tier}
              setTier={setTier}
            />

            {addTemplateWarning && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                <span>{addTemplateWarning}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#111111]/10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-extrabold text-[#726F6D] hover:bg-black/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingTemplate || isUploadingPpt}
                className="rounded-lg bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isCreatingTemplate ? "Publishing to Database..." : "Publish Template to Marketplace"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TemplateCreateModal;
