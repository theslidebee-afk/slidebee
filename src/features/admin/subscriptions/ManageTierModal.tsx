import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, ShieldCheck, Loader2 } from "lucide-react";
import { d1 } from "../../../lib/d1";
import { sendProGrantedEmail } from "../../../lib/email";
import { useAdmin } from "../context/AdminContext";
import { TierOptionSelector } from "./TierOptionSelector";
import type { TierType } from "./TierOptionSelector";
import { ManageTierNotificationPanel } from "./ManageTierNotificationPanel";

interface ManageTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClient: any;
}

export const ManageTierModal: React.FC<ManageTierModalProps> = ({
  isOpen,
  onClose,
  targetClient,
}) => {
  const { profiles, subscriptions, fetchDashboardData } = useAdmin();
  const [selectedClient, setSelectedClient] = useState<any>(targetClient);
  const [selectedTier, setSelectedTier] = useState<TierType>(
    targetClient?.currentTier || "monthly"
  );
  const [durationMonths, setDurationMonths] = useState<number>(
    targetClient?.currentTier === "yearly" ? 12 : targetClient?.currentTier === "lifetime" ? 0 : 1
  );
  const [sendEmail, setSendEmail] = useState(true);
  const [emailSender, setEmailSender] = useState("design@theslidebee.com");
  const [emailSubject, setEmailSubject] = useState(
    `Your SlideBee Membership Tier Has Been Updated — SlideBee Studio`
  );
  const [emailMessage, setEmailMessage] = useState(
    `Hello ${targetClient?.name || "Valued Client"},\n\nYour SlideBee account access has been updated. You now have full access to our curated presentation template catalog with your upgraded subscription tier.\n\nLog in anytime to explore and download master decks: https://theslidebee.com/login`
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync if targetClient changes
  React.useEffect(() => {
    if (targetClient) {
      setSelectedClient(targetClient);
      const tier = targetClient.currentTier || "monthly";
      setSelectedTier(tier);
      setDurationMonths(tier === "lifetime" ? 0 : tier === "yearly" ? 12 : 1);
      setEmailSubject(`Your SlideBee Membership Tier Has Been Updated to ${tier.toUpperCase()} — SlideBee Studio`);
      setEmailMessage(
        `Hello ${targetClient.name || "Valued Client"},\n\nYour SlideBee account access has been updated. You now have full access to our curated presentation template catalog with your upgraded subscription tier.\n\nLog in anytime to explore and download master decks: https://theslidebee.com/login`
      );
    }
  }, [targetClient]);

  if (!isOpen) return null;

  const handleExecuteSaveTier = async () => {
    if (!selectedClient) return;
    setIsProcessing(true);
    try {
      const clientEmail = selectedClient.email.trim().toLowerCase();
      let expiresAt: string | null = null;

      if (selectedTier === "monthly") {
        expiresAt = new Date(Date.now() + (durationMonths || 1) * 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (selectedTier === "yearly") {
        expiresAt = new Date(Date.now() + (durationMonths || 12) * 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (selectedTier === "lifetime") {
        expiresAt = null;
      } else {
        expiresAt = null;
      }

      // 1. Update profiles table in D1
      const profilePatch: any = {
        tier: selectedTier,
        tier_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      };
      const { error: profileErr } = await d1
        .from("profiles")
        .update(profilePatch)
        .eq("email", clientEmail);
      if (profileErr) throw profileErr;

      // 2. Synchronize subscriptions table in D1
      const existingSub = subscriptions.find((s) => s.user_email?.toLowerCase() === clientEmail);
      if (selectedTier === "free") {
        if (existingSub?.id) {
          await d1.from("subscriptions").update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          }).eq("id", existingSub.id);
        }
      } else {
        const tierLabels: Record<string, string> = {
          monthly: "Monthly VIP Pass",
          yearly: "Yearly VIP Pass",
          lifetime: "Lifetime VIP All-Access",
        };
        const subPayload = {
          user_email: clientEmail,
          plan_name: tierLabels[selectedTier] || "Pro Studio Pass",
          amount_usd: 0,
          amount_inr: 0,
          slides_used: 0,
          slides_limit: selectedTier === "monthly" ? 30 : selectedTier === "yearly" ? 360 : 9999,
          current_period_end: expiresAt,
          status: "active",
          updated_at: new Date().toISOString(),
        };
        if (existingSub?.id) {
          await d1.from("subscriptions").update(subPayload).eq("id", existingSub.id);
        } else {
          await d1.from("subscriptions").insert([subPayload]);
        }
      }

      // 3. Dispatch optional email notification
      if (sendEmail) {
        try {
          await sendProGrantedEmail({
            clientEmail,
            clientName: selectedClient.name,
            slideQuota: selectedTier === "free" ? 3 : selectedTier === "monthly" ? 30 : selectedTier === "yearly" ? 360 : 9999,
            durationMonths,
            partnershipReason: `${selectedTier.toUpperCase()} Tier Access`,
            customMessage: emailMessage,
            senderEmail: emailSender || "design@theslidebee.com",
            subject: emailSubject || "Your SlideBee Access Tier Has Been Updated",
          });
        } catch (e) {
          console.warn("Notice email dispatch error:", e);
        }
      }

      await fetchDashboardData();
      onClose();
    } catch (err: any) {
      console.error("Failed to update client tier:", err);
      alert(`Failed to update tier: ${err?.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white border-2 border-[#111111]/15 rounded-2xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-primary-amber shrink-0">
                <Crown size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-[#111111]">
                  Manage Client Subscription Tier
                </h3>
                <p className="text-xs text-[#726F6D]">
                  Assign or adjust access tiers (Free, Monthly, Yearly, Lifetime) with optional email dispatch
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-[#111111] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Target Client Details Banner */}
          {selectedClient ? (
            <div className="bg-[#FFF9E8] border border-primary/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-sm text-[#111111] block">
                  {selectedClient.name}
                </span>
                <span className="text-xs text-[#726F6D]">
                  {selectedClient.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#726F6D] font-bold">Current Tier:</span>
                <span className="hex-pill-sm bg-primary/20 text-[#111111] border border-primary/40 font-black text-xs px-2.5 py-0.5 uppercase tracking-wider">
                  {selectedClient.currentTier}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-1">
                Select Target Client Profile
              </label>
              <select
                onChange={(e) => {
                  const email = e.target.value;
                  const p = profiles.find((prof) => prof.email?.toLowerCase() === email.toLowerCase());
                  if (p) {
                    setSelectedClient({
                      id: p.id,
                      email: p.email,
                      name: p.full_name || p.email.split("@")[0],
                      currentTier: p.tier || "free",
                    });
                  }
                }}
                className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3 py-2 text-xs text-[#111111] font-bold focus:border-primary outline-none"
              >
                <option value="">-- Choose client profile --</option>
                {profiles
                  .filter((p) => (p.role === "client" || !p.role) && p.email?.toLowerCase().trim() !== "admin@theslidebee.com")
                  .map((p) => (
                    <option key={p.id} value={p.email}>
                      {p.full_name ? `${p.full_name} (${p.email})` : p.email}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Column 1: Tier Selection & Duration */}
            <TierOptionSelector
              selectedTier={selectedTier}
              onSelectTier={(tier) => {
                setSelectedTier(tier);
                if (tier === "lifetime") setDurationMonths(0);
                else if (tier === "yearly") setDurationMonths(12);
                else if (tier === "monthly") setDurationMonths(1);
                setEmailSubject(`Your SlideBee Membership Tier Has Been Updated to ${tier.toUpperCase()} — SlideBee Studio`);
              }}
              durationMonths={durationMonths}
              onSelectDuration={setDurationMonths}
            />

            {/* Column 2: Notification Email Details */}
            <ManageTierNotificationPanel
              sendEmail={sendEmail}
              setSendEmail={setSendEmail}
              emailSender={emailSender}
              setEmailSender={setEmailSender}
              emailSubject={emailSubject}
              setEmailSubject={setEmailSubject}
              emailMessage={emailMessage}
              setEmailMessage={setEmailMessage}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#111111]/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-bold text-[#726F6D] hover:text-[#111111] hover:bg-black/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing || !selectedClient}
              onClick={handleExecuteSaveTier}
              className="rounded-lg bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-6 py-2.5 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Updating Tier...
                </>
              ) : (
                <>
                  <ShieldCheck size={14} /> Update Subscription Tier
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManageTierModal;
