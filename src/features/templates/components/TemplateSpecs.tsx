import { CheckCircle2 } from "lucide-react";
import type { StoreTemplate } from "../../../modules/StudioStoreClient";

interface TemplateSpecsProps {
  template: StoreTemplate;
}

export function TemplateSpecs({ template }: TemplateSpecsProps) {
  return (
    <>
      {/* What's Included Checklist */}
      <div className="pt-4 border-t border-[#111111]/8 space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
          What Is Included in This Deck:
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {template.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-[#111111] font-medium">
              <CheckCircle2 size={14} className="text-primary-amber shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="pt-4 border-t border-[#111111]/8 text-[11px] space-y-2 text-[#726F6D]">
        <div className="flex justify-between items-center">
          <span>Deliverable Formats:</span>
          <div className="flex flex-wrap gap-1.5 justify-end">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/25 text-[#111111] border border-primary/40">
              PPTX Vector
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#111111]/10 text-[#111111] border border-[#111111]/15">
              JPEG HD Slides
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#111111]/10 text-[#111111] border border-[#111111]/15">
              MP4 Motion Deck
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center py-0.5">
          <span>Supported Software:</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {(template.formats && template.formats.length > 0
              ? template.formats
              : ["PowerPoint", "Google Slides", "Keynote"]
            ).map((fmt, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#111111]/5 text-[#111111] border border-[#111111]/10"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <span>Library Tier:</span>
          <strong className={!template.is_premium ? "text-emerald-600 font-bold" : "text-[#111111]"}>
            {!template.is_premium ? "Free Community Tier (3 Daily Downloads)" : "Pro Master Collection"}
          </strong>
        </div>
        <div className="flex justify-between">
          <span>Aspect Ratio:</span>
          <strong className="text-[#111111]">16:9 Full HD Widescreen (1920x1080)</strong>
        </div>
        <div className="flex justify-between">
          <span>Vector Geometry:</span>
          <strong className="text-[#111111]">100% Fully Editable Shapes & Colors</strong>
        </div>
        <div className="flex justify-between">
          <span>License:</span>
          <strong className="text-[#111111]">Perpetual Commercial Royalty-Free</strong>
        </div>
      </div>
    </>
  );
}
