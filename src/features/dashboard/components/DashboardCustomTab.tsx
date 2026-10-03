import { Link } from "react-router-dom";
import { Briefcase, ArrowRight, Download, Mail, CheckCircle2, MessageCircle } from "lucide-react";

interface DashboardCustomTabProps {
  userOrders: any[];
  studioWhatsapp: string;
}

export function DashboardCustomTab({ userOrders, studioWhatsapp }: DashboardCustomTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-black text-[#111111]">
            Custom Presentation Projects
          </h2>
          <p className="text-xs text-[#726F6D]">
            Commission progress, milestone reviews, and executive polish
          </p>
        </div>
        <Link
          to="/services"
          className="hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black px-4 py-2 flex items-center gap-1.5 shadow-xs"
        >
          Start New Brief <ArrowRight size={13} />
        </Link>
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF9E8] border border-primary/30 text-[#111111] flex items-center justify-center mx-auto">
            <Briefcase size={26} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-black text-base text-[#111111]">
              No custom projects commissioned yet
            </h3>
            <p className="text-xs text-[#726F6D]">
              Have a high-stakes investor pitch deck or keynote? Submit your brief to our bespoke presentation studio.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 hex-pill bg-primary hover:bg-primary/90 text-[#111111] font-black text-xs px-6 py-2.5 shadow-sm"
          >
            Commission Presentation Deck <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {userOrders.map((order, idx) => {
            const title = order.project_title || order.service_type || `Custom Presentation #${idx + 1}`;
            const isDelivered = order.status === "completed" || order.status === "delivered";
            const milestoneText = isDelivered
              ? "Completed & Delivered"
              : order.status === "draft_1"
              ? "Draft 1 (Blueprint)"
              : order.status === "draft_2"
              ? "Draft 2 (Design Alignment)"
              : order.status === "polish"
              ? "Final Polish"
              : "In Review";
            const progressPercent = isDelivered
              ? 100
              : order.status === "draft_1"
              ? 35
              : order.status === "draft_2"
              ? 70
              : 85;

            return (
              <div
                key={order.id || idx}
                className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber bg-primary/20 px-2 py-0.5 rounded">
                        {order.service_type || "Custom Presentation"}
                      </span>
                      {order.rush_delivery && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          Rush 24h
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-black text-base text-[#111111] mt-1.5">
                      {title}
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Brief submitted: {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Active cycle"}
                      {order.slide_count ? ` • ${order.slide_count} slides` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                      isDelivered
                        ? "text-emerald-800 bg-emerald-100"
                        : "text-amber-800 bg-amber-100"
                    }`}
                  >
                    {milestoneText}
                  </span>
                </div>

                {/* Progress Stepper */}
                <div className="py-2">
                  <div className="flex justify-between text-xs font-bold text-[#111111] mb-2">
                    <span>Milestone Progress</span>
                    <span>{progressPercent}% Polished</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Master Deliverable Download Box */}
                {order.deliverable_url ? (
                  <div className="bg-[#FEF5DC] border border-[#FCBF14]/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FCBF14] text-[#111111] flex items-center justify-center font-bold shrink-0">
                        <Download size={20} />
                      </div>
                      <div>
                        <h5 className="font-heading font-black text-sm text-[#111111]">
                          {order.deliverable_name || "Final Master Presentation (.pptx)"}
                        </h5>
                        <p className="text-xs text-[#726F6D]">
                          Studio delivery verified • Full commercial license included
                        </p>
                      </div>
                    </div>
                    <a
                      href={order.deliverable_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto hex-pill bg-[#111111] hover:bg-black text-white text-xs font-black px-5 py-2.5 flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
                    >
                      <Download size={14} /> Download Final Master (.pptx)
                    </a>
                  </div>
                ) : (order.status === "completed" || order.deliverable_name || order.deliverable_sent_at) ? (
                  <div className="bg-[#FEF5DC] border border-[#FCBF14]/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#FCBF14] flex items-center justify-center font-bold shrink-0">
                        <Mail size={20} />
                      </div>
                      <div>
                        <h5 className="font-heading font-black text-sm text-[#111111]">
                          {order.deliverable_name || "Final Master Presentation (.pptx)"}
                        </h5>
                        <p className="text-xs text-[#726F6D]">
                          Dispatched directly as attachment to your registered email ({order.client_email || "your inbox"}).
                        </p>
                      </div>
                    </div>
                    <span className="hex-pill-sm bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1.5 border border-emerald-300 flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 size={13} className="text-emerald-600" /> Dispatched via Email
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-[#726F6D]">
                      Final master deliverables will be dispatched directly to your email upon studio milestone completion.
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      In Production
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs">
                  <span className="text-[#726F6D]">
                    Need changes? Request rapid turnaround with your dedicated studio team.
                  </span>
                  <a
                    href={`https://wa.me/${studioWhatsapp}?text=Inquiring%20about%20my%20brief%20${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hex-pill bg-[#111111] hover:bg-black text-white font-bold px-4 py-2 flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <MessageCircle size={13} /> Chat with Lead Designer
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
