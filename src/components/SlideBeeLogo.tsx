interface SlideBeeLogoProps {
  className?: string;
  variant?: "light" | "dark" | "yellow" | "auto";
  size?: "sm" | "md" | "lg" | "xl";
}

export default function SlideBeeLogo({
  className = "",
  variant = "auto",
  size = "md"
}: SlideBeeLogoProps) {
  const heightMap = {
    sm: "h-7",
    md: "h-9 md:h-10",
    lg: "h-12 md:h-14",
    xl: "h-16 md:h-20"
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {variant === "dark" ? (
        <img
          src="/Slidebee_BlackBG.svg"
          alt="SlideBee"
          className={`${heightMap[size]} w-auto object-contain drop-shadow-sm`}
        />
      ) : variant === "yellow" ? (
        <img
          src="/Slidebee_Yellowbg.svg"
          alt="SlideBee"
          className={`${heightMap[size]} w-auto object-contain`}
        />
      ) : variant === "light" ? (
        <img
          src="/Slidebee_WhiteBG.svg"
          alt="SlideBee"
          className={`${heightMap[size]} w-auto object-contain`}
        />
      ) : (
        /* Auto mode - switch based on parent theme */
        <>
          <img
            src="/Slidebee_WhiteBG.svg"
            alt="SlideBee"
            className={`dark:hidden ${heightMap[size]} w-auto object-contain`}
          />
          <img
            src="/Slidebee_BlackBG.svg"
            alt="SlideBee"
            className={`hidden dark:block ${heightMap[size]} w-auto object-contain`}
          />
        </>
      )}
    </div>
  );
}
