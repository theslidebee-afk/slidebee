import { usePageSEO } from "../hooks/usePageSEO";
import {
  useOrderForm,
  OrderSuccessCard,
  OrderFormSteps
} from "../features/orders";

export default function OrderNow() {
  const {
    isEcommerce,
    formData,
    setFormData,
    isSubmitting,
    isSuccess,
    orderId,
    formError,
    handleSubmit,
    resetForm
  } = useOrderForm();

  usePageSEO(
    isEcommerce
      ? {
          title: "Launch Your Ecommerce Store (₹25,000) | SlideBee",
          description:
            "Submit your ecommerce store brief. Full-stack store with 500 products, Razorpay checkout, Cloudflare deployment, and admin dashboard."
        }
      : {
          title: "Order Custom Presentation Design | SlideBee",
          description:
            "Submit your presentation design brief. 24h–48h turnaround, senior art director assignment, signed NDA, 100% editable PPTX."
        }
  );

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-20 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
            {isEcommerce
              ? "SlideBee Engineering Desk & Store Launch Intake"
              : "SlideBee Project Request & Quote Intake"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] mb-3 leading-tight">
            {isEcommerce ? "Launch Your Ecommerce Store (₹25,000)" : "Start Your Presentation Project"}
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto">
            {isEcommerce
              ? "Provide your store requirements, catalog size, and branding below. Our lead full-stack engineer will review your brief and send your deployment blueprint within 2 hours."
              : "Provide your project details below. Our senior art director will review your scope and send a confirmed proposal and quote within 2 hours."}
          </p>
        </div>

        {isSuccess ? (
          <OrderSuccessCard
            orderId={orderId}
            formData={formData}
            isEcommerce={isEcommerce}
            onReset={resetForm}
          />
        ) : (
          <OrderFormSteps
            formData={formData}
            setFormData={setFormData}
            isEcommerce={isEcommerce}
            isSubmitting={isSubmitting}
            formError={formError}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
