import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Play,
  Pause,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { d1 } from "../../../lib/d1";

interface PromotionItem {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  currency: "INR" | "USD" | "ALL";
  applicable_scope: "all" | "subscription" | "template";
  starts_at: string;
  expires_at: string;
  max_total_redemptions: number | null;
  redemption_count: number;
  max_redemptions_per_user: number;
  is_active: number;
  created_at?: string;
}

export const AdminCampaignManager: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [currency, setCurrency] = useState<"ALL" | "INR" | "USD">("ALL");
  const [applicableScope, setApplicableScope] = useState<"all" | "subscription" | "template">("all");
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [expiresAt, setExpiresAt] = useState(() => {
    const nextMonth = new Date(Date.now() + 60 * 86400000);
    return nextMonth.toISOString().slice(0, 16);
  });
  const [maxTotalRedemptions, setMaxTotalRedemptions] = useState<number>(1000);
  const [maxPerUser, setMaxPerUser] = useState<number>(1);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await d1
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Failed to fetch promotions:", error);
      } else if (Array.isArray(data)) {
        setPromotions(data);
      }
    } catch (err) {
      console.warn("Promotions load exception:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleToggleActive = async (promo: PromotionItem) => {
    const newStatus = promo.is_active === 1 ? 0 : 1;
    setActionLoading(promo.id);
    try {
      const { error } = await d1
        .from("promotions")
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .eq("id", promo.id);

      if (error) {
        setFeedback({ type: "error", message: `Failed to update campaign: ${error.message}` });
      } else {
        setPromotions((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, is_active: newStatus } : p))
        );
        setFeedback({
          type: "success",
          message: `Campaign "${promo.name}" is now ${newStatus === 1 ? "active" : "paused"}.`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update campaign." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePromotion = async (promo: PromotionItem) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${promo.name}" (${promo.code})?`)) {
      return;
    }

    setActionLoading(promo.id);
    try {
      const { error } = await d1.from("promotions").delete().eq("id", promo.id);
      if (error) {
        setFeedback({ type: "error", message: `Failed to delete campaign: ${error.message}` });
      } else {
        setPromotions((prev) => prev.filter((p) => p.id !== promo.id));
        setFeedback({ type: "success", message: `Campaign "${promo.name}" removed.` });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete campaign." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setFeedback({ type: "error", message: "Promotion code and campaign name are required." });
      return;
    }

    const promoId = `prm_${code.trim().toLowerCase()}_${Date.now().toString(36)}`;
    const newRecord = {
      id: promoId,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: Number(discountValue) || 10,
      currency,
      applicable_scope: applicableScope,
      eligible_tiers: '["monthly","yearly","lifetime"]',
      eligible_template_ids: null,
      min_order_amount_inr: 0,
      min_order_amount_usd: 0,
      starts_at: new Date(startsAt).toISOString().replace("T", " ").slice(0, 19),
      expires_at: new Date(expiresAt).toISOString().replace("T", " ").slice(0, 19),
      max_total_redemptions: Number(maxTotalRedemptions) || null,
      redemption_count: 0,
      max_redemptions_per_user: Number(maxPerUser) || 1,
      is_active: 1,
    };

    setActionLoading("creating");
    try {
      const { error } = await d1.from("promotions").insert([newRecord]);
      if (error) {
        setFeedback({ type: "error", message: `Failed to create campaign: ${error.message}` });
      } else {
        setPromotions((prev) => [newRecord as PromotionItem, ...prev]);
        setFeedback({
          type: "success",
          message: `Campaign "${newRecord.name}" (${newRecord.code}) created successfully.`,
        });
        setIsCreateOpen(false);
        setCode("");
        setName("");
        setDescription("");
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to create campaign." });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div id="campaigns" className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="hex-pill-sm bg-amber-100 text-[#936610] text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider border border-amber-300">
              Promotions Engine
            </span>
            <h3 className="text-base font-heading font-extrabold text-[#111111]">
              Coupon Codes & Campaign Manager
            </h3>
          </div>
          <p className="text-xs text-[#726F6D] mt-1">
            Create, monitor, and toggle discount vouchers for SlideBee Pro subscriptions and template purchases.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(!isCreateOpen)}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-5 py-2.5 text-xs flex items-center justify-center gap-1.5 shadow transition-all hover:scale-105 shrink-0"
        >
          <Plus size={14} /> {isCreateOpen ? "Close Creator" : "New Campaign"}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-red-50 border border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Campaign Creation Drawer */}
      {isCreateOpen && (
        <form
          onSubmit={handleCreatePromotion}
          className="bg-[#FFF9E8] p-5 sm:p-6 rounded-2xl border border-primary/40 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs font-black text-[#111111] uppercase tracking-wider">
            <Sparkles size={14} className="text-primary-amber" />
            <span>Create Promotional Campaign</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Coupon Code * (e.g. DIWALI50)
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                placeholder="PROMOCODE"
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-mono font-black text-[#111111] uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Campaign Name * (e.g. Diwali Festival Studio Special)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Executive Campaign Title"
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-bold text-[#111111]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
              Customer Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Flat 50% discount on all executive Pro plans"
              className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs text-[#111111]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-bold text-[#111111]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount (₹ / $)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Discount Value
              </label>
              <input
                type="number"
                min="1"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-black text-[#111111]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Scope
              </label>
              <select
                value={applicableScope}
                onChange={(e) => setApplicableScope(e.target.value as any)}
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-bold text-[#111111]"
              >
                <option value="all">All (Subscriptions & Templates)</option>
                <option value="subscription">Subscriptions Only</option>
                <option value="template">Templates Only</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-bold text-[#111111]"
              >
                <option value="ALL">All Currencies</option>
                <option value="INR">INR (₹) Only</option>
                <option value="USD">USD ($) Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-medium text-[#111111]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Expiration Date
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-medium text-[#111111]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Global Limit
              </label>
              <input
                type="number"
                min="1"
                value={maxTotalRedemptions}
                onChange={(e) => setMaxTotalRedemptions(Number(e.target.value))}
                placeholder="1000"
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-bold text-[#111111]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                Per-User Limit
              </label>
              <input
                type="number"
                min="1"
                value={maxPerUser}
                onChange={(e) => setMaxPerUser(Number(e.target.value))}
                placeholder="1"
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-bold text-[#111111]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#726F6D] hover:text-[#111111] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading === "creating"}
              className="hex-pill bg-[#111111] text-[#FCBF14] hover:bg-black font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
            >
              {actionLoading === "creating" ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving Campaign...
                </>
              ) : (
                <>
                  <Tag size={14} /> Launch Campaign
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Campaigns Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-xs text-[#726F6D] gap-2">
            <Loader2 size={20} className="animate-spin text-[#936610]" />
            <span>Loading active campaigns...</span>
          </div>
        ) : promotions.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#726F6D]">
            No promotion campaigns found in Cloudflare D1 database.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#111111]/10 text-[11px] uppercase tracking-wider text-[#726F6D] font-bold">
                <th className="py-3 px-3">Campaign Code</th>
                <th className="py-3 px-3">Name & Details</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Scope & Currency</th>
                <th className="py-3 px-3">Redemptions</th>
                <th className="py-3 px-3">Validity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/6">
              {promotions.map((p) => {
                const isExpired = new Date(p.expires_at) < new Date();
                const isExhausted =
                  p.max_total_redemptions !== null && p.redemption_count >= p.max_total_redemptions;
                const isCurrentlyActive = p.is_active === 1 && !isExpired && !isExhausted;

                return (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-black text-xs uppercase px-2.5 py-1 rounded-md bg-[#FFF9E8] border border-amber-300 text-[#936610] tracking-wider inline-block">
                        {p.code || "AUTOMATIC"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#111111]">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-[#726F6D] truncate max-w-xs">{p.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-[#111111]">
                      {p.discount_type === "percentage"
                        ? `${p.discount_value}% OFF`
                        : `${p.currency === "USD" ? "$" : "₹"}${p.discount_value} OFF`}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="capitalize font-semibold text-zinc-800">{p.applicable_scope}</span>
                      <div className="text-[10px] text-[#726F6D] uppercase">{p.currency} currency</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium">
                      <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                        <Users size={12} className="text-[#936610]" />
                        <span>{p.redemption_count}</span>
                        {p.max_total_redemptions && (
                          <span className="text-[11px] text-[#726F6D] font-normal">
                            / {p.max_total_redemptions}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-[#726F6D]">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} className="text-[#936610]" />
                        <span>Until {new Date(p.expires_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      {isCurrentlyActive ? (
                        <span className="hex-pill-sm bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 border border-emerald-300 uppercase">
                          Active
                        </span>
                      ) : isExpired ? (
                        <span className="hex-pill-sm bg-zinc-100 text-zinc-600 text-[10px] font-black px-2.5 py-0.5 border border-zinc-200 uppercase">
                          Expired
                        </span>
                      ) : isExhausted ? (
                        <span className="hex-pill-sm bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 border border-rose-300 uppercase">
                          Exhausted
                        </span>
                      ) : (
                        <span className="hex-pill-sm bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 border border-amber-300 uppercase">
                          Paused
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          disabled={actionLoading === p.id}
                          title={p.is_active === 1 ? "Pause campaign" : "Activate campaign"}
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors disabled:opacity-40"
                        >
                          {p.is_active === 1 ? <Pause size={13} /> : <Play size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePromotion(p)}
                          disabled={actionLoading === p.id}
                          title="Delete campaign"
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
