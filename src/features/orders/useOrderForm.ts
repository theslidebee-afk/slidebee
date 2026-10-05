import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { d1 } from "../../lib/d1";
import { sendOrderConfirmationEmail, sendEcommerceOrderConfirmationEmail } from "../../lib/email";
import { presentationServices, type OrderFormData } from "./types";

export function useOrderForm() {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get("service") || searchParams.get("ref") || searchParams.get("type");
  const isEcommerce = (serviceParam?.toLowerCase().includes("ecommerce")) ?? false;

  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: isEcommerce ? "Full-Stack Ecommerce Store (₹25,000 Package)" : "Presentation Redesign",
    slideCount: isEcommerce ? "50–200 Products (Standard Store)" : "10–25 Slides",
    timeline: isEcommerce ? "7-Day Fast Launch" : "48h Fast Turnaround",
    format: isEcommerce ? "Full-Stack Store + Razorpay Checkout + Admin Hub" : "Master PowerPoint (.pptx)",
    stylePreference: isEcommerce ? "Modern & High-Conversion (Clean & Bold)" : "Modern & High-Impact",
    driveLink: "",
    projectNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isEcommerce) {
      setFormData((prev) => ({
        ...prev,
        service: "Full-Stack Ecommerce Store (₹25,000 Package)",
        slideCount: "50–200 Products (Standard Store)",
        timeline: "7-Day Fast Launch",
        format: "Full-Stack Store + Razorpay Checkout + Admin Hub",
        stylePreference: "Modern & High-Conversion (Clean & Bold)",
      }));
      return;
    }

    const tierParam = searchParams.get("tier");

    if (serviceParam) {
      const paramDecoded = decodeURIComponent(serviceParam).trim();
      const paramLower = paramDecoded.toLowerCase();
      // 1. Exact match
      const exactMatch = presentationServices.find((s) => s.toLowerCase() === paramLower);
      if (exactMatch) {
        setFormData((prev) => ({ ...prev, service: exactMatch }));
      } else {
        // 2. Keyword-based intelligent match
        const matched = presentationServices.find((s) => {
          const sLower = s.toLowerCase();
          return (
            sLower.includes(paramLower) ||
            paramLower.includes(sLower) ||
            (paramLower.includes("pitch") && sLower.includes("pitch")) ||
            (paramLower.includes("keynote") && sLower.includes("keynote")) ||
            (paramLower.includes("board") && sLower.includes("keynote")) ||
            (paramLower.includes("template") && sLower.includes("template")) ||
            (paramLower.includes("data") && sLower.includes("data")) ||
            (paramLower.includes("financial") && sLower.includes("data")) ||
            (paramLower.includes("sales") && sLower.includes("sales")) ||
            (paramLower.includes("proposal") && sLower.includes("sales")) ||
            (paramLower.includes("marketing") && sLower.includes("sales")) ||
            (paramLower.includes("redesign") && sLower.includes("redesign"))
          );
        });
        if (matched) {
          setFormData((prev) => ({ ...prev, service: matched }));
        } else {
          setFormData((prev) => ({ ...prev, service: paramDecoded }));
        }
      }
    } else if (tierParam) {
      if (tierParam.toLowerCase().includes("starter") || tierParam.toLowerCase().includes("micro")) {
        setFormData((prev) => ({ ...prev, slideCount: "1–10 Slides (Micro Deck)" }));
      } else if (tierParam.toLowerCase().includes("growth") || tierParam.toLowerCase().includes("pro")) {
        setFormData((prev) => ({ ...prev, slideCount: "10–25 Slides (Standard Pitch / Keynote)" }));
      } else if (tierParam.toLowerCase().includes("enterprise")) {
        setFormData((prev) => ({ ...prev, slideCount: "50+ Slides (Enterprise Deck)", service: "Master Branded Template Systems" }));
      }
    }
  }, [searchParams, isEcommerce, serviceParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Please provide your full name and email address so our creative lead can confirm your scope.");
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().replace(/\D/g, "").length < 7) {
      setFormError("Please provide a valid phone number (mandatory field to confirm scope & timeline).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError("Please provide a valid business email address.");
      return;
    }

    if (formData.driveLink.trim() && !/^https?:\/\//i.test(formData.driveLink.trim())) {
      setFormError("Please provide a valid asset link starting with https:// or http://");
      return;
    }

    setIsSubmitting(true);

    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const generatedId = `SB-${100000 + (randomArray[0] % 900000)}`;

    try {
      // 1. Save to D1
      const { error: sbError } = await d1.from("orders").insert([
        {
          order_reference: generatedId,
          service_type: formData.service,
          slide_count: formData.slideCount,
          timeline: formData.timeline,
          formats: [formData.format],
          style_preference: formData.stylePreference,
          drive_url: formData.driveLink,
          project_brief: formData.projectNotes,
          full_name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company,
          phone: formData.phone,
          status: "pending"
        }
      ]);

      if (sbError) {
        console.warn("D1 orders notice:", sbError.message);
      }

      // 2. Dispatch Automated Confirmation Email via Resend
      if (isEcommerce) {
        sendEcommerceOrderConfirmationEmail({
          clientName: formData.name,
          clientEmail: formData.email,
          serviceType: formData.service,
          catalogSize: formData.slideCount,
          timeline: formData.timeline,
          stylePreference: formData.stylePreference,
          driveLink: formData.driveLink,
          projectNotes: formData.projectNotes,
          company: formData.company,
          phone: formData.phone,
        }).catch((err: any) => console.warn("Ecommerce email dispatch notice:", err));
      } else {
        sendOrderConfirmationEmail({
          clientName: formData.name,
          clientEmail: formData.email,
          serviceType: formData.service,
          slideCount: formData.slideCount,
          rushDelivery: formData.timeline.includes("24h") || formData.timeline.includes("rush"),
          driveLink: formData.driveLink
        }).catch((err: any) => console.warn("Email dispatch notice:", err));
      }

      // 3. Local backup
      const savedOrders = JSON.parse(localStorage.getItem("slidebee_orders") || "[]");
      savedOrders.push({ ...formData, orderId: generatedId, createdAt: new Date().toISOString() });
      localStorage.setItem("slidebee_orders", JSON.stringify(savedOrders));
    } catch (err: any) {
      console.warn("Order submission fallback to local storage:", err);
      const savedOrders = JSON.parse(localStorage.getItem("slidebee_orders") || "[]");
      savedOrders.push({ ...formData, orderId: generatedId, createdAt: new Date().toISOString() });
      localStorage.setItem("slidebee_orders", JSON.stringify(savedOrders));
    } finally {
      setIsSubmitting(false);
      setOrderId(generatedId);
      setIsSuccess(true);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setFormError(null);
  };

  return {
    isEcommerce,
    formData,
    setFormData,
    isSubmitting,
    isSuccess,
    orderId,
    formError,
    handleSubmit,
    resetForm
  };
}
