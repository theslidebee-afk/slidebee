import { useState } from "react";
import { ORDER_MILESTONES, getMilestoneIndex } from "../shared/adminConstants";

export const useClientEmailComposer = (
  currentOrder: any,
  setCurrentOrder: (order: any) => void,
  onOrderUpdated?: (updatedOrder: any) => void,
  handleStatusChange?: (statusKey: string) => Promise<void>,
  orderDeliverableFile?: { name: string; size: string; base64: string } | null,
  setDeliverableSuccessMsg?: (msg: string) => void
) => {
  const [isClientEmailComposerOpen, setIsClientEmailComposerOpen] = useState(false);
  const [clientEmailSender, setClientEmailSender] = useState<string>("design@theslidebee.com");
  const [clientEmailSubject, setClientEmailSubject] = useState("");
  const [clientEmailBody, setClientEmailBody] = useState("");
  const [isSendingClientEmail, setIsSendingClientEmail] = useState(false);
  const [clientEmailStatus, setClientEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleApplyClientEmailTemplate = (templateType: "milestone" | "assets" | "ready" | "deliverable") => {
    const clientName = currentOrder.client_name?.trim() || "there";
    const orderRef = currentOrder.id ? `#${currentOrder.id.slice(0, 8)}` : "your order";
    const serviceName = currentOrder.service_type || "Presentation Design";

    if (templateType === "assets") {
      setClientEmailSubject(`Additional Assets Needed: ${serviceName} (${orderRef})`);
      setClientEmailBody(
`Hi ${clientName},

Thank you for trusting SlideBee with your presentation design.

To make sure your slides match executive standards, could you please share:
• High-resolution logos or vector files (.SVG or .PNG with transparent background)
• Brand guidelines, color palette, or approved typography (if available)
• Any raw data spreadsheets, charts, or speaking outlines

You can reply directly to this email or share an updated Google Drive folder link.

Warm regards,
SlideBee Design Studio`
      );
    } else if (templateType === "ready") {
      setClientEmailSubject(`Your Presentation Draft is Ready for Review! (${orderRef})`);
      setClientEmailBody(
`Hi ${clientName},

Exciting news! Your presentation draft for ${serviceName} is now ready for your review.

Please review the deliverable at your earliest convenience and let us know your thoughts. As a reminder, you have 2 full rounds of executive revisions included with your project.

Looking forward to your feedback!

Best regards,
SlideBee Design Studio`
      );
    } else if (templateType === "deliverable") {
      setClientEmailSubject(`Final Presentation Deliverable: ${serviceName} (${orderRef})`);
      setClientEmailBody(
`Hi ${clientName},

We are delighted to deliver your completed SlideBee master presentation!

Attached to this email, you will find your master presentation file (${orderDeliverableFile?.name || "Master_Deck.pptx"}). Every slide has been designed and polished in full accordance with your project specifications and requirements.

Project Summary:
• Service: ${serviceName}
• Scope: ${currentOrder.slide_count || "Custom"} Slides
• Format: Master Presentation (.pptx)

If you have any feedback or require any adjustments, please reply directly to this email and our creative team will assist you immediately.

Thank you for partnering with SlideBee!

Best regards,
SlideBee Design Studio
hello@theslidebee.com`
      );
    } else {
      const currentMilestone = ORDER_MILESTONES[getMilestoneIndex(currentOrder.status)]?.fullLabel || currentOrder.status;
      setClientEmailSubject(`SlideBee Milestone Update: ${serviceName} (${orderRef})`);
      setClientEmailBody(
`Hi ${clientName},

We wanted to provide a quick milestone update on your presentation design project.

Current Stage: ${currentMilestone}

Our creative team is actively progressing through your requirements according to your brief. We will notify you as soon as the review deliverables are assembled.

Best regards,
SlideBee Design Studio`
      );
    }
  };

  const handleSendClientEmail = async () => {
    if (!currentOrder || !currentOrder.client_email) {
      setClientEmailStatus({ type: "error", message: "Client email address is missing." });
      return;
    }
    if (!clientEmailSubject.trim() || !clientEmailBody.trim()) {
      setClientEmailStatus({ type: "error", message: "Please provide both a subject and a message body." });
      return;
    }

    setIsSendingClientEmail(true);
    setClientEmailStatus(null);

    const senderDisplayName = clientEmailSender.includes("support")
      ? "SlideBee Support"
      : clientEmailSender.includes("hello")
      ? "SlideBee Studio"
      : "SlideBee Design Studio";

    const escapedBody = clientEmailBody
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

    const attachmentsPayload: any[] = [];
    if (orderDeliverableFile && orderDeliverableFile.base64) {
      attachmentsPayload.push({
        filename: orderDeliverableFile.name,
        content: orderDeliverableFile.base64,
      });
    }

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("slidebee_admin_key") ? { "x-slidebee-admin-key": localStorage.getItem("slidebee_admin_key")! } : {}),
        },
        body: JSON.stringify({
          to: currentOrder.client_email.trim(),
          fromEmail: clientEmailSender,
          fromName: senderDisplayName,
          replyTo: clientEmailSender,
          subject: clientEmailSubject.trim(),
          html: formattedHtml,
          text: clientEmailBody.trim(),
          attachments: attachmentsPayload.length > 0 ? attachmentsPayload : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setClientEmailStatus({
          type: "success",
          message: `Email successfully dispatched from ${clientEmailSender} to ${currentOrder.client_email}${attachmentsPayload.length > 0 ? " with attached master presentation!" : "!"}`,
        });

        if (attachmentsPayload.length > 0 && handleStatusChange) {
          const deliverableName = orderDeliverableFile?.name || "Presentation_Deliverable.pptx";
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
          if (setDeliverableSuccessMsg) {
            setDeliverableSuccessMsg(
              `Master presentation file (${deliverableName}) sent to ${currentOrder.client_email} and order marked as Completed!`
            );
          }
        }
      } else {
        setClientEmailStatus({
          type: "error",
          message: data.error || "Failed to dispatch email.",
        });
      }
    } catch (err: any) {
      setClientEmailStatus({
        type: "error",
        message: err.message || "Network error while connecting to email router.",
      });
    } finally {
      setIsSendingClientEmail(false);
    }
  };

  return {
    isClientEmailComposerOpen,
    setIsClientEmailComposerOpen,
    clientEmailSender,
    setClientEmailSender,
    clientEmailSubject,
    setClientEmailSubject,
    clientEmailBody,
    setClientEmailBody,
    isSendingClientEmail,
    clientEmailStatus,
    setClientEmailStatus,
    handleApplyClientEmailTemplate,
    handleSendClientEmail
  };
};
