interface SlideBeeLogoProps {
  className?: string;
  variant?: "light" | "dark" | "auto";
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
          src="/slidebee_logo_dark.svg"
          alt="SlideBee"
          className={`${heightMap[size]} w-auto object-contain drop-shadow-sm`}
        />
      ) : variant === "light" ? (
        <img
          src="/slidebee_logo_light.svg"
          alt="SlideBee"
          className={`${heightMap[size]} w-auto object-contain`}
        />
      ) : (
        /* Auto mode - switch based on parent theme */
        <>
          <img
            src="/slidebee_logo_light.svg"
            alt="SlideBee"
            className={`dark:hidden ${heightMap[size]} w-auto object-contain`}
          />
          <img
            src="/slidebee_logo_dark.svg"
            alt="SlideBee"
            className={`hidden dark:block ${heightMap[size]} w-auto object-contain`}
          />
        </>
      )}
    </div>
  );
}
