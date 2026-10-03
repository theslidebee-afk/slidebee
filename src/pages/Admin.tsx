import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { d1 } from "../lib/d1";
import { performGlobalLogout, subscribeToAuthSync } from "../lib/authSync";
import { fetchR2Telemetry } from "../lib/r2";
import { 
  sendProExpiringSoonEmail, 
  sendProExpiredEmail 
} from "../lib/email";
import { AdminContext } from "../features/admin/context/AdminContext";
import { AdminHeader } from "../features/admin/components/AdminHeader";
import { AdminNavigation } from "../features/admin/components/AdminNavigation";
import { AdminOverview } from "../features/admin/overview/AdminOverview";
import { AdminOrders } from "../features/admin/orders/AdminOrders";
import { AdminTemplates } from "../features/admin/templates/AdminTemplates";
import { AdminSubscriptions } from "../features/admin/subscriptions/AdminSubscriptions";
import { AdminCMS } from "../features/admin/customization/AdminCMS";
import { AdminBilling } from "../features/admin/billing/AdminBilling";
import { AdminStorage } from "../features/admin/storage/AdminStorage";
import { BulkImportModal } from "../features/admin/templates/BulkImportModal";
import { TemplateCreateModal } from "../features/admin/templates/TemplateCreateModal";
import { TemplateEditModal } from "../features/admin/templates/TemplateEditModal";
import type { 
  AdminOrderRecord, 
  AdminTemplateRecord, 
  AdminProfileRecord, 
  AdminSubscriptionRecord, 
  AdminStorageStats 
} from "../features/admin/shared/adminTypes";

