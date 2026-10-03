import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ExternalLink } from "lucide-react";
import { getSafeExternalUrl } from "../shared/adminConstants";
import {
  OrderMilestoneStepper,
  OrderEmailComposer
} from "./modal";
import { OrderDeliverableSection, useOrderDeliverable } from "./OrderDeliverableSection";
import { useClientEmailComposer } from "./useClientEmailComposer";

interface OrderBriefModalProps {
  order: any | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onOrderUpdated?: (updatedOrder: any) => void;
}

export const OrderBriefModal: React.FC<OrderBriefModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onOrderUpdated
}) => {
  const [currentOrder, setCurrentOrder] = useState<any>(order);

  const deliverableState = useOrderDeliverable();

  const handleStatusChange = async (statusKey: string) => {
    await onUpdateStatus(currentOrder.id, statusKey);
    const updated = { ...currentOrder, status: statusKey };
    setCurrentOrder(updated);
    if (onOrderUpdated) onOrderUpdated(updated);
  };

  const emailState = useClientEmailComposer(
    currentOrder,
    setCurrentOrder,
    onOrderUpdated,
    handleStatusChange,
    deliverableState.orderDeliverableFile,
    deliverableState.setDeliverableSuccessMsg
  );

  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border-2 border-[#111111]/15 rounded-2xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-5"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-[#111111] transition-colors rounded-lg bg-black/5 hover:bg-black/10 cursor-pointer"
          >
            <X size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-lg bg-[#FFF9E8] text-primary-amber border border-primary/30 text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                Order #{currentOrder.id?.slice(0, 8) || "N/A"}
              </span>
              {currentOrder.rush_delivery && (
                <span className="rounded-lg bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-0.5 border border-red-200 flex items-center gap-1">
                  <Zap size={10} /> 24h Rush Order
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111] mb-1">
              {currentOrder.service_type || "Presentation Design"}
            </h3>
            <p className="text-xs text-[#726F6D] font-medium">
              Client: <strong className="text-[#111111]">{currentOrder.client_name || "N/A"}</strong> ({currentOrder.client_email})
            </p>
          </div>

          <OrderMilestoneStepper
            status={currentOrder.status}
            onStatusChange={handleStatusChange}
          />

          {/* Order Scope & Requirements */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-lg border border-[#111111]/8">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">Slide Scope</span>
                <span className="font-extrabold text-[#111111] text-sm">{currentOrder.slide_count || "Custom"} Slides</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">Target Deadline</span>
                <span className="font-extrabold text-[#111111] text-sm">{currentOrder.target_date || "Standard (48h)"}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">Contact Phone</span>
                <span className="font-extrabold text-[#111111] text-sm">{currentOrder.phone || "Not provided"}</span>
              </div>
            </div>

            {currentOrder.notes && (
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#111111] block mb-1">
                  Client Project Brief & Notes:
                </span>
                <div className="p-3 bg-[#FFF9E8] rounded-lg border border-primary/20 text-[#111111] font-medium leading-relaxed whitespace-pre-wrap">
                  {currentOrder.notes}
                </div>
              </div>
            )}

            {currentOrder.drive_link && (
              <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <div>
                  <span className="font-extrabold text-[#111111] block text-xs">Google Drive / Cloud Assets</span>
                  <span className="text-[11px] text-[#726F6D] truncate max-w-xs sm:max-w-md block">
                    {currentOrder.drive_link}
                  </span>
                </div>
                <a
                  href={getSafeExternalUrl(currentOrder.drive_link)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-3.5 py-1.5 flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  Open Link <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          <OrderDeliverableSection
            currentOrder={currentOrder}
            setCurrentOrder={setCurrentOrder}
            onOrderUpdated={onOrderUpdated}
            handleStatusChange={handleStatusChange}
            setIsClientEmailComposerOpen={emailState.setIsClientEmailComposerOpen}
            handleApplyClientEmailTemplate={emailState.handleApplyClientEmailTemplate}
            clientEmailSender={emailState.clientEmailSender}
            {...deliverableState}
          />

          <OrderEmailComposer
            isOpen={emailState.isClientEmailComposerOpen}
            onClose={() => {
              emailState.setIsClientEmailComposerOpen(false);
              emailState.setClientEmailStatus(null);
            }}
            clientEmail={currentOrder.client_email}
            sender={emailState.clientEmailSender}
            onSenderChange={emailState.setClientEmailSender}
            subject={emailState.clientEmailSubject}
            onSubjectChange={emailState.setClientEmailSubject}
            body={emailState.clientEmailBody}
            onBodyChange={emailState.setClientEmailBody}
            orderDeliverableFile={deliverableState.orderDeliverableFile}
            status={emailState.clientEmailStatus}
            isSending={emailState.isSendingClientEmail}
            onApplyTemplate={emailState.handleApplyClientEmailTemplate}
            onSendEmail={emailState.handleSendClientEmail}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderBriefModal;
