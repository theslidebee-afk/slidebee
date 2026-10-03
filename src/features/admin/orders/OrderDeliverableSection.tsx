import React, { useState } from "react";
import { OrderDeliverableUploader } from "./modal/OrderDeliverableUploader";

interface OrderDeliverableSectionProps {
  currentOrder: any;
  setCurrentOrder: (order: any) => void;
  onOrderUpdated?: (updatedOrder: any) => void;
  handleStatusChange: (statusKey: string) => Promise<void>;
  setIsClientEmailComposerOpen: (open: boolean) => void;
  handleApplyClientEmailTemplate: (templateType: "milestone" | "assets" | "ready" | "deliverable") => void;
  clientEmailSender: string;
}

export const useOrderDeliverable = () => {
  const [orderDeliverableFile, setOrderDeliverableFile] = useState<{ name: string; size: string; base64: string } | null>(null);
  const [isSendingDeliverableEmail, setIsSendingDeliverableEmail] = useState(false);
  const [deliverableSuccessMsg, setDeliverableSuccessMsg] = useState("");

  const handleDeliverableFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 40 * 1024 * 1024) {
      alert("File size exceeds 40MB limit for email attachments. Please compress or optimize the file.");
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setOrderDeliverableFile({
        name: file.name,
        size: sizeFormatted,
        base64,
      });
      setDeliverableSuccessMsg("");
    };
    reader.readAsDataURL(file);
  };

  return {
    orderDeliverableFile,
    setOrderDeliverableFile,
    isSendingDeliverableEmail,
    setIsSendingDeliverableEmail,
    deliverableSuccessMsg,
    setDeliverableSuccessMsg,
    handleDeliverableFileChange
  };
};

export const OrderDeliverableSection: React.FC<OrderDeliverableSectionProps & ReturnType<typeof useOrderDeliverable>> = ({
  currentOrder,
  setCurrentOrder,
  onOrderUpdated,
  handleStatusChange,
  setIsClientEmailComposerOpen,
  handleApplyClientEmailTemplate,
  clientEmailSender,
  orderDeliverableFile,
  setOrderDeliverableFile,
  isSendingDeliverableEmail,
  setIsSendingDeliverableEmail,
  deliverableSuccessMsg,
  setDeliverableSuccessMsg,
  handleDeliverableFileChange
}) => {
  const handleDirectDeliverableEmailDispatch = async () => {
    if (!currentOrder || !currentOrder.client_email) {
      alert("Client email address is missing on this order.");
      return;
    }
    if (!orderDeliverableFile) {
      alert("Please attach the final master presentation file (.pptx / .zip) first.");
      return;
    }

    setIsSendingDeliverableEmail(true);
    setDeliverableSuccessMsg("");

    const clientName = currentOrder.client_name?.trim() || "there";
    const orderRef = currentOrder.id ? `#${currentOrder.id.slice(0, 8)}` : "your order";
    const serviceName = currentOrder.service_type || "Presentation Design";
    const deliverableSubject = `Final Master Presentation Deliverable: ${serviceName} (${orderRef})`;
    const deliverableBody = `Hi ${clientName},

We are thrilled to present your finalized master presentation deck!

Attached to this email is your presentation file (${orderDeliverableFile.name}, ${orderDeliverableFile.size}). Every slide has been tailored to your specifications with executive typography, balanced visual hierarchy, and polished design.

Project Summary:
• Service: ${serviceName}
• Scope: ${currentOrder.slide_count || "Custom"} Slides
• Format: Master Presentation (.pptx)

If you have any questions or require any adjustments, please reply directly to this email and our team will gladly assist you.

Thank you for partnering with SlideBee!

Best regards,
SlideBee Design Studio
hello@theslidebee.com`;

    const escapedBody = deliverableBody
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const formattedHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">SlideBee Studio</h1>
          <p style="color: #726F6D; font-size: 13px; margin-top: 4px; font-weight: 500;">Executive Presentation Design on Demand</p>
        </div>
        <div style="background-color: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 14px; color: #111111; line-height: 1.7; white-space: pre-wrap;">${escapedBody}</div>
        </div>
        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #726F6D; line-height: 1.5;">
          <p style="margin: 0;"><strong>SlideBee Design Studio</strong></p>
          <p style="margin: 4px 0 0 0;">Official Communications &middot; Bangalore, Karnataka, India</p>
        </div>
      </div>
    `;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("slidebee_admin_key") ? { "x-slidebee-admin-key": localStorage.getItem("slidebee_admin_key")! } : {}),
        },
        body: JSON.stringify({
          to: currentOrder.client_email.trim(),
          fromEmail: clientEmailSender || "design@theslidebee.com",
          fromName: "SlideBee Design Studio",
          replyTo: clientEmailSender || "design@theslidebee.com",
          subject: deliverableSubject,
          html: formattedHtml,
          text: deliverableBody,
          attachments: [
            {
              filename: orderDeliverableFile.name,
              content: orderDeliverableFile.base64,
            },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const deliverableName = orderDeliverableFile.name;
        const sentTimestamp = new Date().toISOString();

        await handleStatusChange("completed");
        const updated = {
          ...currentOrder,
          status: "completed",
          deliverable_name: deliverableName,
          deliverable_sent_at: sentTimestamp
        };
        setCurrentOrder(updated);
        if (onOrderUpdated) onOrderUpdated(updated);

        setDeliverableSuccessMsg(
          `Master deliverable (${deliverableName}) successfully dispatched to ${currentOrder.client_email}! Status updated to Completed.`
        );
      } else {
        alert(data.error || "Failed to dispatch deliverable email. Please try again.");
      }
    } catch (err: any) {
      console.error("Deliverable dispatch error:", err);
      alert(`Error sending deliverable: ${err?.message || err}`);
    } finally {
      setIsSendingDeliverableEmail(false);
    }
  };

  return (
    <OrderDeliverableUploader
      deliverableSentAt={currentOrder.deliverable_sent_at}
      status={currentOrder.status}
      deliverableName={currentOrder.deliverable_name}
      clientEmail={currentOrder.client_email}
      orderDeliverableFile={orderDeliverableFile}
      onDeliverableFileChange={handleDeliverableFileChange}
      onRemoveDeliverableFile={() => setOrderDeliverableFile(null)}
      deliverableSuccessMsg={deliverableSuccessMsg}
      isSendingDeliverableEmail={isSendingDeliverableEmail}
      onOpenEmailComposer={() => {
        setIsClientEmailComposerOpen(true);
        handleApplyClientEmailTemplate("deliverable");
      }}
      onSendDeliverableEmail={handleDirectDeliverableEmailDispatch}
    />
  );
};
