import React, { useState } from "react";
import { Sliders } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImg: string;
  afterImg: string;
  beforeTitle: string;
  afterTitle: string;
  idealFor?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImg,
  afterImg,
  beforeTitle,
  afterTitle,
  idealFor
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div>
      {/* Interactive Before/After Comparison Slider */}
      <div className="relative aspect-[16/9] w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/30 select-none mb-6">
        {/* Background: After Image */}
        <img
          src={afterImg}
          alt={afterTitle}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 right-4 bg-[#111111]/85 backdrop-blur-md text-[#FCBF14] text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[#FCBF14]/30 pointer-events-none shadow-sm z-10">
          {afterTitle}
        </div>

        {/* Foreground: Before Image Clipped */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImg}
            alt={beforeTitle}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#111111] text-xs font-extrabold px-3 py-1.5 rounded-lg border border-primary/40 pointer-events-none shadow-sm z-10">
            {beforeTitle}
          </div>
        </div>

        {/* Draggable Vertical Divider */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#FCBF14] shadow-[0_0_15px_rgba(252,191,20,0.8)] cursor-ew-resize z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111111] border-2 border-[#FCBF14] flex items-center justify-center text-[#FCBF14] shadow-lg pointer-events-none">
            <Sliders size={16} />
          </div>
        </div>

        {/* Full Slider Input Controller */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
          aria-label="Before and After visual slider"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#726F6D] font-medium pt-2">
        {idealFor && (
          <span className="mb-2 sm:mb-0">
            <strong>Best suited for:</strong> {idealFor}
          </span>
        )}
        <span className="italic">
          Drag slider left or right to inspect slide improvements
        </span>
      </div>
    </div>
  );
};
