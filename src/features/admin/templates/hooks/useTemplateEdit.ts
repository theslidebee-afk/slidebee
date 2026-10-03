import React, { useState } from "react";
import { uploadToR2 } from "../../../../lib/r2";
import { d1 } from "../../../../lib/d1";

export const useTemplateEdit = (
  template: any | null,
  session: any,
  onSaveSuccess: (updatedTemplate: any) => void,
  onClose: () => void
) => {
  const rawSlides = Array.isArray(template?.slides) && template.slides.length > 0 
    ? template.slides 
    : (template?.thumbnail_url || template?.image_url || template?.image ? [template.thumbnail_url || template.image_url || template.image] : []);
  const rawFormats = Array.isArray(template?.formats) ? template.formats : [];
  const rawFeatures = Array.isArray(template?.features) && template.features.length > 0
    ? template.features
    : [`${template?.slide_count || template?.slides_count || 25}+ High-Impact Slides`, "16:9 Widescreen Layout", "Fully Editable Vector Elements"];

  const [editingTemplate, setEditingTemplate] = useState<any>({
    id: template?.id,
    title: template?.title || "",
    code: template?.code || `SLD-${Math.floor(100 + Math.random() * 900)}`,
    category: template?.category || "Pitch Decks",
    price_inr: template?.price_inr ?? 499,
    price_usd: template?.price_usd ?? 9,
    slide_count: template?.slide_count || template?.slides_count || rawSlides.length || 25,
    description: template?.description || "",
    thumbnail_url: template?.thumbnail_url || template?.image_url || template?.image || (rawSlides[0] || ""),
    slides: rawSlides,
    download_url: template?.download_url || "",
    file_name: template?.file_name || "",
    formats: rawFormats,
    features: rawFeatures,
    is_published: template?.is_published !== false,
    is_credit_eligible: Boolean(template?.is_credit_eligible)
  });

  const [isSavingEditTemplate, setIsSavingEditTemplate] = useState(false);
  const [editTemplateSuccess, setEditTemplateSuccess] = useState(false);
  const [isUploadingEditPpt, setIsUploadingEditPpt] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);
  const [editTemplateWarning, setEditTemplateWarning] = useState("");

  const handleEditCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const r2Res = await uploadToR2(file, { folder: "templates/slides", fileName: file.name });
      if (r2Res.success && r2Res.publicUrl) {
        setEditingTemplate((prev: any) => ({
          ...prev,
          thumbnail_url: r2Res.publicUrl,
          image_url: r2Res.publicUrl
        }));
        setEditTemplateWarning("");
      } else {
        throw new Error(r2Res.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Failed to upload Cover image to Cloudflare R2: " + (err.message || err));
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
      setEditingTemplate((prev: any) => {
        const nextSlides = [...(prev.slides || []), ...uploadedUrls];
        return {
          ...prev,
          slides: nextSlides,
          slide_count: nextSlides.length,
          thumbnail_url: !prev.thumbnail_url && uploadedUrls.length > 0 ? uploadedUrls[0] : prev.thumbnail_url
        };
      });
    } catch (err: any) {
      alert("Failed to upload slide images to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingSlide(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleEditPptFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEditPpt(true);
    try {
      const r2Res = await uploadToR2(file, { folder: "templates/decks", fileName: file.name });
      if (r2Res.success && r2Res.publicUrl) {
        setEditingTemplate((prev: any) => ({
          ...prev,
          download_url: r2Res.publicUrl,
          file_name: file.name
        }));
      } else {
        throw new Error(r2Res.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Failed to upload Master PPTX to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingEditPpt(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditTemplateWarning("");

    if (!editingTemplate.title.trim()) {
      setEditTemplateWarning("Please enter a Template Title.");
      return;
    }
    if (editingTemplate.price_inr === "" || isNaN(Number(editingTemplate.price_inr)) || Number(editingTemplate.price_inr) <= 0) {
      setEditTemplateWarning("Price cannot be 0. Please mark it as a free tag.");
      return;
    }
    if (editingTemplate.price_usd === "" || isNaN(Number(editingTemplate.price_usd)) || Number(editingTemplate.price_usd) <= 0) {
      setEditTemplateWarning("Price cannot be 0. Please mark it as a free tag.");
      return;
    }
    if (editingTemplate.slide_count === "" || isNaN(Number(editingTemplate.slide_count)) || Number(editingTemplate.slide_count) < 1) {
      setEditTemplateWarning("Please enter a valid Total Slides Count (minimum 1).");
      return;
    }

    setIsSavingEditTemplate(true);
    const effectiveDownloadUrl = editingTemplate.download_url || "";
    const effectiveSlides = editingTemplate.slides.length > 0 ? editingTemplate.slides : [editingTemplate.thumbnail_url];
    const effectiveSlideCount = Number(editingTemplate.slide_count) || effectiveSlides.length;

    const payload = {
      title: editingTemplate.title,
      code: editingTemplate.code,
      category: editingTemplate.category,
      price_inr: Number(editingTemplate.price_inr),
      price_usd: Number(editingTemplate.price_usd),
      original_price_inr: Number(editingTemplate.price_inr) * 2,
      slides_count: effectiveSlideCount,
      thumbnail_url: editingTemplate.thumbnail_url,
      image_url: editingTemplate.thumbnail_url,
      slides: effectiveSlides,
      download_url: effectiveDownloadUrl,
      formats: editingTemplate.formats,
      description: editingTemplate.description,
      features: editingTemplate.features,
      is_published: editingTemplate.is_published ? 1 : 0,
      is_premium: Number(editingTemplate.price_inr) > 0 ? 1 : 0,
      is_credit_eligible: editingTemplate.is_credit_eligible ? 1 : 0
    };

    try {
      let isUpdated = false;
      let updatedRecord: any = null;

      try {
        const adminKey = localStorage.getItem("slidebee_admin_key") || "";
        const authToken = session?.access_token || "";
        const res = await fetch("/api/admin-template", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            ...(adminKey ? { "x-slidebee-admin-key": adminKey } : {}),
          },
          body: JSON.stringify({ id: editingTemplate.id, ...payload }),
        });

        if (res.ok) {
          const resJson = await res.json();
          if (resJson.success && resJson.template) {
            isUpdated = true;
            updatedRecord = resJson.template;
          }
        }
      } catch (apiErr) {
        console.warn("Backend /api/admin-template PUT notice:", apiErr);
      }

      if (!isUpdated) {
        const { data, error } = await d1
          .from("templates")
          .update(payload)
          .eq("id", editingTemplate.id);

        if (!error && data) {
          isUpdated = true;
          updatedRecord = Array.isArray(data) ? data[0] : data;
        }
      }

      const finalTpl = updatedRecord ? { ...editingTemplate, ...updatedRecord } : { ...editingTemplate, ...payload };
      onSaveSuccess(finalTpl);
      setEditTemplateSuccess(true);
      setTimeout(() => {
        setEditTemplateSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.warn("Template edit notice:", err);
      onSaveSuccess({ ...editingTemplate, ...payload });
      onClose();
    } finally {
      setIsSavingEditTemplate(false);
    }
  };

  return {
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
  };
};
