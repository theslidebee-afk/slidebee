import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  RefreshCw,
  Filter,
  ChevronRight,
  Trash2
} from "lucide-react";
import { d1 } from "../../../lib/d1";
import { InquiryDetailModal, type InquiryItem } from "./InquiryDetailModal";

export const AdminInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);

  const fetchInboundData = async () => {
    setLoading(true);
    try {
      // 1. Fetch from orders table (inquiries and quote intakes)
      const { data: orderData } = await d1
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // 2. Fetch from waitlist table (contact form messages)
      const { data: waitlistData } = await d1
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      const parsedItems: InquiryItem[] = [];

      // Process orders
      if (Array.isArray(orderData)) {
        orderData.forEach((ord: any) => {
          const isQuote = ord.status === "inquiry" || (ord.service_type || "").toLowerCase().includes("quote") || (ord.service_type || "").toLowerCase().includes("inbound");
          if (isQuote) {
            parsedItems.push({
              id: ord.id || ord.order_reference,
              orderReference: ord.order_reference,
              sourceType: "order_inquiry",
              fullName: ord.full_name || ord.client_name || "Prospective Client",
              email: ord.email || ord.client_email || "",
              phone: ord.phone,
              company: ord.company,
              serviceType: ord.service_type || "Custom Presentation Quote",
              projectBrief: ord.project_brief || ord.project_notes || "",
              stylePreference: ord.style_preference,
              createdAt: ord.created_at || new Date().toISOString(),
              status: (ord.status === "inquiry" ? "new" : ord.status) || "new",
            });
          }
        });
      }

      // Process waitlist contact messages
      if (Array.isArray(waitlistData)) {
        waitlistData.forEach((w: any) => {
          const src = w.source || "";
          if (src.includes("contact_form:")) {
            // Parse: contact_form: Name | Sub: Subject | Msg: Message
            let name = "Website Visitor";
            let sub = "General Inquiry";
            let msg = src;

            const nameMatch = src.match(/contact_form:\s*([^|]+)/);
            if (nameMatch) name = nameMatch[1].trim();

            const subMatch = src.match(/Sub:\s*([^|]+)/);
            if (subMatch) sub = subMatch[1].trim();

            const msgMatch = src.match(/Msg:\s*(.+)$/s);
            if (msgMatch) msg = msgMatch[1].trim();

            parsedItems.push({
              id: `wl-${w.id}`,
              orderReference: `MSG-${w.id}`,
              sourceType: "contact_message",
              fullName: name,
              email: w.email || "",
              serviceType: "Contact Message",
              subject: sub,
              projectBrief: msg,
              createdAt: w.created_at || new Date().toISOString(),
              status: "new",
            });
          }
        });
      }

      // Sort by newest first
      parsedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setInquiries(parsedItems);
    } catch (err) {
      console.error("Failed to fetch inbound inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboundData();
  }, []);

  const handleUpdateStatus = async (id: string | number, nextStatus: InquiryItem["status"]) => {
    try {
      const target = inquiries.find((i) => i.id === id);
      if (target?.sourceType === "order_inquiry") {
        await d1.from("orders").update({ status: nextStatus }).eq("id", id);
      }
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: nextStatus });
      }
    } catch (err) {
      console.warn("Status update notice:", err);
    }
  };

  const handleDeleteInquiry = async (id: string | number, sourceType: string) => {
    if (!window.confirm("Are you sure you want to discard this inbound inquiry?")) return;
    try {
      if (sourceType === "order_inquiry") {
        await d1.from("orders").delete().eq("id", id);
      } else if (sourceType === "contact_message") {
        const rawId = String(id).replace("wl-", "");
        await d1.from("waitlist").delete().eq("id", rawId);
      }
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      setSelectedInquiry(null);
    } catch (err) {
      console.warn("Delete inquiry notice:", err);
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchSearch =
        inq.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inq.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inq.serviceType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.projectBrief.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter === "all") return true;
      return inq.status === statusFilter;
    });
  }, [inquiries, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: inquiries.length,
      new: inquiries.filter((i) => i.status === "new").length,
      quoted: inquiries.filter((i) => i.status === "quoted").length,
      converted: inquiries.filter((i) => i.status === "converted").length,
    };
  }, [inquiries]);

  return (
    <div className="space-y-6 text-left">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h2 className="text-xl font-heading font-black text-[#111111] flex items-center gap-2">
            <MessageSquare size={20} className="text-primary-amber" />
            Inbound Quotes & Communications Hub
          </h2>
          <p className="text-xs text-[#726F6D]">
            Inspect all inbound project briefs, quote requests, and direct client inquiries from /contact and /ordernow.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchInboundData}
          disabled={loading}
          className="hex-pill self-start bg-white hover:bg-gray-50 border border-[#111111]/15 text-[#111111] font-extrabold px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh Inbound Feed
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#111111]/10 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#726F6D] block mb-1">
            Total Inbound Leads
          </span>
          <span className="text-2xl font-heading font-black text-[#111111]">{counts.total}</span>
        </div>
        <div className="bg-[#FFF9E8] border border-primary/30 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber block mb-1">
            New / Uncontacted
          </span>
          <span className="text-2xl font-heading font-black text-amber-900">{counts.new}</span>
        </div>
        <div className="bg-white border border-[#111111]/10 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#726F6D] block mb-1">
            Quotes Delivered
          </span>
          <span className="text-2xl font-heading font-black text-[#111111]">{counts.quoted}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
            Converted / Won
          </span>
          <span className="text-2xl font-heading font-black text-emerald-900">{counts.converted}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, email, brief..."
            className="w-full bg-white border border-[#111111]/15 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-[#111111] outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter size={13} className="text-gray-400 shrink-0 mr-1" />
          {(["all", "new", "quoted", "converted"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`text-xs font-black px-3 py-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                statusFilter === filter
                  ? "bg-[#111111] text-[#FCBF14] border-[#111111]"
                  : "bg-white text-[#726F6D] border-gray-200 hover:border-gray-400"
              }`}
            >
              {filter === "all" && "All Leads"}
              {filter === "new" && `New (${counts.new})`}
              {filter === "quoted" && "Quoted"}
              {filter === "converted" && "Converted"}
            </button>
          ))}
        </div>
      </div>

      {/* Communications Table */}
      <div className="bg-white border border-[#111111]/12 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[10px] font-black uppercase tracking-wider text-[#726F6D]">
              <tr>
                <th className="py-3 px-4">Timestamp & Ref</th>
                <th className="py-3 px-4">Client Contact</th>
                <th className="py-3 px-4">Service Scope</th>
                <th className="py-3 px-4">Project Brief / Message</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/6">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#726F6D]">
                    <RefreshCw className="animate-spin inline mr-2 text-primary-amber" size={16} />
                    Loading inbound leads and client communications...
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#726F6D]">
                    No communications found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className="hover:bg-[#FFFDF5] transition-colors cursor-pointer"
                    onClick={() => setSelectedInquiry(inq)}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-[10px] font-bold text-primary-amber">
                        {inq.orderReference || "INQ-DIRECT"}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#111111]">{inq.fullName}</div>
                      <div className="text-[10px] text-[#726F6D]">{inq.email}</div>
                      {inq.company && (
                        <div className="text-[10px] text-gray-400 font-medium">{inq.company}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block bg-[#FFF9E8] border border-primary/30 text-amber-900 font-extrabold px-2 py-0.5 rounded text-[10px]">
                        {inq.serviceType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-[#333333] text-[11px] font-medium leading-relaxed">
                        {inq.projectBrief}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          inq.status === "new"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : inq.status === "quoted"
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : inq.status === "converted"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inq.status === "new" && "New Lead"}
                        {inq.status === "quoted" && "Quoted"}
                        {inq.status === "converted" && "Converted"}
                        {inq.status === "archived" && "Archived"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(inq)}
                          className="bg-primary hover:bg-primary-dark text-[#111111] font-bold px-3 py-1 rounded-lg text-[11px] shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          View & Reply <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(inq.id, inq.sourceType)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Discard Inquiry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail & Reply Modal */}
      <InquiryDetailModal
        isOpen={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        inquiry={selectedInquiry}
        onUpdateStatus={handleUpdateStatus}
        onDeleteInquiry={handleDeleteInquiry}
      />
    </div>
  );
};

export default AdminInquiries;
