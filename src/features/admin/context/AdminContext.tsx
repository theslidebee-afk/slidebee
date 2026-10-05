import { createContext, useContext } from "react";
import type { 
  AdminOrderRecord, 
  AdminTemplateRecord, 
  AdminProfileRecord, 
  AdminSubscriptionRecord, 
  AdminStorageStats 
} from "../shared/adminTypes";

export interface AdminContextValue {
  session: any;
  loading: boolean;
  activeTab: "overview" | "inquiries" | "orders" | "templates" | "customization" | "billing" | "storage" | "subscriptions";
  setActiveTab: (tab: "overview" | "inquiries" | "orders" | "templates" | "customization" | "billing" | "storage" | "subscriptions") => void;
  orders: AdminOrderRecord[];
  setOrders: React.Dispatch<React.SetStateAction<AdminOrderRecord[]>>;
  templates: AdminTemplateRecord[];
  setTemplates: React.Dispatch<React.SetStateAction<AdminTemplateRecord[]>>;
  profiles: AdminProfileRecord[];
  setProfiles: React.Dispatch<React.SetStateAction<AdminProfileRecord[]>>;
  subscriptions: AdminSubscriptionRecord[];
  setSubscriptions: React.Dispatch<React.SetStateAction<AdminSubscriptionRecord[]>>;
  siteConfigs: Record<string, any>;
  setSiteConfigs: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  storageStats: AdminStorageStats;
  setStorageStats: React.Dispatch<React.SetStateAction<AdminStorageStats>>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isRefreshingDashboard: boolean;
  refreshFeedback: "idle" | "success" | "error";
  lastRefreshedTime: string | null;
  fetchDashboardData: () => Promise<void>;
  handleLogout: () => Promise<void>;
  handleUpdateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  handleSaveConfig: (key: string, value: any) => Promise<void>;
  configSaving: boolean;
  configSavedSuccess: boolean;
  configValidationError: string;
  setConfigValidationError: (err: string) => void;
  // Modal triggers & handlers
  setIsAddTemplateOpen: (open: boolean) => void;
  setIsBulkImportOpen: (open: boolean) => void;
  openEditTemplateModal: (tpl: any) => void;
  handleDeleteTemplate: (tplId: string | number, tplTitle: string) => Promise<void>;
  handleOpenManageTierModal: (profile: any) => void;
  handleOpenDeleteAccountModal: (client: any) => void;
  handleOpenRevokeProModal: (sub: any) => void;
  handleSendProExpiryReminder: (sub: any) => Promise<void>;
  handleSendProExpiredNotice: (sub: any) => Promise<void>;
  selectedOrderForModal: any | null;
  setSelectedOrderForModal: (order: any | null) => void;
  handleOpenClientEmailComposer: (order: any, type?: "milestone" | "assets" | "ready" | "deliverable") => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return ctx;
}