export const Admin: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active sub-tab derived from route
  const getTabFromPath = (): "overview" | "orders" | "templates" | "customization" | "billing" | "storage" | "subscriptions" => {
    const path = location.pathname.toLowerCase();
    if (path.includes("/orders")) return "orders";
    if (path.includes("/templates")) return "templates";
    if (path.includes("/customization")) return "customization";
    if (path.includes("/billing")) return "billing";
    if (path.includes("/storage")) return "storage";
    if (path.includes("/subscriptions")) return "subscriptions";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "templates" | "customization" | "billing" | "storage" | "subscriptions">(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  // Auth & Session
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Live Data collections
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [templates, setTemplates] = useState<AdminTemplateRecord[]>([]);
  const [profiles, setProfiles] = useState<AdminProfileRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRecord[]>([]);
  const [siteConfigs, setSiteConfigs] = useState<Record<string, any>>({});
  const [storageStats, setStorageStats] = useState<AdminStorageStats>({
    pptxMB: 0,
    pptxCount: 0,
    imagesMB: 0,
    imagesCount: 0,
    totalUsedMB: 0,
    remainingGB: 10,
    percentUsed: 0,
    totalFiles: 0,
    objects: [],
    loading: false,
  });

  // Global UI & Feedback state
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false);
  const [refreshFeedback, setRefreshFeedback] = useState<"idle" | "success" | "error">("idle");
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string | null>(null);

  // Config Saving feedback
  const [configSaving, setConfigSaving] = useState(false);
  const [configSavedSuccess, setConfigSavedSuccess] = useState(false);
  const [configValidationError, setConfigValidationError] = useState("");

  // Modals controlled across headers/launchpads
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any | null>(null);

  // Auth Sync Listener
  useEffect(() => {
    const unsub = subscribeToAuthSync((newSession) => {
      setSession(newSession);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch Dashboard Live Data
  const fetchDashboardData = async () => {
    setIsRefreshingDashboard(true);
    try {
      const [ordersRes, templatesRes, profilesRes, subsRes, configsRes] = await Promise.all([
        d1.from("orders").select("*").order("created_at", { ascending: false }),
        d1.from("templates").select("*").order("created_at", { ascending: false }),
        d1.from("profiles").select("*").order("created_at", { ascending: false }),
        d1.from("subscriptions").select("*").order("created_at", { ascending: false }),
        d1.from("site_configs").select("*")
      ]);

      if (ordersRes.data) setOrders(ordersRes.data as AdminOrderRecord[]);
      if (templatesRes.data) setTemplates(templatesRes.data as AdminTemplateRecord[]);
      if (profilesRes.data) setProfiles(profilesRes.data as AdminProfileRecord[]);
      if (subsRes.data) setSubscriptions(subsRes.data as AdminSubscriptionRecord[]);

      if (configsRes.data) {
        const configMap: Record<string, any> = {};
        configsRes.data.forEach((item: any) => {
          try {
            configMap[item.key] = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
          } catch {
            configMap[item.key] = item.value;
          }
        });
        setSiteConfigs(configMap);
      }

      // Storage telemetry
      const r2Stats = await fetchR2Telemetry();
      if (r2Stats) {
        setStorageStats({
          pptxMB: r2Stats.pptxMB || 0,
          pptxCount: r2Stats.pptxCount || 0,
          imagesMB: r2Stats.imagesMB || 0,
          imagesCount: r2Stats.imagesCount || 0,
          totalUsedMB: r2Stats.totalUsedMB || 0,
          remainingGB: r2Stats.remainingGB || 10,
          percentUsed: r2Stats.percentUsed || 0,
          totalFiles: r2Stats.totalFiles || 0,
          objects: r2Stats.objects || [],
          loading: false,
        });
      }

      setRefreshFeedback("success");
      setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {
      setRefreshFeedback("error");
    } finally {
      setIsRefreshingDashboard(false);
      setTimeout(() => setRefreshFeedback("idle"), 4000);
    }
  };

  useEffect(() => {
    if (session?.user?.email?.toLowerCase().trim() === "admin@theslidebee.com") {
      fetchDashboardData();
    }
  }, [session]);

  // Logout handler
  const handleLogout = async () => {
    await performGlobalLogout();
    navigate("/login");
  };

  // Order status mutation
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await d1.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  // Config save mutation
  const handleSaveConfig = async (key: string, value: any) => {
    setConfigSaving(true);
    setConfigValidationError("");
    try {
      const payloadString = JSON.stringify(value);
      await d1.from("site_configs").upsert({
        key,
        value: payloadString,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });

      setSiteConfigs((prev) => ({ ...prev, [key]: value }));
      setConfigSavedSuccess(true);
      setTimeout(() => setConfigSavedSuccess(false), 3000);
    } catch (err: any) {
      setConfigValidationError(err.message || "Failed to save configuration");
    } finally {
      setConfigSaving(false);
    }
  };

  // Delete Template mutation
  const handleDeleteTemplate = async (tplId: string | number, tplTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${tplTitle}"?`)) return;
    try {
      await d1.from("templates").delete().eq("id", tplId);
      setTemplates((prev) => prev.filter((t) => String(t.id) !== String(tplId)));
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  };

  // Pro email dispatchers
  const handleSendProExpiryReminder = async (sub: any) => {
    try {
      const daysLeft = sub.current_period_end 
        ? Math.max(0, Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 7;
      await sendProExpiringSoonEmail({
        clientEmail: sub.user_email,
        clientName: sub.user_email?.split("@")[0] || "VIP Member",
        expiryDate: sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "Soon",
        daysRemaining: daysLeft
      });
      alert(`Sent 7-day expiry notice to ${sub.user_email}`);
    } catch (err: any) {
      alert(`Failed to send reminder: ${err.message || "Unknown error"}`);
    }
  };

  const handleSendProExpiredNotice = async (sub: any) => {
    try {
      await sendProExpiredEmail({
        clientEmail: sub.user_email,
        clientName: sub.user_email?.split("@")[0] || "VIP Member"
      });
      alert(`Sent expiration notice to ${sub.user_email}`);
    } catch (err: any) {
      alert(`Failed to send notice: ${err.message || "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9E8]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111111]" />
      </div>
    );
  }

  // Admin access validation
  const isAdmin = session?.user?.email?.toLowerCase().trim() === "admin@theslidebee.com";
  if (!session || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const contextValue = {
    session,
    loading,
    activeTab,
    setActiveTab,
    orders,
    setOrders,
    templates,
    setTemplates,
    profiles,
    setProfiles,
    subscriptions,
    setSubscriptions,
    siteConfigs,
    setSiteConfigs,
    storageStats,
    setStorageStats,
    searchTerm,
    setSearchTerm,
    isRefreshingDashboard,
    refreshFeedback,
    lastRefreshedTime,
    fetchDashboardData,
    handleLogout,
    handleUpdateOrderStatus,
    handleSaveConfig,
    configSaving,
    configSavedSuccess,
    configValidationError,
    setConfigValidationError,
    setIsAddTemplateOpen,
    setIsBulkImportOpen,
    openEditTemplateModal: (tpl: any) => setEditingTemplate(tpl),
    handleDeleteTemplate,
    handleOpenManageTierModal: () => {
      setActiveTab("subscriptions");
      navigate("/admin/subscriptions");
    },
    handleOpenDeleteAccountModal: () => {
      setActiveTab("subscriptions");
      navigate("/admin/subscriptions");
    },
    handleOpenRevokeProModal: () => {
      setActiveTab("subscriptions");
      navigate("/admin/subscriptions");
    },
    handleSendProExpiryReminder,
    handleSendProExpiredNotice,
    selectedOrderForModal,
    setSelectedOrderForModal,
    handleOpenClientEmailComposer: () => {
      setActiveTab("orders");
      navigate("/admin/orders");
    }
  };

  const categoriesList = [
    "Pitch Decks",
    "Business",
    "Infographics",
    "Marketing",
    "Corporate",
    "Finance",
    "Strategy"
  ];

  return (
    <AdminContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[#FFF9E8] p-4 sm:p-6 lg:p-8 space-y-6">
        <AdminHeader />
        <AdminNavigation />

        {/* Dynamic Nested Domain Routes */}
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="customization" element={<AdminCMS />} />
          <Route path="billing" element={<AdminBilling />} />
          <Route path="storage" element={<AdminStorage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>

        {/* Global Modals triggered from Header */}
        <TemplateCreateModal
          isOpen={isAddTemplateOpen}
          onClose={() => setIsAddTemplateOpen(false)}
          categoriesList={categoriesList}
          session={session}
          onTemplateCreated={(newTpl) => {
            setTemplates((prev) => [newTpl, ...prev]);
            setIsAddTemplateOpen(false);
          }}
        />

        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          templates={templates}
          onImportSuccess={() => {
            setIsBulkImportOpen(false);
            fetchDashboardData();
          }}
        />

        {editingTemplate && (
          <TemplateEditModal
            template={editingTemplate}
            isOpen={!!editingTemplate}
            session={session}
            onClose={() => setEditingTemplate(null)}
            categoriesList={categoriesList}
            onSaveSuccess={(updated: any) => {
              setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
              setEditingTemplate(null);
            }}
            onDelete={handleDeleteTemplate}
          />
        )}
      </div>
    </AdminContext.Provider>
  );
};

export default Admin;
