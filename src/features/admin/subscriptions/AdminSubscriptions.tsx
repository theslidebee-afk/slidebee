import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { ManageTierModal } from "./ManageTierModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { RevokeProModal } from "./RevokeProModal";
import {
  SubscriptionsMetricStrip,
  SubscriptionsTable,
  ClientAccountsTable
} from "./components";

export const AdminSubscriptions: React.FC = () => {
  const { 
    profiles, 
    subscriptions, 
    searchTerm, 
    handleSendProExpiryReminder,
    handleSendProExpiredNotice
  } = useAdmin();

  const [clientFilter, setClientFilter] = useState<"all" | "pro" | "free">("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal states
  const [isManageTierModalOpen, setIsManageTierModalOpen] = useState(false);
  const [manageTierTarget, setManageTierTarget] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<any>(null);

  const clientProfiles = profiles.filter(
    (p) => (p.role === "client" || !p.role) && p.email?.toLowerCase().trim() !== "admin@theslidebee.com"
  );
  const isSubActive = (s: any) => s.status === "active" && (!s.current_period_end || new Date(s.current_period_end) > new Date());
  const activeSubscriptions = subscriptions.filter(isSubActive);
  const freeClients = clientProfiles.filter(
    (p) => !activeSubscriptions.some((s) => s.user_email?.toLowerCase() === p.email?.toLowerCase())
  );

  // Filtering logic
  const filteredProfiles = clientProfiles.filter((p) => {
    const matchesSearch = !searchTerm ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isPro = activeSubscriptions.some((s) => s.user_email?.toLowerCase() === p.email?.toLowerCase());

    if (clientFilter === "pro") return matchesSearch && isPro;
    if (clientFilter === "free") return matchesSearch && !isPro;
    return matchesSearch;
  });

  const openManageTier = (profile: any) => {
    if (!profile) {
      setManageTierTarget(null);
    } else {
      setManageTierTarget({
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.email?.split("@")[0] || "Valued Client",
        currentTier: profile.tier || "free",
        tierExpiresAt: profile.tier_expires_at,
      });
    }
    setIsManageTierModalOpen(true);
  };

  const openDeleteModal = (client: any) => {
    const isPro = Boolean(subscriptions.some(s => s.user_email?.toLowerCase() === client.email?.toLowerCase() && s.status === "active"));
    setDeleteTarget({
      id: client.id,
      email: client.email,
      name: client.full_name || client.email?.split("@")[0] || "Valued Client",
      isPro,
    });
    setIsDeleteModalOpen(true);
  };

  const openRevokeModal = (sub: any) => {
    const cleanEmail = (sub.user_email || "").trim().toLowerCase();
    const matched = profiles.find(p => p.email?.toLowerCase() === cleanEmail);
    setRevokeTarget({
      subId: sub.id,
      clientEmail: cleanEmail,
      clientName: matched?.full_name || cleanEmail.split("@")[0] || "Valued Client",
      expiryDate: sub.current_period_end,
      slidesLimit: sub.slides_limit || 30,
      slidesUsed: sub.slides_used || 0,
    });
    setIsRevokeModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Action Notification Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-extrabold">
            <CheckCircle2 size={16} className={feedback.type === "success" ? "text-emerald-600" : "text-red-600"} />
            {feedback.message}
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Metric Strip */}
      <SubscriptionsMetricStrip
        totalClients={clientProfiles.length}
        activeVips={activeSubscriptions.length}
        lifetimeCount={clientProfiles.filter(p => p.tier === "lifetime").length}
        freeCount={clientProfiles.filter(p => !p.tier || p.tier === "free").length}
      />

      {/* 1. Subscriptions Table */}
      <SubscriptionsTable
        subscriptions={subscriptions}
        activeSubscriptions={activeSubscriptions}
        profiles={profiles}
        isSubActive={isSubActive}
        onOpenManageTier={openManageTier}
        onOpenRevokeModal={openRevokeModal}
        onOpenDeleteModal={openDeleteModal}
        onSendProExpiryReminder={handleSendProExpiryReminder}
        onSendProExpiredNotice={handleSendProExpiredNotice}
      />

      {/* 2. Registered Client Accounts Table */}
      <ClientAccountsTable
        filteredProfiles={filteredProfiles}
        clientProfiles={clientProfiles}
        activeSubscriptions={activeSubscriptions}
        freeClients={freeClients}
        clientFilter={clientFilter}
        onFilterChange={setClientFilter}
        subscriptions={subscriptions}
        isSubActive={isSubActive}
        onOpenManageTier={openManageTier}
        onOpenDeleteModal={openDeleteModal}
      />

      {/* Subscriptions Modals */}
      <ManageTierModal
        isOpen={isManageTierModalOpen}
        onClose={() => {
          setIsManageTierModalOpen(false);
          setManageTierTarget(null);
        }}
        targetClient={manageTierTarget}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        targetClient={deleteTarget}
      />

      <RevokeProModal
        isOpen={isRevokeModalOpen}
        onClose={() => {
          setIsRevokeModalOpen(false);
          setRevokeTarget(null);
        }}
        targetSub={revokeTarget}
      />
    </div>
  );
};

export default AdminSubscriptions;
