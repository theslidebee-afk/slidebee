import React, { useState, useMemo } from "react";
import { useAdmin } from "../context/AdminContext";
import { d1 } from "../../../lib/d1";
import { BulkImportModal } from "./BulkImportModal";
import { TemplateCreateModal } from "./TemplateCreateModal";
import { TemplateEditModal } from "./TemplateEditModal";
import { CategoryModal } from "./CategoryModal";
import {
  TemplatesToolbar,
  TemplatesTableView,
  TemplatesGridView
} from "./components";

export const AdminTemplates: React.FC = () => {
  const {
    session,
    templates,
    setTemplates,
    searchTerm,
    handleDeleteTemplate
  } = useAdmin();

  const [adminTemplateSearch, setAdminTemplateSearch] = useState("");
  const [adminTemplateCategory, setAdminTemplateCategory] = useState("All");
  const [adminTemplateSort, setAdminTemplateSort] = useState("date_desc");
  const [adminTemplateViewMode, setAdminTemplateViewMode] = useState<"table" | "grid">("table");
  const [adminTemplateFilter, setAdminTemplateFilter] = useState<"all" | "published" | "draft" | "free">("all");

  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Pitch Decks",
    "Business",
    "Infographics",
    "Marketing",
    "Corporate",
    "Finance",
    "Strategy"
  ]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  const formatUploadedDate = (dateStr?: string): string => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const sortedAndFilteredTemplates = useMemo(() => {
    const effectiveSearch = (adminTemplateSearch || searchTerm).trim().toLowerCase();

    return templates
      .filter((t: any) => {
        if (adminTemplateFilter === "published" && t.is_published === false) return false;
        if (adminTemplateFilter === "draft" && t.is_published !== false) return false;
        if (adminTemplateFilter === "free" && (t.is_premium && Number(t.price_inr) > 0)) return false;
        if (adminTemplateCategory !== "All" && t.category?.toLowerCase() !== adminTemplateCategory.toLowerCase()) return false;
        if (effectiveSearch) {
          const match =
            (t.title && t.title.toLowerCase().includes(effectiveSearch)) ||
            (t.code && t.code.toLowerCase().includes(effectiveSearch)) ||
            (t.category && t.category.toLowerCase().includes(effectiveSearch)) ||
            (t.description && t.description.toLowerCase().includes(effectiveSearch));
          if (!match) return false;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        switch (adminTemplateSort) {
          case "date_desc": {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return timeB - timeA;
          }
          case "date_asc": {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return timeA - timeB;
          }
          case "title_asc":
            return (a.title || "").localeCompare(b.title || "");
          case "title_desc":
            return (b.title || "").localeCompare(a.title || "");
          case "price_desc":
            return (b.price_inr || b.price_usd || 0) - (a.price_inr || a.price_usd || 0);
          case "price_asc":
            return (a.price_inr || a.price_usd || 0) - (b.price_inr || b.price_usd || 0);
          case "downloads_desc":
            return (b.downloads || 0) - (a.downloads || 0);
          case "slides_desc":
            return (b.slides_count || b.slide_count || 0) - (a.slides_count || a.slide_count || 0);
          default:
            return 0;
        }
      });
  }, [templates, adminTemplateFilter, adminTemplateCategory, adminTemplateSearch, searchTerm, adminTemplateSort]);

  const handleTogglePublished = async (tpl: any) => {
    const nextVal = tpl.is_published === false ? true : false;
    setTemplates(templates.map((t: any) => t.id === tpl.id ? { ...t, is_published: nextVal } : t));
    const authToken = session?.access_token || "";
    const adminKey = localStorage.getItem("slidebee_admin_key") || "";
    try {
      await fetch("/api/admin-template", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(adminKey ? { "x-slidebee-admin-key": adminKey } : {}),
        },
        body: JSON.stringify({ id: tpl.id, is_published: nextVal ? 1 : 0 }),
      });
    } catch (err) {
      await d1.from("templates").update({ is_published: nextVal }).eq("id", tpl.id);
    }
  };

  const handleToggleFreeTier = async (tpl: any) => {
    const nextVal = !tpl.is_credit_eligible;
    const nextIsPremium = nextVal ? 0 : 1;
    setTemplates(templates.map((t: any) => t.id === tpl.id ? { ...t, is_credit_eligible: nextVal, is_premium: nextIsPremium } : t));
    const authToken = session?.access_token || "";
    const adminKey = localStorage.getItem("slidebee_admin_key") || "";
    try {
      await fetch("/api/admin-template", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(adminKey ? { "x-slidebee-admin-key": adminKey } : {}),
        },
        body: JSON.stringify({ id: tpl.id, is_credit_eligible: nextVal ? 1 : 0, is_premium: nextIsPremium }),
      });
    } catch (err) {
      await d1.from("templates").update({ is_credit_eligible: nextVal ? 1 : 0, is_premium: nextIsPremium }).eq("id", tpl.id);
    }
  };

  const hasActiveFilters = Boolean(
    adminTemplateSearch ||
    adminTemplateCategory !== "All" ||
    adminTemplateFilter !== "all" ||
    adminTemplateSort !== "date_desc"
  );

  const handleResetFilters = () => {
    setAdminTemplateSearch("");
    setAdminTemplateCategory("All");
    setAdminTemplateFilter("all");
    setAdminTemplateSort("date_desc");
  };

  return (
    <div className="space-y-6">
      <TemplatesToolbar
        search={adminTemplateSearch}
        onSearchChange={setAdminTemplateSearch}
        category={adminTemplateCategory}
        onCategoryChange={setAdminTemplateCategory}
        categoriesList={categoriesList}
        templates={templates}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        sort={adminTemplateSort}
        onSortChange={setAdminTemplateSort}
        viewMode={adminTemplateViewMode}
        onViewModeChange={setAdminTemplateViewMode}
        filter={adminTemplateFilter}
        onFilterChange={setAdminTemplateFilter}
        filteredCount={sortedAndFilteredTemplates.length}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {adminTemplateViewMode === "table" ? (
        <TemplatesTableView
          templates={sortedAndFilteredTemplates}
          sort={adminTemplateSort}
          onSortChange={setAdminTemplateSort}
          onEditTemplate={setEditingTemplate}
          onTogglePublished={handleTogglePublished}
          onDeleteTemplate={handleDeleteTemplate}
          formatUploadedDate={formatUploadedDate}
        />
      ) : (
        <TemplatesGridView
          templates={sortedAndFilteredTemplates}
          onEditTemplate={setEditingTemplate}
          onTogglePublished={handleTogglePublished}
          onToggleFreeTier={handleToggleFreeTier}
          onDeleteTemplate={handleDeleteTemplate}
          formatUploadedDate={formatUploadedDate}
        />
      )}

      {/* Modals */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        templates={templates}
        onImportSuccess={(newOnes) => setTemplates([...newOnes, ...templates])}
      />

      <TemplateCreateModal
        isOpen={isAddTemplateOpen}
        onClose={() => setIsAddTemplateOpen(false)}
        categoriesList={categoriesList}
        session={session}
        onTemplateCreated={(created) => setTemplates([created, ...templates])}
      />

      {editingTemplate && (
        <TemplateEditModal
          isOpen={Boolean(editingTemplate)}
          template={editingTemplate}
          categoriesList={categoriesList}
          session={session}
          onClose={() => setEditingTemplate(null)}
          onSaveSuccess={(updated) => setTemplates(templates.map((t: any) => t.id === updated.id ? updated : t))}
          onDelete={handleDeleteTemplate}
        />
      )}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoriesList={categoriesList}
        setCategoriesList={setCategoriesList}
        templates={templates}
      />
    </div>
  );
};

export default AdminTemplates;
