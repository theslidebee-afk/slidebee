import React from "react";
import { useAdmin } from "../context/AdminContext";
import { OrderBriefModal } from "../orders/OrderBriefModal";
import { OverviewWelcomeBanner } from "./OverviewWelcomeBanner";
import { OverviewKpiCards } from "./OverviewKpiCards";
import { OverviewQuickActions } from "./OverviewQuickActions";

export const AdminOverview: React.FC = () => {
  const {
    orders,
    templates,
    profiles,
    subscriptions,
    storageStats,
    setActiveTab,
    setIsAddTemplateOpen,
    setSelectedOrderForModal,
    handleUpdateOrderStatus
  } = useAdmin();

  const registeredClientsCount = profiles.filter(
    (p) => (p.role === "client" || !p.role) && p.email?.toLowerCase().trim() !== "admin@theslidebee.com"
  ).length;

  const activeProSubscribers = subscriptions.filter((s) => s.status === "active");

  const totalR2QuotaMB = 10240;
  const remainingMB = Math.max(0, totalR2QuotaMB - storageStats.totalUsedMB);
  const remainingGB = (remainingMB / 1024).toFixed(2);

  const [overviewOrderToInspect, setOverviewOrderToInspect] = React.useState<any | null>(null);

  return (
    <div className="space-y-6">
      {/* Brief Inspector Modal */}
      {overviewOrderToInspect && (
        <OrderBriefModal
          order={overviewOrderToInspect}
          onClose={() => setOverviewOrderToInspect(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onOrderUpdated={(updated) => {
            setOverviewOrderToInspect(updated);
          }}
        />
      )}

      {/* Welcome Banner with Interactive Linked Counters */}
      <OverviewWelcomeBanner
        ordersCount={orders.length}
        templatesCount={templates.length}
        activeProCount={activeProSubscribers.length}
        remainingGB={remainingGB}
        setActiveTab={setActiveTab}
      />

      {/* 3 KPI Widget Cards with Interactive Navigation */}
      <OverviewKpiCards
        orders={orders}
        templates={templates}
        registeredClientsCount={registeredClientsCount}
        activeProSubscribers={activeProSubscribers}
        remainingGB={remainingGB}
        setActiveTab={setActiveTab}
      />

      {/* Quick Launchpad & Active Highlights in Overview */}
      <OverviewQuickActions
        orders={orders}
        setActiveTab={setActiveTab}
        setIsAddTemplateOpen={setIsAddTemplateOpen}
        setSelectedOrderForModal={setSelectedOrderForModal}
        setOverviewOrderToInspect={setOverviewOrderToInspect}
      />
    </div>
  );
};

export default AdminOverview;
